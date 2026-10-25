import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { PrismaDatabase, getPrismaClient } from '../src/services/orm/prismaDatabase'

// One certificate per payment; state changes apply only from the expected state and schedule.
describe('Certificate records', () => {
  let database: PrismaDatabase
  let paymentId: number

  beforeEach(async () => {
    process.env.DATABASE_URL = 'file:./data/test-db.sqlite'
    database = new PrismaDatabase()
    await database.initialize()
    const prisma = getPrismaClient()
    await prisma.$transaction([prisma.certificates.deleteMany(), prisma.payments.deleteMany(), prisma.agreements.deleteMany()])
    const agreementId = await database.createAgreement({ agreementHash: 'cert-' + Date.now(), producerName: 'P', producerAddress: '0x' + '11'.repeat(20), baseValue: 1, hectares: 1 })
    paymentId = await database.createPayment({ agreementId, amount: '100', status: 'completed', auditHash: 'ab'.repeat(32) })
  })

  afterEach(async () => {
    await database.close()
  })

  const scheduled = { cid: 'bafkreiexample', uri: 'ipfs://bafkreiexample', tokenId: '0.0.5000', scheduleId: '0.0.6000', scheduledTransactionId: '0.0.1@1.2?scheduled' }

  it('allows one certificate per payment', async () => {
    await database.createCertificate({ paymentId, metadataJson: '{}', metadataSha256: 'aa' })
    await expect(database.createCertificate({ paymentId, metadataJson: '{}', metadataSha256: 'aa' })).rejects.toMatchObject({ code: 'P2002' })
  })

  it('moves prepared -> scheduled -> minted only along the bound schedule', async () => {
    const id = await database.createCertificate({ paymentId, metadataJson: '{}', metadataSha256: 'aa' })

    await expect(database.markCertificateMinted(id, '0.0.6000', { serialNumber: 1, mintTransactionHash: null })).resolves.toBe(false)
    await expect(database.markCertificateScheduled(id, scheduled)).resolves.toBe(true)
    await expect(database.markCertificateScheduled(id, scheduled)).resolves.toBe(false)
    await expect(database.markCertificateMinted(id, '0.0.9999', { serialNumber: 1, mintTransactionHash: null })).resolves.toBe(false)
    await expect(database.markCertificateMinted(id, '0.0.6000', { serialNumber: 12, mintTransactionHash: '0x01' })).resolves.toBe(true)

    expect(await database.getCertificate(id)).toMatchObject({ status: 'minted', serial_number: 12, schedule_id: '0.0.6000' })
    await expect(database.markCertificateFailed(id, '0.0.6000')).resolves.toBe(false)
  })

  it('lets a failed certificate be scheduled again', async () => {
    const id = await database.createCertificate({ paymentId, metadataJson: '{}', metadataSha256: 'aa' })
    await database.markCertificateScheduled(id, scheduled)
    await expect(database.markCertificateFailed(id, '0.0.6000')).resolves.toBe(true)
    await expect(database.markCertificateScheduled(id, { ...scheduled, scheduleId: '0.0.6001' })).resolves.toBe(true)
    expect((await database.getCertificateByPayment(paymentId))?.schedule_id).toBe('0.0.6001')
  })
})
