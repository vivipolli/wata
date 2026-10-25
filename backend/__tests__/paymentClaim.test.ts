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

  it('records a release only for a payment that is being processed', async () => {
    await database.recordPaymentRelease(paymentId, release)

    expect(await database.getPayment(paymentId)).toMatchObject({ status: 'failed', transaction_hash: null })
  })
})
