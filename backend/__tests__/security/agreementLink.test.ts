/**
 * Linking a local agreement to its escrow v3 agreement (F2b T4). The on-chain agreement is
 * created by the admin (threshold) account, never by the server. The manager then links it,
 * and the server accepts the link only if the on-chain state matches the local terms exactly.
 * Each on-chain agreement can be linked once, and an existing link is never replaced.
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
const INVESTOR = { id: 2, email: 'investor@test.local', name: 'Investor', role: 'INVESTOR', is_active: true }
const sign = (u: typeof MANAGER) => jwt.sign({ userId: u.id, email: u.email, role: u.role }, JWT_SECRET, {
  algorithm: 'HS256', expiresIn: '1h', issuer: 'wata-chain', audience: 'wata-users'
})

const PRODUCER = '0x742d35cc6639c0532feb217f5e4b9af48bf9ba2a'
const AMOUNT = '1000000000000000000000'
const TX_ID = '0.0.1001@1700000000.000000001'

let db: any
let escrow: any
let app: express.Application

function localAgreement(overrides: Record<string, unknown> = {}) {
  return {
    id: 17, producer_address: '0x742d35Cc6639C0532fEb217F5e4B9af48Bf9bA2A', period_amount: AMOUNT,
    score_threshold: 70, governance_mode: 'AUTO', blockchain_id: null, ...overrides
  }
}

function onchainAgreement(overrides: Record<string, unknown> = {}) {
  return {
    producer: PRODUCER, funder: '0x0000000000000000000000000000000000000000', periodAmount: AMOUNT,
    scoreThreshold: 70, mode: 'AUTO', active: true, deposited: '0', released: '0', refunded: '0', committed: '0', ...overrides
  }
}

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined)
  db = {
    getUserById: jest.fn(async (id: number) => ({ 3: MANAGER, 2: INVESTOR } as any)[id] ?? null),
    getAgreement: jest.fn(async () => localAgreement()),
    linkAgreementOnchain: jest.fn(async () => true)
  }
  escrow = { getAgreement: jest.fn(async () => onchainAgreement()) }
  app = express()
  app.use(express.json())
  app.use('/api/agreements', agreementRoutes({} as any, db, escrow))
})

afterEach(() => jest.restoreAllMocks())

const link = (body: object, user = MANAGER) =>
  request(app).post('/api/agreements/17/link-onchain').set('Authorization', `Bearer ${sign(user)}`).send(body)

describe('POST /api/agreements/:id/link-onchain', () => {
  it('links on-chain agreement 0 when producer, amount, threshold and mode match', async () => {
    const res = await link({ onchainAgreementId: 0, transactionId: TX_ID })

    expect(res.status).toBe(200)
    expect(escrow.getAgreement).toHaveBeenCalledWith(0)
    expect(db.linkAgreementOnchain).toHaveBeenCalledWith(17, 0, TX_ID)
    expect(res.body.data).toMatchObject({ id: 17, blockchainId: 0 })
  })

  it('is restricted to MANAGER', async () => {
    const res = await link({ onchainAgreementId: 0 }, INVESTOR)
    expect(res.status).toBe(403)
    expect(db.linkAgreementOnchain).not.toHaveBeenCalled()
  })

  it.each([
    ['another producer', { producer: '0x0000000000000000000000000000000000000bad' }],
    ['another amount', { periodAmount: '999' }],
    ['another threshold', { scoreThreshold: 50 }],
    ['another governance mode', { mode: 'HYBRID' }],
    ['an inactive agreement', { active: false }]
  ])('refuses an on-chain agreement with %s', async (_label, override) => {
    escrow.getAgreement.mockResolvedValueOnce(onchainAgreement(override))

    const res = await link({ onchainAgreementId: 4 })

    expect(res.status).toBe(409)
    expect(db.linkAgreementOnchain).not.toHaveBeenCalled()
  })

  it('never replaces an existing link', async () => {
    db.getAgreement.mockResolvedValueOnce(localAgreement({ blockchain_id: 2 }))

    const res = await link({ onchainAgreementId: 4 })

    expect(res.status).toBe(409)
    expect(escrow.getAgreement).not.toHaveBeenCalled()
    expect(db.linkAgreementOnchain).not.toHaveBeenCalled()
  })

  it('refuses when the conditional link loses a race or the on-chain id is linked elsewhere', async () => {
    db.linkAgreementOnchain.mockResolvedValueOnce(false)
    expect((await link({ onchainAgreementId: 4 })).status).toBe(409)

    db.linkAgreementOnchain.mockRejectedValueOnce(Object.assign(new Error('Unique constraint failed'), { code: 'P2002' }))
    expect((await link({ onchainAgreementId: 4 })).status).toBe(409)
  })

  it('refuses a local agreement without escrow terms or with a non-EVM producer address', async () => {
    db.getAgreement.mockResolvedValueOnce(localAgreement({ period_amount: null }))
    expect((await link({ onchainAgreementId: 4 })).status).toBe(409)
    db.getAgreement.mockResolvedValueOnce(localAgreement({ producer_address: '0.0.123456' }))
    expect((await link({ onchainAgreementId: 4 })).status).toBe(409)
    expect(db.linkAgreementOnchain).not.toHaveBeenCalled()
  })

  it.each([
    ['missing on-chain id', {}],
    ['negative on-chain id', { onchainAgreementId: -1 }],
    ['string on-chain id', { onchainAgreementId: '4' }],
    ['malformed transaction id', { onchainAgreementId: 4, transactionId: 'abc' }]
  ])('rejects %s → 400', async (_label, body) => {
    const res = await link(body)
    expect(res.status).toBe(400)
    expect(escrow.getAgreement).not.toHaveBeenCalled()
  })

  it('does not link when the on-chain agreement cannot be read', async () => {
    escrow.getAgreement.mockRejectedValueOnce(new Error('CONTRACT_REVERT_EXECUTED'))

    const res = await link({ onchainAgreementId: 99 })

    expect(res.status).toBe(502)
    expect(db.linkAgreementOnchain).not.toHaveBeenCalled()
  })
})
