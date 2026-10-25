/**
 * Agreement creation (DI-3): the on-chain agreement ID must come only from the contract's
 * transaction record. A client-supplied ID (any value, including 0 and null) is rejected
 * before anything is written, so a caller cannot bind a local agreement to another
 * producer's on-chain agreement.
 */
import express from 'express'
import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('../../src/services/orm/prismaDatabase', () => ({ PrismaDatabase: class {} }))
jest.mock('../../src/services/hedera', () => ({ HederaService: class {} }))

const JWT_SECRET = 'test-secret-that-is-long-enough-for-hs256-0123456789'
process.env.JWT_SECRET = JWT_SECRET

import agreementRoutes from '../../src/routes/agreements'

const MANAGER = { id: 3, email: 'manager@test.local', name: 'Manager', role: 'MANAGER', is_active: true }

const token = jwt.sign({ userId: MANAGER.id, email: MANAGER.email, role: MANAGER.role }, JWT_SECRET, {
  algorithm: 'HS256', expiresIn: '1h', issuer: 'wata-chain', audience: 'wata-users'
})

const VALID_BODY = {
  producerName: 'Producer',
  producerAddress: '0x742d35Cc6639C0532fEb217F5e4B9af48Bf9bA2A',
  baseValue: 1000,
  hectares: 50
}

let db: any
let hedera: any
let app: express.Application

beforeEach(() => {
  db = {
    getUserById: jest.fn(async (id: number) => (id === MANAGER.id ? MANAGER : null)),
    createAgreement: jest.fn(async () => 17),
    updateAgreementBlockchainId: jest.fn(async () => undefined),
    updateUserAddress: jest.fn(async () => undefined)
  }
  hedera = {
    createAgreementWithSystem: jest.fn(async () => ({ agreementId: 0, transactionId: '0.0.1001@1.2' }))
  }
  app = express()
  app.use(express.json())
  app.use('/api/agreements', agreementRoutes(hedera, db))
})

const post = (body: object) =>
  request(app).post('/api/agreements').set('Authorization', `Bearer ${token}`).send(body)

describe('POST /api/agreements rejects client-supplied on-chain identifiers', () => {
  it.each([
    ['blockchainId: 5', { blockchainId: 5 }],
    ['blockchainId: 0', { blockchainId: 0 }],
    ['blockchainId: null', { blockchainId: null }],
    ['blockchainId: "1"', { blockchainId: '1' }],
    ['blockchain_id: 5', { blockchain_id: 5 }],
    ['signedTransaction', { signedTransaction: { transactionBytes: 'aa', signature: 'bb' } }]
  ])('%s → 400 and nothing is written', async (_label, extra) => {
    const res = await post({ ...VALID_BODY, ...extra })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(db.createAgreement).not.toHaveBeenCalled()
    expect(db.updateAgreementBlockchainId).not.toHaveBeenCalled()
    expect(hedera.createAgreementWithSystem).not.toHaveBeenCalled()
  })
})

describe('POST /api/agreements with escrow v3', () => {
  const TERMS = { periodAmount: '1000000000000000000000', scoreThreshold: 70, governanceMode: 'HYBRID' }

  it('creates the local agreement without any ledger call or on-chain ID', async () => {
    const res = await post(VALID_BODY)

    expect(res.status).toBe(201)
    expect(res.body.data).toMatchObject({ id: 17 })
    expect(res.body.data.blockchainId).toBeUndefined()
    expect(hedera.createAgreementWithSystem).not.toHaveBeenCalled()
    expect(db.updateAgreementBlockchainId).not.toHaveBeenCalled()
  })

  it('stores the escrow terms and returns the createAgreement call for the admin account to sign', async () => {
    const res = await post({ ...VALID_BODY, ...TERMS })

    expect(res.status).toBe(201)
    expect(db.createAgreement).toHaveBeenCalledWith(expect.objectContaining({
      periodAmount: TERMS.periodAmount, scoreThreshold: 70, governanceMode: 'HYBRID'
    }))
    expect(res.body.data.escrowCall).toEqual({
      function: 'createAgreement',
      args: { producer: VALID_BODY.producerAddress.toLowerCase(), periodAmount: TERMS.periodAmount, scoreThreshold: 70, mode: 'HYBRID' }
    })
  })

  it.each([
    ['zero period amount', { periodAmount: '0' }],
    ['numeric period amount (precision loss)', { periodAmount: 1000 }],
    ['period amount with decimals', { periodAmount: '1.5' }],
    ['threshold 0', { scoreThreshold: 0 }],
    ['threshold above 100', { scoreThreshold: 101 }],
    ['unknown governance mode', { governanceMode: 'MANUAL' }],
    ['non-EVM producer address', { producerAddress: '0.0.123456' }]
  ])('rejects %s → 400 and nothing is written', async (_label, override) => {
    const res = await post({ ...VALID_BODY, ...TERMS, ...override })

    expect(res.status).toBe(400)
    expect(db.createAgreement).not.toHaveBeenCalled()
  })
})
