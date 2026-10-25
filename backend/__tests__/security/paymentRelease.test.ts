/**
 * Payment release (F2b T3): trigger-check and process pay only through PESEscrowV3.release.
 * The decision comes from the period state read on-chain, never from the database alone;
 * the amount is the contract's periodAmount; the recorded hash is the ledger record's.
 * A payment is claimed in the database before the release so two requests cannot both release.
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

const MANAGER = { id: 3, email: 'manager@test.local', name: 'Manager', role: 'MANAGER', is_active: true }
const token = jwt.sign({ userId: MANAGER.id, email: MANAGER.email, role: MANAGER.role }, JWT_SECRET, {
  algorithm: 'HS256', expiresIn: '1h', issuer: 'wata-chain', audience: 'wata-users'
})

const AUDIT = 'ab'.repeat(32)
const PERIOD_AMOUNT = (2n ** 70n).toString()
const TX_ID = '0.0.1001@1700000000.000000001'
const TX_HASH = '0x' + 'cd'.repeat(48)

let db: any
let escrow: any
let audit: any
let app: express.Application

function period(state: string, overrides: Record<string, unknown> = {}) {
  return { state, auditHash: AUDIT, score: 85, scoreVersion: 1, approvalDeadline: 0, ...overrides }
}

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined)
  db = {
    getUserById: jest.fn(async (id: number) => (id === MANAGER.id ? MANAGER : null)),
    // Local values deliberately differ from the chain: base_value * hectares = 50, blockchain id 0
    getAgreement: jest.fn(async () => ({ id: 1, base_value: 10, hectares: 5, blockchain_id: 0 })),
    getBatchesByAgreement: jest.fn(async () => [{ id: 9, score: 0.9, audit_hash: AUDIT, period_id: 9 }]),
    getPaymentsByAgreement: jest.fn(async () => []),
    createPayment: jest.fn(async () => 1),
    getPayment: jest.fn(async () => null),
    claimPaymentForRelease: jest.fn(async () => true),
    recordPaymentRelease: jest.fn(async () => undefined),
    markPaymentFailed: jest.fn(async () => undefined),
    attachPaymentHcs: jest.fn(async () => undefined),
    setPaymentTransactionId: jest.fn(async () => true),
    getPaymentsToReconcile: jest.fn(async () => [])
  }
  audit = { publishAuditRecord: jest.fn(async () => '0.0.7@1700000001.000000002') }
  escrow = {
    getPeriod: jest.fn(async () => period('Approved')),
    getAgreement: jest.fn(async () => ({ periodAmount: PERIOD_AMOUNT, scoreThreshold: 70 })),
    // Like the real ledger, hands the transaction id over before sending
    release: jest.fn(async (_a: number, _p: number, onPrepared?: (id: string) => Promise<void>) => {
      if (onPrepared) await onPrepared(TX_ID)
      return { outcome: 'released', amount: PERIOD_AMOUNT, producer: '0xp', transactionId: TX_ID, transactionHash: TX_HASH }
    }),
    findRelease: jest.fn(async () => ({ status: 'not_found' }))
  }
  app = express()
  app.use(express.json())
  app.use('/api/payments', paymentRoutes({} as any, db, { escrow, audit }))
})

afterEach(() => jest.restoreAllMocks())

const trigger = () =>
  request(app).post('/api/payments/trigger-check/1').set('Authorization', `Bearer ${token}`).send({})
const processPayment = (id = 1) =>
  request(app).post(`/api/payments/process/${id}`).set('Authorization', `Bearer ${token}`).send({})

describe('POST /api/payments/trigger-check', () => {
  it('releases an approved period and records the on-chain amount, transaction id and hash', async () => {
    const res = await trigger()

    expect(res.status).toBe(200)
    expect(escrow.getPeriod).toHaveBeenCalledWith(0, 9)
    expect(escrow.release).toHaveBeenCalledTimes(1)
    expect(escrow.release).toHaveBeenCalledWith(0, 9, expect.any(Function))
    expect(db.createPayment).toHaveBeenCalledWith(expect.objectContaining({
      agreementId: 1, batchId: 9, amount: PERIOD_AMOUNT, status: 'processing', auditHash: AUDIT, periodId: 9, onchainState: 'Approved'
    }))
    expect(db.recordPaymentRelease).toHaveBeenCalledWith(1, {
      status: 'completed', transactionId: TX_ID, transactionHash: TX_HASH, onchainState: 'Released'
    })
    expect(res.body.data).toMatchObject({ paymentId: 1, outcome: 'released', amount: PERIOD_AMOUNT, transactionHash: TX_HASH })
  })

  it('publishes the release to HCS with the ledger record hash and links it to the payment', async () => {
    const res = await trigger()

    expect(res.status).toBe(200)
    expect(audit.publishAuditRecord).toHaveBeenCalledWith(expect.objectContaining({
      agreementId: '1', batchId: 9, auditHash: AUDIT, score: 0.9, transactionHash: TX_HASH, producerAddress: '0xp'
    }))
    expect(db.attachPaymentHcs).toHaveBeenCalledWith(1, '0.0.7@1700000001.000000002')
  })

  it('keeps the recorded release when the HCS publication fails', async () => {
    audit.publishAuditRecord.mockRejectedValueOnce(new Error('INSUFFICIENT_PAYER_BALANCE'))

    const res = await trigger()

    expect(res.status).toBe(200)
    expect(db.recordPaymentRelease).toHaveBeenCalledWith(1, expect.objectContaining({ status: 'completed' }))
    expect(db.attachPaymentHcs).not.toHaveBeenCalled()
  })

  it('records a deferred payout as deferred, not completed', async () => {
    escrow.release.mockResolvedValueOnce({ outcome: 'deferred', amount: PERIOD_AMOUNT, producer: '0xp', transactionId: TX_ID, transactionHash: TX_HASH })

    const res = await trigger()

    expect(res.status).toBe(200)
    expect(db.recordPaymentRelease).toHaveBeenCalledWith(1, expect.objectContaining({ status: 'deferred' }))
  })

  it('follows the chain when the database disagrees: a rejected period is never released', async () => {
    escrow.getPeriod.mockResolvedValueOnce(period('Rejected', { score: 40 }))

    const res = await trigger()

    expect(res.status).toBe(400)
    expect(res.body.error).toContain('40')
    expect(res.body.error).toContain('70')
    expect(db.createPayment).not.toHaveBeenCalled()
    expect(escrow.release).not.toHaveBeenCalled()
  })

  it.each([
    ['PendingApproval', 409],
    ['Released', 409],
    ['None', 409],
    ['InReview', 400],
    ['ClosedNoPay', 400]
  ])('does not release a period in state %s', async (state, status) => {
    escrow.getPeriod.mockResolvedValueOnce(period(state))

    const res = await trigger()

    expect(res.status).toBe(status)
    expect(db.createPayment).not.toHaveBeenCalled()
    expect(escrow.release).not.toHaveBeenCalled()
  })

  it('refuses when the on-chain period holds a different audit hash than the batch', async () => {
    escrow.getPeriod.mockResolvedValueOnce(period('Approved', { auditHash: 'ef'.repeat(32) }))

    const res = await trigger()

    expect(res.status).toBe(409)
    expect(escrow.release).not.toHaveBeenCalled()
  })

  it('refuses when the agreement or the batch is not on-chain yet', async () => {
    db.getAgreement.mockResolvedValueOnce({ id: 1, blockchain_id: null })
    expect((await trigger()).status).toBe(409)
    db.getBatchesByAgreement.mockResolvedValueOnce([{ id: 9, score: 0.9, audit_hash: AUDIT, period_id: null }])
    expect((await trigger()).status).toBe(409)
    expect(escrow.getPeriod).not.toHaveBeenCalled()
    expect(escrow.release).not.toHaveBeenCalled()
  })

  it('does not release when another request already reserved the payment (unique index)', async () => {
    db.createPayment.mockRejectedValueOnce(Object.assign(new Error('Unique constraint failed'), { code: 'P2002' }))

    const res = await trigger()

    expect(res.status).toBe(409)
    expect(escrow.release).not.toHaveBeenCalled()
  })

  it('marks the payment failed when the release fails, without a hash', async () => {
    escrow.release.mockRejectedValueOnce(new EscrowError('TX_FAILED', 'CONTRACT_REVERT_EXECUTED'))

    const res = await trigger()

    expect(res.status).toBe(502)
    expect(db.markPaymentFailed).toHaveBeenCalledWith(1)
    expect(db.recordPaymentRelease).not.toHaveBeenCalled()
    expect(audit.publishAuditRecord).not.toHaveBeenCalled()
  })
})

describe('transaction id recorded before the release is sent', () => {
  it('stores the transaction id on the payment before the release', async () => {
    const order: string[] = []
    db.setPaymentTransactionId.mockImplementationOnce(async () => { order.push('stored'); return true })
    escrow.release.mockImplementationOnce(async (_a: number, _p: number, onPrepared: (id: string) => Promise<void>) => {
      await onPrepared(TX_ID)
      order.push('sent')
      return { outcome: 'released', amount: PERIOD_AMOUNT, producer: '0xp', transactionId: TX_ID, transactionHash: TX_HASH }
    })

    expect((await trigger()).status).toBe(200)
    expect(db.setPaymentTransactionId).toHaveBeenCalledWith(1, TX_ID)
    expect(order).toEqual(['stored', 'sent'])
  })

  it('does not send the release when the transaction id cannot be stored', async () => {
    db.setPaymentTransactionId.mockResolvedValueOnce(false)
    let sent = false
    escrow.release.mockImplementationOnce(async (_a: number, _p: number, onPrepared: (id: string) => Promise<void>) => {
      await onPrepared(TX_ID)
      sent = true
      return {} as any
    })

    const res = await trigger()

    expect(res.status).toBe(502)
    expect(sent).toBe(false)
    expect(db.markPaymentFailed).toHaveBeenCalledWith(1)
  })
})

describe('POST /api/payments/reconcile', () => {
  // Real clock: transaction ids and creation times are offsets from now
  const NOW = Math.floor(Date.now() / 1000)
  const reconcile = () => request(app).post('/api/payments/reconcile').set('Authorization', `Bearer ${token}`).send({})
  const stuck = (overrides: Record<string, unknown> = {}) => ({
    id: 5, agreement_id: 1, batch_id: 9, period_id: 9, audit_hash: AUDIT, score: 0.9, status: 'processing',
    transaction_id: `0.0.1013@${NOW - 600}.000000001`, created_at: new Date((NOW - 600) * 1000), ...overrides
  })

  it('completes a stuck payment from the ledger record, with its hash, and publishes it', async () => {
    db.getPaymentsToReconcile.mockResolvedValueOnce([stuck()])
    escrow.findRelease.mockResolvedValueOnce({ status: 'released', release: { outcome: 'released', amount: PERIOD_AMOUNT, producer: '0xp', transactionId: TX_ID, transactionHash: TX_HASH } })

    const res = await reconcile()

    expect(res.status).toBe(200)
    expect(escrow.findRelease).toHaveBeenCalledWith(`0.0.1013@${NOW - 600}.000000001`, 0, 9)
    expect(db.recordPaymentRelease).toHaveBeenCalledWith(5, {
      status: 'completed', transactionId: TX_ID, transactionHash: TX_HASH, onchainState: 'Released'
    }, 'processing', `0.0.1013@${NOW - 600}.000000001`)
    expect(audit.publishAuditRecord).toHaveBeenCalledWith(expect.objectContaining({ transactionHash: TX_HASH }))
    expect(res.body.data).toEqual([{ paymentId: 5, action: 'completed' }])
    expect(escrow.release).not.toHaveBeenCalled()
  })

  it('also completes a payment marked failed whose release did reach consensus', async () => {
    db.getPaymentsToReconcile.mockResolvedValueOnce([stuck({ status: 'failed' })])
    escrow.findRelease.mockResolvedValueOnce({ status: 'released', release: { outcome: 'deferred', amount: PERIOD_AMOUNT, producer: '0xp', transactionId: TX_ID, transactionHash: TX_HASH } })

    await reconcile()

    expect(db.recordPaymentRelease).toHaveBeenCalledWith(5, expect.objectContaining({ status: 'deferred' }), 'failed', expect.any(String))
  })

  it('marks failed a stuck payment whose transaction failed on the ledger', async () => {
    db.getPaymentsToReconcile.mockResolvedValueOnce([stuck()])
    escrow.findRelease.mockResolvedValueOnce({ status: 'failed', ledgerStatus: 'CONTRACT_REVERT_EXECUTED' })

    const res = await reconcile()

    expect(db.markPaymentFailed).toHaveBeenCalledWith(5, `0.0.1013@${NOW - 600}.000000001`)
    expect(db.recordPaymentRelease).not.toHaveBeenCalled()
    expect(res.body.data[0].action).toBe('failed')
  })

  it('waits while an unknown transaction may still reach consensus, then marks it failed', async () => {
    db.getPaymentsToReconcile.mockResolvedValueOnce([stuck({ transaction_id: `0.0.1013@${NOW - 60}.000000001` })])
    const early = await reconcile()
    expect(early.body.data[0].action).toBe('waiting')
    expect(db.markPaymentFailed).not.toHaveBeenCalled()

    db.getPaymentsToReconcile.mockResolvedValueOnce([stuck({ transaction_id: `0.0.1013@${NOW - 600}.000000001` })])
    const late = await reconcile()
    expect(late.body.data[0].action).toBe('failed')
    expect(db.markPaymentFailed).toHaveBeenCalledWith(5, `0.0.1013@${NOW - 600}.000000001`)
  })

  it('marks failed a payment that never got a transaction id, only after the grace period', async () => {
    db.getPaymentsToReconcile.mockResolvedValueOnce([stuck({ transaction_id: null, created_at: new Date((NOW - 30) * 1000) })])
    expect((await reconcile()).body.data[0].action).toBe('waiting')

    db.getPaymentsToReconcile.mockResolvedValueOnce([stuck({ transaction_id: null })])
    expect((await reconcile()).body.data[0].action).toBe('failed')
    expect(db.markPaymentFailed).toHaveBeenCalledWith(5, null)
    expect(escrow.findRelease).not.toHaveBeenCalled()
  })

  it('leaves a payment untouched when the ledger record does not check out', async () => {
    db.getPaymentsToReconcile.mockResolvedValueOnce([stuck()])
    escrow.findRelease.mockRejectedValueOnce(new EscrowError('MISSING_EVENT', 'no PeriodReleased from the escrow contract'))

    const res = await reconcile()

    expect(res.status).toBe(200)
    expect(res.body.data[0]).toMatchObject({ paymentId: 5, action: 'error' })
    expect(db.recordPaymentRelease).not.toHaveBeenCalled()
    expect(db.markPaymentFailed).not.toHaveBeenCalled()
  })
})

describe('POST /api/payments/process/:paymentId', () => {
  const failedPayment = { id: 5, agreement_id: 1, batch_id: 9, status: 'failed', period_id: 9, audit_hash: AUDIT, score: 0.9 }

  it('retries the release of a failed payment after claiming it', async () => {
    db.getPayment.mockResolvedValueOnce(failedPayment)

    const res = await processPayment(5)

    expect(res.status).toBe(200)
    expect(db.claimPaymentForRelease).toHaveBeenCalledWith(5)
    expect(escrow.release).toHaveBeenCalledWith(0, 9, expect.any(Function))
    expect(db.recordPaymentRelease).toHaveBeenCalledWith(5, expect.objectContaining({ status: 'completed', transactionHash: TX_HASH }))
  })

  it('does not release when the claim is lost to a concurrent request', async () => {
    db.getPayment.mockResolvedValueOnce(failedPayment)
    db.claimPaymentForRelease.mockResolvedValueOnce(false)

    const res = await processPayment(5)

    expect(res.status).toBe(409)
    expect(escrow.release).not.toHaveBeenCalled()
  })

  it('does not release or invent a hash when the period was already released on-chain', async () => {
    db.getPayment.mockResolvedValueOnce(failedPayment)
    escrow.getPeriod.mockResolvedValueOnce(period('Released'))

    const res = await processPayment(5)

    expect(res.status).toBe(409)
    expect(db.claimPaymentForRelease).not.toHaveBeenCalled()
    expect(escrow.release).not.toHaveBeenCalled()
    expect(db.recordPaymentRelease).not.toHaveBeenCalled()
  })

  it('refuses completed payments and unknown ids', async () => {
    db.getPayment.mockResolvedValueOnce({ ...failedPayment, status: 'completed' })
    expect((await processPayment(5)).status).toBe(409)
    expect((await processPayment(99)).status).toBe(404)
    expect(escrow.release).not.toHaveBeenCalled()
  })
})
