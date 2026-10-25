/**
 * Measurement ingestion (F3b): only CONAMA catalog parameters, in their catalog unit or a unit with
 * an official source, with explicit qualifiers. A batch is all-or-nothing on validation, and the same
 * source record is never stored twice. INEA rows keep their spreadsheet locator as the source ref.
 */
import express from 'express'
import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('../../src/services/orm/prismaDatabase', () => ({ PrismaDatabase: class {} }))

const JWT_SECRET = 'test-secret-that-is-long-enough-for-hs256-0123456789'
process.env.JWT_SECRET = JWT_SECRET

import measurementRoutes from '../../src/routes/measurements'
import { validateMeasurementInput } from '../../src/score/measurements'
import { ineaRowsToMeasurementInputs } from '../../src/score/inea'

const USERS: Record<number, any> = {
  2: { id: 2, email: 'investor@test.local', name: 'Investor', role: 'INVESTOR', is_active: true },
  3: { id: 3, email: 'manager@test.local', name: 'Manager', role: 'MANAGER', is_active: true }
}
const sign = (id: number) => jwt.sign({ userId: id, email: USERS[id].email, role: USERS[id].role }, JWT_SECRET, {
  algorithm: 'HS256', expiresIn: '1h', issuer: 'wata-chain', audience: 'wata-users'
})

const valid = {
  stationCode: '00RJ24MC0010', sampledAt: '2025-01-21', parameter: 'turbidez_UNT', value: 12.5, unit: 'NTU',
  qualifier: null, source: 'INEA', sourceRef: 'xlsx:b930b9e0:2025:120'
}

describe('validateMeasurementInput', () => {
  it('accepts a catalog parameter in an accepted unit', () => {
    expect(validateMeasurementInput(valid)).toEqual([])
    expect(validateMeasurementInput({ ...valid, parameter: 'nitrato_mg_L_N', unit: 'mg/L', value: 0.4 })).toEqual([])
    expect(validateMeasurementInput({ ...valid, parameter: 'DBO_5d_20C_mg_L_O2', unit: 'mg/L O2', value: 2, qualifier: '<' })).toEqual([])
  })

  it.each([
    ['unknown parameter', { parameter: 'turbidity' }],
    ['unit without a source', { unit: 'JTU' }],
    ['plain mg/L for oxygen (must be declared as O2)', { parameter: 'OD_mg_L_O2', unit: 'mg/L' }],
    ['unknown qualifier', { qualifier: 'NR' }],
    ['missing value', { value: null }],
    ['non-finite value', { value: Number.POSITIVE_INFINITY }],
    ['malformed station', { stationCode: 'mc 10' }],
    ['malformed date', { sampledAt: '21/01/2025' }],
    ['missing source reference', { sourceRef: '' }]
  ])('rejects %s', (_label, override) => {
    expect(validateMeasurementInput({ ...valid, ...override } as any).length).toBeGreaterThan(0)
  })
})

describe('INEA rows to ingestion records', () => {
  it('uses the bulletin station code, keeps the locator and raw code, and skips unmapped or empty rows', () => {
    const rows = [
      { estacao: '00RJ24MC0010', data: '2025-01-21', aba: '2025', linha: '120', parametro_id: 'turbidez', unidade: 'NTU', qualificador: 'MEDIDO', valor_num: '12.5' },
      { estacao: '00RJ24MC0010', data: '2025-01-21', aba: '2025', linha: '120', parametro_id: 'ecoli', unidade: 'NMP/100mL', qualificador: 'MEDIDO', valor_num: '30' },
      { estacao: '00RJ24MC0010', data: '2025-01-21', aba: '2025', linha: '120', parametro_id: 'od', unidade: 'mg/L', qualificador: 'MEDIDO', valor_num: '' }
    ]
    expect(ineaRowsToMeasurementInputs(rows, 'b930b9e0')).toEqual([{ ...valid, stationCode: 'MC0010', sourceRef: 'xlsx:b930b9e0:2025:120:00RJ24MC0010' }])
  })
})

describe('measurement routes', () => {
  let db: any
  let app: express.Application

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    db = {
      getUserById: jest.fn(async (id: number) => USERS[id] ?? null),
      insertMeasurements: jest.fn(async (rows: unknown[]) => ({ inserted: rows.length, duplicates: 0 })),
      getMeasurements: jest.fn(async () => [])
    }
    app = express()
    // Same body limit as the server, so the route's own batch limit is what is tested
    app.use(express.json({ limit: '10mb' }))
    app.use('/api/measurements', measurementRoutes(db))
  })

  afterEach(() => jest.restoreAllMocks())

  const post = (user: number, body: object) => request(app).post('/api/measurements').set('Authorization', `Bearer ${sign(user)}`).send(body)

  it('stores a valid batch and reports inserted and duplicate counts', async () => {
    db.insertMeasurements.mockResolvedValueOnce({ inserted: 1, duplicates: 1 })
    const res = await post(3, { measurements: [valid, valid] })
    expect(res.status).toBe(201)
    expect(res.body.data).toEqual({ inserted: 1, duplicates: 1 })
  })

  it('writes nothing when any record is invalid, and says which', async () => {
    const res = await post(3, { measurements: [valid, { ...valid, unit: 'JTU' }] })
    expect(res.status).toBe(400)
    expect(res.body.data.invalid[0].index).toBe(1)
    expect(db.insertMeasurements).not.toHaveBeenCalled()
  })

  it('limits the batch size', async () => {
    const res = await post(3, { measurements: Array.from({ length: 1001 }, () => valid) })
    expect(res.status).toBe(400)
    expect(db.insertMeasurements).not.toHaveBeenCalled()
  })

  it('is restricted to MANAGER for writes', async () => {
    expect((await post(2, { measurements: [valid] })).status).toBe(403)
  })

  it('lists measurements of a station and period for any authenticated user', async () => {
    const res = await request(app).get('/api/measurements?station=00RJ24MC0010&from=2025-01-01&to=2025-12-31').set('Authorization', `Bearer ${sign(2)}`)
    expect(res.status).toBe(200)
    expect(db.getMeasurements).toHaveBeenCalledWith('00RJ24MC0010', new Date('2025-01-01'), new Date('2025-12-31'))
    expect((await request(app).get('/api/measurements?station=bad code').set('Authorization', `Bearer ${sign(2)}`)).status).toBe(400)
  })
})

describe('parseCsv', () => {
  it('reads quoted fields, doubled quotes, commas inside quotes and CRLF', async () => {
    const { parseCsv } = await import('../../src/score/csv')
    expect(parseCsv('a,b,c\r\n1,"x, y","say ""hi"""\r\n2,,z\n')).toEqual([
      { a: '1', b: 'x, y', c: 'say "hi"' },
      { a: '2', b: '', c: 'z' }
    ])
  })
})
