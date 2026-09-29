/**
 * Configuration hardening: JWT secret fail-fast and exact-match CORS allowlist.
 */
import express from 'express'
import request from 'supertest'

jest.mock('../../src/services/orm/prismaDatabase', () => ({ PrismaDatabase: class {} }))

const ORIGINAL_ENV = { ...process.env }

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
  jest.resetModules()
})

describe('JWT secret', () => {
  it.each([
    ['missing', undefined],
    ['the old hardcoded default is too short', 'secret-key'],
    ['31 characters', 'a'.repeat(31)]
  ])('refuses to start when JWT_SECRET is %s', (_label, value) => {
    if (value === undefined) delete process.env.JWT_SECRET
    else process.env.JWT_SECRET = value
    const { AuthMiddleware } = require('../../src/middleware/auth')
    expect(() => new AuthMiddleware({} as any)).toThrow(/JWT_SECRET/)
  })

  it('starts with a 32+ character secret', () => {
    process.env.JWT_SECRET = 'b'.repeat(32)
    const { AuthMiddleware } = require('../../src/middleware/auth')
    expect(() => new AuthMiddleware({} as any)).not.toThrow()
  })
})

describe('CORS allowlist', () => {
  function buildApp() {
    const { securityMiddleware } = require('../../src/middleware/security')
    const app = express()
    app.use(securityMiddleware)
    app.get('/api/ping', (_req, res) => { res.json({ ok: true }) })
    return app
  }

  it('echoes an exactly-listed origin', async () => {
    process.env.NODE_ENV = 'production'
    process.env.ALLOWED_ORIGINS = 'https://wata-mu.vercel.app, https://app.example.org'
    const res = await request(buildApp()).get('/api/ping').set('Origin', 'https://app.example.org')
    expect(res.headers['access-control-allow-origin']).toBe('https://app.example.org')
    expect(res.headers['access-control-allow-credentials']).toBeUndefined()
  })

  it.each([
    'https://attacker.vercel.app',
    'https://wata-mu.vercel.app.attacker.com',
    'https://abc.ngrok-free.app',
    'http://localhost:5173'
  ])('does not allow %s in production', async (origin) => {
    process.env.NODE_ENV = 'production'
    process.env.ALLOWED_ORIGINS = 'https://wata-mu.vercel.app'
    const app = buildApp()
    const res = await request(app).get('/api/ping').set('Origin', origin)
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
    const preflight = await request(app).options('/api/ping').set('Origin', origin)
    expect(preflight.status).toBe(403)
  })

  it('allows localhost only in development', async () => {
    process.env.NODE_ENV = 'development'
    delete process.env.ALLOWED_ORIGINS
    const res = await request(buildApp()).get('/api/ping').set('Origin', 'http://localhost:5173')
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173')
  })

  it('rate limits after RATE_LIMIT_MAX_REQUESTS', async () => {
    process.env.NODE_ENV = 'production'
    process.env.RATE_LIMIT_MAX_REQUESTS = '3'
    const app = buildApp()
    const statuses: number[] = []
    for (let i = 0; i < 4; i++) statuses.push((await request(app).get('/api/ping')).status)
    expect(statuses).toEqual([200, 200, 200, 429])
  })
})

describe('auth endpoints rate limit', () => {
  it('blocks the 6th failed login attempt from the same IP', async () => {
    process.env.JWT_SECRET = 'c'.repeat(32)
    jest.doMock('../../src/services/orm/prismaDatabase', () => ({
      PrismaDatabase: class {
        async initialize() {}
        async getUserByEmail() { return null }
      }
    }))
    const authRoutes = require('../../src/routes/auth').default
    const app = express()
    app.use(express.json())
    app.use('/api/auth', authRoutes)
    const statuses: number[] = []
    for (let i = 0; i < 6; i++) {
      const res = await request(app).post('/api/auth/login')
        .send({ email: 'nobody@test.local', password: 'Wrong-password-1!' })
      statuses.push(res.status)
    }
    expect(statuses.slice(0, 5).every((s) => s !== 429 && s >= 400)).toBe(true)
    expect(statuses[5]).toBe(429)
  })
})
