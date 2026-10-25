import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { PrismaDatabase, getPrismaClient } from '../src/services/orm/prismaDatabase'

// Only one request may move a payment to 'processing'; release outcomes and failures only
// apply to a payment that is being processed, so a late failure cannot overwrite a completion.
describe('Payment release claim', () => {
  let database: PrismaDatabase
  let paymentId: number

  beforeEach(async () => {
    process.env.DATABASE_URL = 'file:./data/test-db.sqlite'
    database = new PrismaDatabase()
    await database.initialize()
    const prisma = getPrismaClient()
    await prisma.$transaction([
      prisma.audit_records.deleteMany(),
      prisma.investments.deleteMany(),
      prisma.oracle_logs.deleteMany(),
      prisma.payments.deleteMany(),
      prisma.readings.deleteMany(),
      prisma.batches.deleteMany(),
      prisma.agreements.deleteMany()
    ])
    const agreementId = await database.createAgreement({
      agreementHash: 'claim-' + Date.now(),
      producerName: 'Producer',
      producerAddress: '0.0.123456',
      baseValue: 1,
      hectares: 1
    })
    paymentId = await database.createPayment({ agreementId, amount: '100', status: 'failed', auditHash: 'ab'.repeat(32) })
  })

  afterEach(async () => {
    await database.close()
  })

  const release = { status: 'completed' as const, transactionId: '0.0.1@1.2', transactionHash: '0x' + 'cd'.repeat(48), onchainState: 'Released' }

  it('lets exactly one of several concurrent claims through', async () => {
    const claims = await Promise.all(Array.from({ length: 5 }, () => database.claimPaymentForRelease(paymentId)))

    expect(claims.filter(Boolean)).toHaveLength(1)
    expect((await database.getPayment(paymentId))?.status).toBe('processing')
  })

  it('never claims a completed payment', async () => {
    await database.claimPaymentForRelease(paymentId)
    await database.recordPaymentRelease(paymentId, release)

    await expect(database.claimPaymentForRelease(paymentId)).resolves.toBe(false)
    expect(await database.getPayment(paymentId)).toMatchObject({
      status: 'completed', transaction_id: '0.0.1@1.2', transaction_hash: release.transactionHash, onchain_state: 'Released'
    })
  })

  it('does not let a late failure overwrite a recorded release', async () => {
    await database.claimPaymentForRelease(paymentId)
    await database.recordPaymentRelease(paymentId, release)
    await database.markPaymentFailed(paymentId)

    expect((await database.getPayment(paymentId))?.status).toBe('completed')
  })

  it('links the HCS audit record to the payment', async () => {
    await database.attachPaymentHcs(paymentId, '0.0.7@1.2')
    expect((await database.getPayment(paymentId))?.hcs_transaction_id).toBe('0.0.7@1.2')
  })

  it('stores the transaction id only on a payment that is being processed', async () => {
    await expect(database.setPaymentTransactionId(paymentId, '0.0.1@1.2')).resolves.toBe(false)
    await database.claimPaymentForRelease(paymentId)
    await expect(database.setPaymentTransactionId(paymentId, '0.0.1@1.2')).resolves.toBe(true)
    expect((await database.getPayment(paymentId))?.transaction_id).toBe('0.0.1@1.2')
  })

  it('reconciles only the payment still bound to the expected status and transaction id', async () => {
    await database.claimPaymentForRelease(paymentId)
    await database.setPaymentTransactionId(paymentId, '0.0.1@1.2')
    await database.markPaymentFailed(paymentId)

    // A retry claimed the payment with a new transaction id: the old outcome must not apply
    await database.claimPaymentForRelease(paymentId)
    await database.setPaymentTransactionId(paymentId, '0.0.1@3.4')
    await database.recordPaymentRelease(paymentId, release, 'failed', '0.0.1@1.2')
    await database.markPaymentFailed(paymentId, '0.0.1@1.2')
    expect(await database.getPayment(paymentId)).toMatchObject({ status: 'processing', transaction_id: '0.0.1@3.4' })

    await database.recordPaymentRelease(paymentId, release, 'processing', '0.0.1@3.4')
    expect((await database.getPayment(paymentId))?.status).toBe('completed')
  })

  it('ignores a stale outcome for a failed payment whose transaction id was replaced by a retry', async () => {
    await database.claimPaymentForRelease(paymentId)
    await database.setPaymentTransactionId(paymentId, '0.0.1@1.2')
    await database.markPaymentFailed(paymentId)
    // Retry with a new id that also failed: same status, different transaction
    await database.claimPaymentForRelease(paymentId)
    await database.setPaymentTransactionId(paymentId, '0.0.1@3.4')
    await database.markPaymentFailed(paymentId)

    await database.recordPaymentRelease(paymentId, release, 'failed', '0.0.1@1.2')
    expect(await database.getPayment(paymentId)).toMatchObject({ status: 'failed', transaction_id: '0.0.1@3.4' })

    await database.recordPaymentRelease(paymentId, release, 'failed', '0.0.1@3.4')
    expect((await database.getPayment(paymentId))?.status).toBe('completed')
  })

  it('lists processing payments and failed payments that carry a transaction id for reconciliation', async () => {
    await database.claimPaymentForRelease(paymentId)
    expect((await database.getPaymentsToReconcile()).map(p => p.id)).toEqual([paymentId])
    await database.markPaymentFailed(paymentId)
    expect(await database.getPaymentsToReconcile()).toEqual([])
    await database.claimPaymentForRelease(paymentId)
    await database.setPaymentTransactionId(paymentId, '0.0.1@1.2')
    await database.markPaymentFailed(paymentId)
    expect((await database.getPaymentsToReconcile()).map(p => p.id)).toEqual([paymentId])
  })

  it('records a release only for a payment that is being processed', async () => {
    await database.recordPaymentRelease(paymentId, release)

    expect(await database.getPayment(paymentId)).toMatchObject({ status: 'failed', transaction_hash: null })
  })
})
