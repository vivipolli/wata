/**
 * Wallet-signed escrow calls (F2c). The server never signs approve, reject or deposit: it prepares
 * the call after checking the on-chain state, the wallet signs and sends it, and a deposit is
 * recorded only after the ledger record proves it came from the investor's own address.
 */
import express from 'express'
import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('../../src/services/orm/prismaDatabase', () => ({ PrismaDatabase: class {} }))
jest.mock('../../src/services/hedera', () => ({ HederaService: class {} }))

const JWT_SECRET = 'test-secret-that-is-long-enough-for-hs256-0123456789'
process.env.JWT_SECRET = JWT_SECRET

import paymentRoutes from '../../src/routes/payments'
import { EscrowError } from '../../src/services/escrow'

const INVESTOR_ADDRESS = '0x' + '22'.repeat(20)
const USERS: Record<number, any> = {
  2: { id: 2, email: 'investor@test.local', name: 'Investor', role: 'INVESTOR', is_active: true, address: INVESTOR_ADDRESS },
  3: { id: 3, email: 'manager@test.local', name: 'Manager', role: 'MANAGER', is_active: true },
  5: { id: 5, email: 'nokey@test.local', name: 'No address', role: 'INVESTOR', is_active: true, address: '0.0.5555' }
}
const sign = (id: number) => jwt.sign({ userId: id, email: USERS[id].email, role: USERS[id].role }, JWT_SECRET, {
  algorithm: 'HS256', expiresIn: '1h', issuer: 'wata-chain', audience: 'wata-users'
})

const ESCROW = '0x00000000000000000000000000000000000004d2'
const TX_ID = '0.0.1002@1700000000.000000001'
const TX_HASH = '0x' + 'cd'.repeat(48)
const NOW = Math.floor(Date.now() / 1000)

let db: any
let escrow: any
let app: express.Application

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined)
  db = {
    getUserById: jest.fn(async (id: number) => USERS[id] ?? null),
    getAgreement: jest.fn(async () => ({ id: 1, blockchain_id: 0, is_active: true })),
    getBatchesByAgreement: jest.fn(async () => [{ id: 9, audit_hash: 'ab'.repeat(32), period_id: 9 }]),
    createInvestment: jest.fn(async () => 31)
  }
  escrow = {
    contractAddress: ESCROW,
    encodeCall: jest.fn((name: string, a: number, p?: number) => `0xcall-${name}-${a}${p === undefined ? '' : '-' + p}`),
    getPeriod: jest.fn(async () => ({ state: 'PendingApproval', auditHash: 'ab'.repeat(32), score: 80, scoreVersion: 1, approvalDeadline: NOW + 3600 })),
    getAgreement: jest.fn(async () => ({ funder: '0x0000000000000000000000000000000000000000', active: true })),
    findDeposit: jest.fn(async () => ({ status: 'deposited', funder: INVESTOR_ADDRESS, amount: '1000000000', transactionId: TX_ID, transactionHash: TX_HASH }))
  }
  app = express()
  app.use(express.json())
  app.use('/api/payments', paymentRoutes({} as any, db, { escrow }))
})

afterEach(() => jest.restoreAllMocks())

const post = (path: string, user: number, body: object) =>
  request(app).post(path).set('Authorization', `Bearer ${sign(user)}`).send(body)

describe('POST /api/payments/approval-call/:agreementId', () => {
  it('prepares the approve call for the financial manager wallet when the period awaits approval', async () => {
    const res = await post('/api/payments/approval-call/1', 3, { decision: 'approve' })

    expect(res.status).toBe(200)
    expect(escrow.getPeriod).toHaveBeenCalledWith(0, 9)
    expect(res.body.data).toEqual({
      contract: ESCROW, function: 'approve', args: { agreementId: 0, periodId: 9 },
      callData: '0xcall-approve-0-9', signer: 'financialManager', approvalDeadline: NOW + 3600
    })
  })

  it('prepares reject as well', async () => {
    const res = await post('/api/payments/approval-call/1', 3, { decision: 'reject' })
    expect(res.body.data).toMatchObject({ function: 'reject', callData: '0xcall-reject-0-9' })
  })

  it.each(['approve', 'reject'])('refuses to prepare %s for a period that is not awaiting approval', async decision => {
    // Deadline still open: only the state check can refuse it
    escrow.getPeriod.mockResolvedValueOnce({ state: 'Approved', approvalDeadline: NOW + 3600 })
    expect((await post('/api/payments/approval-call/1', 3, { decision })).status).toBe(409)
    expect(escrow.encodeCall).not.toHaveBeenCalled()
  })

  it('refuses to prepare an approve after the deadline (the contract would revert)', async () => {
    escrow.getPeriod.mockResolvedValueOnce({ state: 'PendingApproval', approvalDeadline: NOW - 1 })
    expect((await post('/api/payments/approval-call/1', 3, { decision: 'approve' })).status).toBe(409)
  })

  it('rejects an unknown decision and non-managers', async () => {
    expect((await post('/api/payments/approval-call/1', 3, { decision: 'release' })).status).toBe(400)
    expect((await post('/api/payments/approval-call/1', 2, { decision: 'approve' })).status).toBe(403)
    expect(escrow.encodeCall).not.toHaveBeenCalled()
  })
})

describe('POST /api/payments/deposit-call/:agreementId', () => {
  it('prepares the deposit call with the exact payable amount', async () => {
    const res = await post('/api/payments/deposit-call/1', 2, { amountTinybar: '1000000000' })

    expect(res.status).toBe(200)
    expect(escrow.getAgreement).toHaveBeenCalledWith(0)
    expect(res.body.data).toEqual({
      contract: ESCROW, function: 'deposit', args: { agreementId: 0 }, payableTinybar: '1000000000',
      callData: '0xcall-deposit-0', signer: INVESTOR_ADDRESS
    })
  })

  it('refuses when another account is already the funder (the contract would revert)', async () => {
    escrow.getAgreement.mockResolvedValueOnce({ funder: '0x' + '99'.repeat(20), active: true })
    expect((await post('/api/payments/deposit-call/1', 2, { amountTinybar: '1' })).status).toBe(409)
  })

  it('allows further deposits by the same funder', async () => {
    escrow.getAgreement.mockResolvedValueOnce({ funder: INVESTOR_ADDRESS.toUpperCase().replace('0X', '0x'), active: true })
    expect((await post('/api/payments/deposit-call/1', 2, { amountTinybar: '1' })).status).toBe(200)
  })

  it.each([
    ['zero', { amountTinybar: '0' }],
    ['a JSON number', { amountTinybar: 1000 }],
    ['decimals', { amountTinybar: '1.5' }]
  ])('rejects an amount given as %s', async (_label, body) => {
    expect((await post('/api/payments/deposit-call/1', 2, body)).status).toBe(400)
  })

  it('refuses inactive or unlinked agreements and investors without an EVM address', async () => {
    escrow.getAgreement.mockResolvedValueOnce({ funder: '0x0000000000000000000000000000000000000000', active: false })
    expect((await post('/api/payments/deposit-call/1', 2, { amountTinybar: '1' })).status).toBe(409)
    db.getAgreement.mockResolvedValueOnce({ id: 1, blockchain_id: null })
    expect((await post('/api/payments/deposit-call/1', 2, { amountTinybar: '1' })).status).toBe(409)
    expect((await post('/api/payments/deposit-call/1', 5, { amountTinybar: '1' })).status).toBe(409)
  })

  it('is restricted to INVESTOR', async () => {
    expect((await post('/api/payments/deposit-call/1', 3, { amountTinybar: '1' })).status).toBe(403)
  })
})

describe('POST /api/payments/deposits/confirm', () => {
  const confirm = (user = 2, body: object = { agreementId: 1, transactionId: TX_ID }) => post('/api/payments/deposits/confirm', user, body)

  it('records the deposit read from the ledger, with its exact amount, id and hash', async () => {
    const res = await confirm()

    expect(res.status).toBe(201)
    expect(escrow.findDeposit).toHaveBeenCalledWith(TX_ID, 0)
    expect(db.createInvestment).toHaveBeenCalledWith({
      agreementId: 1, investorAddress: INVESTOR_ADDRESS, amount: '1000000000',
      transactionId: TX_ID, transactionHash: TX_HASH, status: 'confirmed'
    })
    expect(res.body.data).toMatchObject({ investmentId: 31, amount: '1000000000', transactionHash: TX_HASH })
  })

  it('refuses a deposit made by another address', async () => {
    escrow.findDeposit.mockResolvedValueOnce({ status: 'deposited', funder: '0x' + '99'.repeat(20), amount: '1', transactionId: TX_ID, transactionHash: TX_HASH })
    expect((await confirm()).status).toBe(403)
    expect(db.createInvestment).not.toHaveBeenCalled()
  })

  it('reports unknown and failed transactions without recording anything', async () => {
    escrow.findDeposit.mockResolvedValueOnce({ status: 'not_found' })
    expect((await confirm()).status).toBe(404)
    escrow.findDeposit.mockResolvedValueOnce({ status: 'failed', ledgerStatus: 'CONTRACT_REVERT_EXECUTED' })
    expect((await confirm()).status).toBe(409)
    escrow.findDeposit.mockRejectedValueOnce(new EscrowError('MISSING_EVENT', 'no Deposited event'))
    expect((await confirm()).status).toBe(409)
    expect(db.createInvestment).not.toHaveBeenCalled()
  })

  it('records a deposit transaction only once', async () => {
    db.createInvestment.mockRejectedValueOnce(Object.assign(new Error('Unique constraint failed'), { code: 'P2002' }))
    expect((await confirm()).status).toBe(409)
  })

  it('rejects a malformed transaction id before reading the ledger', async () => {
    expect((await confirm(2, { agreementId: 1, transactionId: 'abc' })).status).toBe(400)
    expect(escrow.findDeposit).not.toHaveBeenCalled()
  })
})
