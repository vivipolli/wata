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
jest.mock('../../src/services/relayer', () => ({ RelayerService: class {} }))

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
    getAgreement: jest.fn(async () => ({ id: 1, base_value: 10, hectares: 5 })),
    getBatchesByAgreement: jest.fn(async () => [{ id: 9, score: 0.9, audit_hash: 'ab'.repeat(32) }]),
    // Empty: simulates the race where the existence check runs before the other insert commits
    getPaymentsByAgreement: jest.fn(async () => []),
    createPayment: jest.fn(async () => 1)
  }
  app = express()
  app.use(express.json())
  app.use('/api/payments', paymentRoutes({} as any, db, {} as any))
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

  it('records a pending payment when there is no duplicate', async () => {
    const res = await trigger()

    expect(res.status).toBe(200)
    expect(db.createPayment).toHaveBeenCalledWith(expect.objectContaining({
      agreementId: 1, batchId: 9, amount: 50, status: 'pending', auditHash: 'ab'.repeat(32)
    }))
  })
})
