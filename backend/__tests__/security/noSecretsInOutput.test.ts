/**
 * Secrets never reach logs or responses (F2b T6). Sentinel values stand in for the operator,
 * oracle and JWT secrets; the escrow flows run through success and failure paths and every
 * console line and response body is searched for them.
 */
import express from 'express'
import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('../../src/services/orm/prismaDatabase', () => ({ PrismaDatabase: class {} }))
jest.mock('../../src/services/hedera', () => ({ HederaService: class {} }))
jest.mock('../../src/services/hfs', () => ({ hfsService: { createAuditReport: jest.fn(async () => '0.0.5005') } }))
jest.mock('../../src/services/hcs', () => ({ hcsService: { publishAuditRecord: jest.fn(async () => '0.0.1001@1.2') } }))

const SECRETS = {
  HEDERA_PRIVATE_KEY: 'sentinel-operator-key-7f3a9c',
  ORACLE_PRIVATE_KEY: 'sentinel-oracle-key-4b81d2',
  JWT_SECRET: 'sentinel-jwt-secret-that-is-long-enough-0123456789'
}
Object.assign(process.env, SECRETS)

import paymentRoutes from '../../src/routes/payments'
import agreementRoutes from '../../src/routes/agreements'
import { OracleService } from '../../src/services/oracle'
import { EscrowError } from '../../src/services/escrow'

const MANAGER = { id: 3, email: 'manager@test.local', name: 'Manager', role: 'MANAGER', is_active: true }
const token = jwt.sign({ userId: MANAGER.id, email: MANAGER.email, role: MANAGER.role }, SECRETS.JWT_SECRET, {
  algorithm: 'HS256', expiresIn: '1h', issuer: 'wata-chain', audience: 'wata-users'
})
const AUDIT = 'ab'.repeat(32)

let output: string[]

beforeEach(() => {
  output = []
  for (const level of ['log', 'error', 'warn', 'info'] as const) {
    jest.spyOn(console, level).mockImplementation((...args: unknown[]) => {
      output.push(args.map(a => (a instanceof Error ? `${a.message}\n${a.stack}` : typeof a === 'string' ? a : JSON.stringify(a))).join(' '))
    })
  }
})

afterEach(() => jest.restoreAllMocks())

function expectNoSecrets(texts: string[]) {
  const all = texts.join('\n')
  for (const value of Object.values(SECRETS)) {
    expect(all).not.toContain(value)
  }
}

function fakeDb(): any {
  return {
    getUserById: async (id: number) => (id === MANAGER.id ? MANAGER : null),
    getAgreement: async () => ({
      id: 1, blockchain_id: 0, producer_address: '0x' + '11'.repeat(20), period_amount: '100', score_threshold: 70, governance_mode: 'AUTO'
    }),
    getBatchesByAgreement: async () => [{ id: 9, score: 0.9, audit_hash: AUDIT, period_id: 9 }],
    getPaymentsByAgreement: async () => [],
    createPayment: async () => 1,
    recordPaymentRelease: async () => undefined,
    markPaymentFailed: async () => undefined,
    attachPaymentHcs: async () => undefined,
    createBatch: async () => 11,
    createOracleLog: async () => 1,
    updateBatchStatus: async () => undefined,
    markReadingsAsValidated: async () => undefined,
    attachBatchLedgerReferences: async () => undefined,
    linkAgreementOnchain: async () => true
  }
}

function fakeEscrow(failing: boolean): any {
  return {
    getPeriod: async () => ({ state: 'Approved', auditHash: AUDIT, score: 90, scoreVersion: 1, approvalDeadline: 0 }),
    getAgreement: async () => ({ producer: '0x' + '11'.repeat(20), periodAmount: '100', scoreThreshold: 70, mode: 'AUTO', active: true }),
    release: async () => {
      if (failing) throw new EscrowError('TX_FAILED', 'CONTRACT_REVERT_EXECUTED')
      return { outcome: 'released', amount: '100', producer: '0xp', transactionId: '0.0.1@1.2', transactionHash: '0x' + 'cd'.repeat(48) }
    },
    submitBatch: async () => {
      if (failing) throw new EscrowError('TX_FAILED', 'CONTRACT_REVERT_EXECUTED')
      return { transactionId: '0.0.1@1.2', transactionHash: '0x' + 'cd'.repeat(48), state: 'Approved' }
    }
  }
}

describe.each([['success', false], ['failure', true]])('escrow flows on %s', (_label, failing) => {
  it('never print or return a secret', async () => {
    const db = fakeDb()
    const escrow = fakeEscrow(failing)
    const audit = { publishAuditRecord: async () => { if (failing) throw new Error('hcs down'); return '0.0.7@1.2' } }
    const app = express()
    app.use(express.json())
    app.use('/api/payments', paymentRoutes({} as any, db, { escrow, audit }))
    // The link route needs an agreement that is not linked yet
    const unlinked = { ...db, getAgreement: async () => ({ ...(await db.getAgreement()), blockchain_id: null }) }
    app.use('/api/agreements', agreementRoutes({} as any, unlinked, escrow))

    const bodies: string[] = []
    const auth = { Authorization: `Bearer ${token}` }
    bodies.push(JSON.stringify((await request(app).post('/api/payments/trigger-check/1').set(auth).send({})).body))
    bodies.push(JSON.stringify((await request(app).post('/api/agreements/1/link-onchain').set(auth).send({ onchainAgreementId: 0 })).body))

    process.env.SCORE_VERSION = '1'
    const oracle = new OracleService(db, {} as any, escrow)
    const batch: any = {
      auditHash: AUDIT, signature: 'sig', score: 0.8, readings: [{ id: 1 }], validReadings: [{ id: 1 }],
      invalidReadings: [], averageTurbidity: 3, medianTurbidity: 3, outliersDetected: 0
    }
    await oracle.submitValidatedBatch(1, batch).catch((error: Error) => bodies.push(error.message))

    expect(output.length + bodies.length).toBeGreaterThan(0)
    expectNoSecrets([...output, ...bodies])
  })
})
