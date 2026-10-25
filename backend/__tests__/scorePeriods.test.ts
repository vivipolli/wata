import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { PrismaDatabase, getPrismaClient } from '../src/services/orm/prismaDatabase'

// A period of an agreement is scored once: overlapping periods are refused; the same unsubmitted
// period (same audit hash) can be resumed.
describe('Score period reservation', () => {
  let database: PrismaDatabase
  let agreementId: number

  beforeEach(async () => {
    process.env.DATABASE_URL = 'file:./data/test-db.sqlite'
    database = new PrismaDatabase()
    await database.initialize()
    const prisma = getPrismaClient()
    await prisma.$transaction([prisma.payments.deleteMany(), prisma.oracle_logs.deleteMany(), prisma.batches.deleteMany(), prisma.agreements.deleteMany()])
    agreementId = await database.createAgreement({ agreementHash: 'sp-' + Date.now(), producerName: 'P', producerAddress: '0x' + '11'.repeat(20), baseValue: 1, hectares: 1 })
  })

  afterEach(async () => {
    await database.close()
  })

  const period = (from: string, to: string, hash: string) => ({
    agreementId, auditHash: hash, score: 0.9, readingsCount: 10, periodStart: new Date(from), periodEnd: new Date(to),
    scoreVersion: 1, auditDocument: '{}'
  })

  it('creates a batch with the period, rule version and audit document, without turbidity', async () => {
    const result = await database.reserveScoreBatch(period('2024-01-01', '2024-12-31', 'a'.repeat(64)))
    expect(result).toMatchObject({ resumed: false })
    const batch = await database.getBatch((result as any).batchId)
    expect(batch).toMatchObject({ score_version: 1, audit_document: '{}', average_turbidity: null, validation_status: 'validated' })
  })

  it('refuses an overlapping period and allows an adjacent one', async () => {
    const first: any = await database.reserveScoreBatch(period('2024-01-01', '2024-12-31', 'a'.repeat(64)))
    await expect(database.reserveScoreBatch(period('2024-06-01', '2025-05-31', 'b'.repeat(64)))).resolves.toEqual({ overlap: first.batchId })
    await expect(database.reserveScoreBatch(period('2025-01-01', '2025-12-31', 'c'.repeat(64)))).resolves.toMatchObject({ resumed: false })
  })

  it('resumes the same unsubmitted period, but never one already submitted', async () => {
    const first: any = await database.reserveScoreBatch(period('2024-01-01', '2024-12-31', 'a'.repeat(64)))
    await expect(database.reserveScoreBatch(period('2024-01-01', '2024-12-31', 'a'.repeat(64)))).resolves.toEqual({ batchId: first.batchId, resumed: true })
    await database.updateBatchStatus(first.batchId, 'submitted', new Date(), first.batchId)
    await expect(database.reserveScoreBatch(period('2024-01-01', '2024-12-31', 'a'.repeat(64)))).resolves.toEqual({ overlap: first.batchId })
  })
})
