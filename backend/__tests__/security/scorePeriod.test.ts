/**
 * Period score from measurements (F3c). The oracle scores an agreement's station over a period with
 * the pilot rule, keeps a canonical audit document whose SHA-256 goes on-chain, and never scores the
 * same data twice: overlapping periods of one agreement are refused, and only a period that was not
 * submitted yet can be retried. No score means nothing goes on-chain.
 */
import crypto from 'crypto'

// The HFS/HCS modules build SDK clients from the environment on import (route test below)
jest.mock('../../src/services/hfs', () => ({ hfsService: {} }))
jest.mock('../../src/services/hcs', () => ({ hcsService: {} }))
import fs from 'fs'
import path from 'path'
import { ScorePeriodOracle, ScorePeriodError } from '../../src/services/scorePeriod'
import { PILOT_RULE } from '../../src/score/rules'
import { ineaRowsToMeasurementInputs } from '../../src/score/inea'

// Real RH-VIII measurements (MC0002, 2024) from the INEA fixture, shaped as stored rows
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'inea-rh8-pilot.json'), 'utf8')).rows
const stored = ineaRowsToMeasurementInputs(
  fixture.filter((r: any) => r.estacao === '00RJ04MC0002' && r.data.startsWith('2024')).map((r: any, i: number) => ({ ...r, aba: '2024', linha: String(i) })),
  'b930b9e0'
).map((m, i) => ({
  id: i + 1, station_code: m.stationCode, parameter: m.parameter, value: m.value, unit: m.unit,
  qualifier: m.qualifier, sampled_at: new Date(m.sampledAt), source: m.source, source_ref: m.sourceRef
}))

const FROM = new Date('2024-01-01T00:00:00Z')
const TO = new Date('2024-12-31T23:59:59Z')
const TX_ID = '0.0.1013@1700000000.000000001'
const TX_HASH = '0x' + 'cd'.repeat(48)

let db: any
let escrow: any
let audit: any
let oracle: ScorePeriodOracle

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined)
  db = {
    getAgreement: jest.fn(async () => ({ id: 1, blockchain_id: 0, station_code: 'MC0002', producer_address: '0x' + '11'.repeat(20) })),
    getMeasurements: jest.fn(async () => stored),
    reserveScoreBatch: jest.fn(async () => ({ batchId: 21, resumed: false })),
    updateBatchStatus: jest.fn(async () => undefined),
    createOracleLog: jest.fn(async () => 1),
    attachBatchLedgerReferences: jest.fn(async () => undefined)
  }
  escrow = { submitBatch: jest.fn(async () => ({ transactionId: TX_ID, transactionHash: TX_HASH, state: 'Approved' })) }
  audit = { publishAuditRecord: jest.fn(async () => '0.0.7@1.2') }
  oracle = new ScorePeriodOracle(db, () => escrow, async () => audit)
})

afterEach(() => jest.restoreAllMocks())

describe('ScorePeriodOracle.scorePeriod', () => {
  it('scores the station period with the pilot rule and submits it with the rule version', async () => {
    const outcome = await oracle.scorePeriod(1, FROM, TO)

    expect(db.getMeasurements).toHaveBeenCalledWith('MC0002', FROM, TO)
    expect(outcome).toMatchObject({ status: 'submitted', batchId: 21, periodId: 21, transactionId: TX_ID })
    const submitted = escrow.submitBatch.mock.calls[0][0]
    expect(submitted).toMatchObject({ agreementId: 0, periodId: 21, scoreVersion: PILOT_RULE.version })
    expect(submitted.score).toBe((outcome as any).onchainScore)
    expect(db.updateBatchStatus).toHaveBeenCalledWith(21, 'submitted', expect.any(Date), 21)
  })

  it('puts on-chain the SHA-256 of the stored canonical audit document', async () => {
    const outcome: any = await oracle.scorePeriod(1, FROM, TO)

    const reserved = db.reserveScoreBatch.mock.calls[0][0]
    const digest = crypto.createHash('sha256').update(reserved.auditDocument).digest('hex')
    expect(reserved.auditHash).toBe(digest)
    expect(escrow.submitBatch.mock.calls[0][0].auditHash).toBe(digest)
    expect(outcome.auditHash).toBe(digest)

    const document = JSON.parse(reserved.auditDocument)
    expect(document).toMatchObject({ agreementId: 1, onchainAgreementId: 0, station: 'MC0002', rule: { version: 1 } })
    expect(document.measurements).toHaveLength(stored.length)
    expect(document.measurements[0]).toMatchObject({ ref: expect.stringContaining('xlsx:b930b9e0') })
    expect(reserved).toMatchObject({ agreementId: 1, periodStart: FROM, periodEnd: TO, scoreVersion: 1, readingsCount: stored.length })
  })

  it('gives the same audit hash for the same measurements in any order', async () => {
    await oracle.scorePeriod(1, FROM, TO)
    db.getMeasurements.mockResolvedValueOnce([...stored].reverse())
    await oracle.scorePeriod(1, FROM, TO)
    expect(db.reserveScoreBatch.mock.calls[1][0].auditHash).toBe(db.reserveScoreBatch.mock.calls[0][0].auditHash)
  })

  it('sends nothing on-chain when the period has no score', async () => {
    db.getMeasurements.mockResolvedValueOnce(stored.filter((m: any) => m.parameter !== 'nitrato_mg_L_N'))

    const outcome: any = await oracle.scorePeriod(1, FROM, TO)

    expect(outcome.status).toBe('no_score')
    expect(outcome.report.status).toBe('insufficient_coverage')
    expect(db.reserveScoreBatch).not.toHaveBeenCalled()
    expect(escrow.submitBatch).not.toHaveBeenCalled()
  })

  it('refuses a period overlapping another period of the agreement', async () => {
    db.reserveScoreBatch.mockResolvedValueOnce({ overlap: 9 })
    await expect(oracle.scorePeriod(1, FROM, TO)).rejects.toMatchObject({ code: 'OVERLAP' })
    expect(escrow.submitBatch).not.toHaveBeenCalled()
  })

  it.each([
    ['agreement without a station', { id: 1, blockchain_id: 0, station_code: null }],
    ['agreement not linked on-chain', { id: 1, blockchain_id: null, station_code: 'MC0002' }]
  ])('refuses an %s', async (_label, agreement) => {
    db.getAgreement.mockResolvedValueOnce(agreement)
    await expect(oracle.scorePeriod(1, FROM, TO)).rejects.toMatchObject({ code: 'NOT_READY' })
    expect(db.getMeasurements).not.toHaveBeenCalled()
  })

  it('refuses an inverted period', async () => {
    await expect(oracle.scorePeriod(1, TO, FROM)).rejects.toBeInstanceOf(ScorePeriodError)
    expect(db.getMeasurements).not.toHaveBeenCalled()
  })

  it('leaves the batch unsubmitted when the escrow call fails, so the same period can be retried', async () => {
    escrow.submitBatch.mockRejectedValueOnce(new Error('CONTRACT_REVERT_EXECUTED'))
    await expect(oracle.scorePeriod(1, FROM, TO)).rejects.toMatchObject({ code: 'LEDGER' })
    expect(db.updateBatchStatus).not.toHaveBeenCalled()
  })

  it('publishes the audit hash to HCS without undoing the submission when HCS fails', async () => {
    await oracle.scorePeriod(1, FROM, TO)
    expect(audit.publishAuditRecord).toHaveBeenCalledWith(expect.objectContaining({ batchId: 21, auditHash: expect.any(String), transactionHash: TX_HASH }))
    expect(db.attachBatchLedgerReferences).toHaveBeenCalledWith(21, { hcsTransactionId: '0.0.7@1.2' })

    audit.publishAuditRecord.mockRejectedValueOnce(new Error('hcs down'))
    await expect(oracle.scorePeriod(1, FROM, TO)).resolves.toMatchObject({ status: 'submitted' })
  })
})

describe('POST /api/oracle/score-period', () => {
  const express = require('express')
  const request = require('supertest')
  const jwt = require('jsonwebtoken')
  const SECRET = 'test-secret-that-is-long-enough-for-hs256-0123456789'
  process.env.JWT_SECRET = SECRET
  const MANAGER = { id: 3, email: 'm@test.local', name: 'M', role: 'MANAGER', is_active: true }
  const token = jwt.sign({ userId: 3, email: MANAGER.email, role: 'MANAGER' }, SECRET, { algorithm: 'HS256', expiresIn: '1h', issuer: 'wata-chain', audience: 'wata-users' })
  let service: any
  let app: any

  beforeEach(() => {
    const oracleRoutes = require('../../src/routes/oracle').default
    service = { scorePeriod: jest.fn(async () => ({ status: 'submitted', batchId: 21 })) }
    app = express()
    app.use(express.json())
    app.use('/api/oracle', oracleRoutes({ getUserById: async (id: number) => (id === 3 ? MANAGER : null) }, {}, { scorePeriod: service }))
  })

  const post = (body: object) => request(app).post('/api/oracle/score-period').set('Authorization', `Bearer ${token}`).send(body)

  it('scores the period and answers 201 when it was submitted, 200 when there is no score', async () => {
    expect((await post({ agreementId: 1, from: '2024-01-01', to: '2024-12-31' })).status).toBe(201)
    expect(service.scorePeriod).toHaveBeenCalledWith(1, new Date('2024-01-01'), new Date('2024-12-31'))
    service.scorePeriod.mockResolvedValueOnce({ status: 'no_score', report: {} })
    expect((await post({ agreementId: 1, from: '2024-01-01', to: '2024-12-31' })).status).toBe(200)
  })

  it.each([
    ['OVERLAP', 409], ['NOT_READY', 409], ['NOT_FOUND', 404], ['INVALID_PERIOD', 400], ['LEDGER', 502]
  ])('maps %s to HTTP %s', async (code, status) => {
    service.scorePeriod.mockRejectedValueOnce(new ScorePeriodError(code as any, 'x'))
    expect((await post({ agreementId: 1, from: '2024-01-01', to: '2024-12-31' })).status).toBe(status)
  })

  it('rejects a malformed body before scoring', async () => {
    expect((await post({ agreementId: '1', from: '2024-01-01', to: '2024-12-31' })).status).toBe(400)
    expect((await post({ agreementId: 1, from: '01/01/2024', to: '2024-12-31' })).status).toBe(400)
    expect(service.scorePeriod).not.toHaveBeenCalled()
  })
})
