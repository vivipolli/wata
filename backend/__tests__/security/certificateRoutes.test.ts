/**
 * Certificate routes (F5): MANAGER-only actions, certificate errors mapped to HTTP statuses, and
 * missing configuration failing clearly instead of minting against a default token.
 */
import express from 'express'
import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('../../src/services/orm/prismaDatabase', () => ({ PrismaDatabase: class {} }))
jest.mock('../../src/services/hedera', () => ({ HederaService: class {} }))

const JWT_SECRET = 'test-secret-that-is-long-enough-for-hs256-0123456789'
process.env.JWT_SECRET = JWT_SECRET

import certificateRoutes from '../../src/routes/certificates'
import { CertificateError } from '../../src/services/certificate'

const MANAGER = { id: 3, email: 'manager@test.local', name: 'Manager', role: 'MANAGER', is_active: true }
const token = jwt.sign({ userId: 3, email: MANAGER.email, role: 'MANAGER' }, JWT_SECRET, {
  algorithm: 'HS256', expiresIn: '1h', issuer: 'wata-chain', audience: 'wata-users'
})

let service: any
let db: any

function app(withService = true) {
  const a = express()
  a.use(express.json())
  a.use('/api/certificates', certificateRoutes({} as any, db, withService ? { service } : {}))
  return a
}

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined)
  db = { getUserById: jest.fn(async (id: number) => (id === 3 ? MANAGER : null)), getCertificateByPayment: jest.fn(async () => null) }
  service = {
    prepare: jest.fn(async () => ({ certificateId: 3, scheduleId: '0.0.6000' })),
    confirm: jest.fn(async () => ({ status: 'minted', serialNumber: 12 }))
  }
})

afterEach(() => jest.restoreAllMocks())

const post = (a: express.Application, path: string) => request(a).post(path).set('Authorization', `Bearer ${token}`).send({})

describe('certificate routes', () => {
  it('prepares and confirms through the certificate service', async () => {
    expect((await post(app(), '/api/certificates/payment/7/prepare')).status).toBe(201)
    expect(service.prepare).toHaveBeenCalledWith(7)
    const confirmed = await post(app(), '/api/certificates/3/confirm')
    expect(confirmed.status).toBe(200)
    expect(confirmed.body.data).toMatchObject({ status: 'minted', serialNumber: 12 })
  })

  it.each([
    ['NOT_RELEASED', 409],
    ['ALREADY_EXISTS', 409],
    ['LEDGER_MISMATCH', 409],
    ['NOT_FOUND', 404],
    ['INVALID_CID', 502],
    ['METADATA_TOO_LONG', 422]
  ])('maps %s to HTTP %s', async (code, status) => {
    service.prepare.mockRejectedValueOnce(new CertificateError(code as any, 'x'))
    const res = await post(app(), '/api/certificates/payment/7/prepare')
    expect(res.status).toBe(status)
    expect(res.body.data.code).toBe(code)
  })

  it('fails clearly when the certificate token or image is not configured', async () => {
    const saved = { ...process.env }
    delete process.env.NFT_TOKEN_ID
    const res = await post(app(false), '/api/certificates/payment/7/prepare')
    expect(res.status).toBe(500)
    expect(res.body.message).toContain('NFT_TOKEN_ID')
    process.env.NFT_TOKEN_ID = '0.0.5000'
    process.env.CERT_IMAGE_URI = 'https://gateway.example/x.png'
    expect((await post(app(false), '/api/certificates/payment/7/prepare')).body.message).toContain('CERT_IMAGE_URI')
    Object.assign(process.env, saved)
  })
})
