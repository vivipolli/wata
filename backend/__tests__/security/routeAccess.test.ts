/**
 * Route access control: every business route must reject unauthenticated calls, and
 * operational routes must reject non-MANAGER users. Routes are enumerated from the router
 * stacks, so a newly added unprotected route makes this suite fail.
 */
import express, { Router } from 'express'
import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('../../src/services/orm/prismaDatabase', () => ({ PrismaDatabase: class {} }))
jest.mock('../../src/services/hedera', () => ({ HederaService: class {} }))
jest.mock('../../src/services/relayer', () => ({ RelayerService: class {} }))
jest.mock('../../src/services/oracle', () => ({ OracleService: class {} }))
jest.mock('../../src/services/hcs', () => ({ hcsService: {} }))
jest.mock('../../src/services/hfs', () => ({ hfsService: {} }))

const JWT_SECRET = 'test-secret-that-is-long-enough-for-hs256-0123456789'
process.env.JWT_SECRET = JWT_SECRET

import agreementRoutes from '../../src/routes/agreements'
import readingRoutes from '../../src/routes/readings'
import paymentRoutes from '../../src/routes/payments'
import oracleRoutes from '../../src/routes/oracle'
import hederaRoutes from '../../src/routes/hedera'
import batchSchedulerRoutes from '../../src/routes/batchScheduler'

type Role = 'PRODUCER' | 'INVESTOR' | 'MANAGER'

const USERS: Record<number, { id: number; email: string; name: string; role: Role; is_active: boolean }> = {
  1: { id: 1, email: 'producer@test.local', name: 'Producer', role: 'PRODUCER', is_active: true },
  2: { id: 2, email: 'investor@test.local', name: 'Investor', role: 'INVESTOR', is_active: true },
  3: { id: 3, email: 'manager@test.local', name: 'Manager', role: 'MANAGER', is_active: true },
  4: { id: 4, email: 'inactive@test.local', name: 'Inactive', role: 'MANAGER', is_active: false }
}

// Any data access beyond auth throws, so a request that reaches a handler yields 500, never 2xx
const fakeDb: any = new Proxy(
  { getUserById: async (id: number) => USERS[id] ?? null },
  {
    get(target, prop) {
      if (prop in target) return (target as any)[prop]
      return async () => { throw new Error(`db.${String(prop)} not available in security tests`) }
    }
  }
)
// Throws synchronously so it also works for sync service methods (e.g. scheduler.stop())
const fakeService: any = new Proxy({}, {
  get: () => () => { throw new Error('service not available in security tests') }
})

function signAccess(userId: number, overrides: jwt.SignOptions = {}, secret = JWT_SECRET): string {
  const user = USERS[userId]
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, secret, {
    algorithm: 'HS256', expiresIn: '1h', issuer: 'wata-chain', audience: 'wata-users', ...overrides
  })
}

function signRefresh(userId: number): string {
  const user = USERS[userId]
  return jwt.sign({ userId: user.id, email: user.email, type: 'refresh' }, JWT_SECRET, {
    algorithm: 'HS256', expiresIn: '7d', issuer: 'wata-chain', audience: 'wata-users'
  })
}

const MOUNTS: Array<{ base: string; router: Router }> = [
  { base: '/api/agreements', router: agreementRoutes(fakeService, fakeDb) },
  { base: '/api/readings', router: readingRoutes(fakeDb) },
  { base: '/api/payments', router: paymentRoutes(fakeService, fakeDb, fakeService) },
  { base: '/api/oracle', router: oracleRoutes(fakeDb, fakeService) },
  { base: '/api/hedera', router: hederaRoutes(fakeService, fakeDb) },
  { base: '/api/batch-scheduler', router: batchSchedulerRoutes(fakeService, fakeDb) }
]

const app = express()
app.use(express.json())
for (const { base, router } of MOUNTS) app.use(base, router)

interface RouteDef { method: 'get' | 'post' | 'put' | 'delete'; path: string }

function listRoutes(): RouteDef[] {
  const routes: RouteDef[] = []
  for (const { base, router } of MOUNTS) {
    for (const layer of (router as any).stack) {
      if (!layer.route) continue
      const concrete = String(layer.route.path).replace(/:([A-Za-z]+)/g, '1')
      for (const method of Object.keys(layer.route.methods)) {
        routes.push({ method: method as RouteDef['method'], path: `${base}${concrete}` })
      }
    }
  }
  return routes
}

const ALL_ROUTES = listRoutes()
const MUTATING_ROUTES = ALL_ROUTES.filter(r => r.method !== 'get')

// Operational routes: spend operator funds, write readings/scores or change payout basis
const MANAGER_ONLY = [
  'post /api/agreements/',
  'post /api/readings/submit',
  'post /api/readings/simulate',
  'post /api/payments/trigger-check/1',
  'post /api/payments/process/1',
  'post /api/oracle/process',
  'post /api/oracle/process-all',
  'post /api/hedera/hcs/publish',
  'post /api/hedera/hfs/report',
  'post /api/hedera/hfs/append/1',
  'post /api/batch-scheduler/start',
  'post /api/batch-scheduler/stop',
  'post /api/batch-scheduler/process/1'
]

// Routes that are intentionally disabled regardless of role
const DISABLED = ['post /api/payments/contribute/1']

const key = (r: RouteDef) => `${r.method} ${r.path}`

describe('route inventory', () => {
  it('discovers the routes of every router', () => {
    expect(ALL_ROUTES.length).toBeGreaterThan(40)
  })

  it('classifies every mutating route', () => {
    const known = new Set([...MANAGER_ONLY, ...DISABLED, 'post /api/payments/create-investment-transaction/1'])
    const unclassified = MUTATING_ROUTES.map(key).filter(k => !known.has(k))
    expect(unclassified).toEqual([])
  })
})

describe('authentication is required on every route', () => {
  it.each(ALL_ROUTES.map(r => [key(r), r] as const))('%s → 401 without token', async (_k, r) => {
    const res = await (request(app) as any)[r.method](r.path).send({})
    expect(res.status).toBe(401)
  })

  it.each(MUTATING_ROUTES.map(r => [key(r), r] as const))('%s → 401 with a refresh token', async (_k, r) => {
    const res = await (request(app) as any)[r.method](r.path)
      .set('Authorization', `Bearer ${signRefresh(3)}`).send({})
    expect(res.status).toBe(401)
  })

  it.each([
    ['wrong secret', () => signAccess(3, {}, 'another-secret-that-is-long-enough-0123456789')],
    ['wrong issuer', () => signAccess(3, { issuer: 'someone-else' })],
    ['wrong audience', () => signAccess(3, { audience: 'someone-else' })],
    ['inactive user', () => signAccess(4)]
  ])('rejects %s', async (_label, makeToken) => {
    const res = await request(app).post('/api/oracle/process')
      .set('Authorization', `Bearer ${makeToken()}`).send({})
    expect(res.status).toBe(401)
  })

  it('rejects unsigned (alg: none) tokens', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(JSON.stringify({
      userId: 3, email: USERS[3].email, role: 'MANAGER', iss: 'wata-chain', aud: 'wata-users'
    })).toString('base64url')
    const res = await request(app).post('/api/oracle/process')
      .set('Authorization', `Bearer ${header}.${payload}.`).send({})
    expect(res.status).toBe(401)
  })
})

describe('operational routes require MANAGER', () => {
  const byKey = new Map(ALL_ROUTES.map(r => [key(r), r]))

  it.each(MANAGER_ONLY)('%s → 403 for PRODUCER and INVESTOR', async (k) => {
    const r = byKey.get(k)!
    expect(r).toBeDefined()
    for (const userId of [1, 2]) {
      const res = await (request(app) as any)[r.method](r.path)
        .set('Authorization', `Bearer ${signAccess(userId)}`).send({})
      expect(res.status).toBe(403)
    }
  })

  it.each(MANAGER_ONLY)('%s → passes the access check for MANAGER', async (k) => {
    const r = byKey.get(k)!
    const res = await (request(app) as any)[r.method](r.path)
      .set('Authorization', `Bearer ${signAccess(3)}`).send({})
    expect([401, 403]).not.toContain(res.status)
  })

  it('create-investment-transaction is restricted to INVESTOR', async () => {
    for (const userId of [1, 3]) {
      const res = await request(app).post('/api/payments/create-investment-transaction/1')
        .set('Authorization', `Bearer ${signAccess(userId)}`).send({})
      expect(res.status).toBe(403)
    }
  })
})

describe('removed and disabled fund-moving routes', () => {
  it('POST /api/hedera/transfer no longer exists', async () => {
    const res = await request(app).post('/api/hedera/transfer')
      .set('Authorization', `Bearer ${signAccess(3)}`).send({ toAddress: '0.0.1', amount: 1 })
    expect(res.status).toBe(404)
  })

  it('POST /api/payments/contribute is disabled even for authenticated users', async () => {
    for (const userId of [1, 2, 3]) {
      const res = await request(app).post('/api/payments/contribute/1')
        .set('Authorization', `Bearer ${signAccess(userId)}`).send({ amount: 1, investorAddress: '0.0.1' })
      expect(res.status).toBe(410)
    }
  })

  it('POST /api/payments/process returns 501 instead of a fake success', async () => {
    const res = await request(app).post('/api/payments/process/1')
      .set('Authorization', `Bearer ${signAccess(3)}`).send({})
    expect(res.status).toBe(501)
  })
})
