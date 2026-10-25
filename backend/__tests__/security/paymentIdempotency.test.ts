/**
 * Payment idempotency (DI-4): two concurrent trigger-checks can both pass the "payment exists?"
 * check. The database unique index on (agreement_id, audit_hash) rejects the second insert;
 * the route must turn that rejection into 409, never a second pending payment or a 500.
 */
import express from 'express'
import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('../../src/services/orm/prismaDatabase', () => ({ PrismaDatabase: class {} }))
jest.mock('../../src/services/hedera', () => ({ HederaService: class {} }))

const JWT_SECRET = 'test-secret-that-is-long-enough-for-hs256-0123456789'
process.env.JWT_SECRET = JWT_SECRET

import paymentRoutes from '../../src/routes/payments'

const MANAGER = { id: 3, email: 'manager@test.local', name: 'Manager', role: 'MANAGER', is_active: true }

const token = jwt.sign({ userId: MANAGER.id, email: MANAGER.email, role: MANAGER.role }, JWT_SECRET, {
  algorithm: 'HS256', expiresIn: '1h', issuer: 'wata-chain', audience: 'wata-users'
})

let db: any
let app: express.Application

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined)
  db = {
    getUserById: jest.fn(async (id: number) => (id === MANAGER.id ? MANAGER : null)),
    getAgreement: jest.fn(async () => ({ id: 1, base_value: 10, hectares: 5, blockchain_id: 0 })),
    getBatchesByAgreement: jest.fn(async () => [{ id: 9, score: 0.9, audit_hash: 'ab'.repeat(32), period_id: 9 }]),
    // Empty: simulates the race where the existence check runs before the other insert commits
    getPaymentsByAgreement: jest.fn(async () => []),
    createPayment: jest.fn(async () => 1),
    recordPaymentRelease: jest.fn(async () => undefined),
    markPaymentFailed: jest.fn(async () => undefined),
    attachPaymentHcs: jest.fn(async () => undefined)
  }
  const escrow = {
    getPeriod: jest.fn(async () => ({ state: 'Approved', auditHash: 'ab'.repeat(32), score: 90, scoreVersion: 1, approvalDeadline: 0 })),
    getAgreement: jest.fn(async () => ({ periodAmount: '50', scoreThreshold: 70 })),
    release: jest.fn(async () => ({ outcome: 'released', amount: '50', producer: '0xp', transactionId: '0.0.1@1.2', transactionHash: '0x' + 'cd'.repeat(48) }))
  }
  app = express()
  app.use(express.json())
  const audit = { publishAuditRecord: jest.fn(async () => '0.0.7@1.2') }
  app.use('/api/payments', paymentRoutes({} as any, db, { escrow: escrow as any, audit }))
})

afterEach(() => jest.restoreAllMocks())

const trigger = () =>
  request(app).post('/api/payments/trigger-check/1').set('Authorization', `Bearer ${token}`).send({})

describe('POST /api/payments/trigger-check under a concurrent duplicate', () => {
  it('returns 409 when the unique index rejects the insert (P2002)', async () => {
    db.createPayment.mockRejectedValueOnce(Object.assign(new Error('Unique constraint failed'), { code: 'P2002' }))

    const res = await trigger()

    expect(res.status).toBe(409)
    expect(res.body.success).toBe(false)
  })

  it('still returns 500 for other database errors', async () => {
    db.createPayment.mockRejectedValueOnce(Object.assign(new Error('disk I/O error'), { code: 'P1001' }))

    const res = await trigger()

    expect(res.status).toBe(500)
  })

  it('reserves the payment before releasing when there is no duplicate', async () => {
    const res = await trigger()

    expect(res.status).toBe(200)
    expect(db.createPayment).toHaveBeenCalledWith(expect.objectContaining({
      agreementId: 1, batchId: 9, amount: '50', status: 'processing', auditHash: 'ab'.repeat(32)
    }))
  })
})
