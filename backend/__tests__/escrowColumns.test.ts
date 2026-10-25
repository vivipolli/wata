import { describe, it, expect, beforeEach, afterEach, afterAll } from '@jest/globals'
import { execSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaDatabase, getPrismaClient } from '../src/services/orm/prismaDatabase'

// Escrow v3 values are uint256 in the contract's native unit; they must survive the database exactly.
const ABOVE_INT64 = '300000000000000000000'

describe('Escrow v3 columns', () => {
  let database: PrismaDatabase

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
  })

  afterEach(async () => {
    await database.close()
  })

  async function seedAgreementAndBatch() {
    const agreementId = await database.createAgreement({
      agreementHash: 'escrow-columns-' + Date.now(),
      producerName: 'Producer',
      producerAddress: '0.0.123456',
      baseValue: 1,
      hectares: 1
    })
    const batchId = await database.createBatch({
      agreementId,
      auditHash: 'ab'.repeat(32),
      score: 0.9,
      readingsCount: 10,
      averageTurbidity: 5,
      validationStatus: 'validated'
    })
    return { agreementId, batchId }
  }

  it('stores a payment amount above the 64-bit range without loss', async () => {
    const { agreementId, batchId } = await seedAgreementAndBatch()

    const paymentId = await database.createPayment({
      agreementId,
      batchId,
      amount: ABOVE_INT64,
      status: 'pending',
      auditHash: 'ab'.repeat(32),
      score: 0.9
    })

    const payment = await database.getPayment(paymentId)
    expect(payment?.amount).toBe(ABOVE_INT64)
  })

  it('records the on-chain period, transaction and state of a payment', async () => {
    const { agreementId, batchId } = await seedAgreementAndBatch()

    const paymentId = await database.createPayment({
      agreementId,
      batchId,
      amount: '100',
      status: 'pending',
      auditHash: 'ab'.repeat(32),
      periodId: 0,
      transactionId: '0.0.1001@1700000000.000000001',
      onchainState: 'Approved'
    })

    const payment = await database.getPayment(paymentId)
    expect(payment?.period_id).toBe(0)
    expect(payment?.transaction_id).toBe('0.0.1001@1700000000.000000001')
    expect(payment?.onchain_state).toBe('Approved')
  })

  it('keeps the escrow terms of an agreement and the period of a batch', async () => {
    const { agreementId, batchId } = await seedAgreementAndBatch()
    const prisma = getPrismaClient()

    await prisma.agreements.update({
      where: { id: agreementId },
      data: { period_amount: ABOVE_INT64, score_threshold: 70 }
    })
    await prisma.batches.update({ where: { id: batchId }, data: { period_id: 0 } })

    const agreement = await prisma.agreements.findUnique({ where: { id: agreementId } })
    const batch = await prisma.batches.findUnique({ where: { id: batchId } })
    expect(agreement?.period_amount).toBe(ABOVE_INT64)
    expect(agreement?.score_threshold).toBe(70)
    expect(batch?.period_id).toBe(0)
  })
})

describe('Agreement on-chain link', () => {
  let database: PrismaDatabase

  beforeEach(async () => {
    process.env.DATABASE_URL = 'file:./data/test-db.sqlite'
    database = new PrismaDatabase()
    await database.initialize()
    const prisma = getPrismaClient()
    await prisma.$transaction([
      prisma.payments.deleteMany(),
      prisma.batches.deleteMany(),
      prisma.readings.deleteMany(),
      prisma.agreements.deleteMany()
    ])
  })

  afterEach(async () => {
    await database.close()
  })

  const create = (hash: string) => database.createAgreement({
    agreementHash: hash, producerName: 'P', producerAddress: '0x' + '11'.repeat(20), baseValue: 1, hectares: 1,
    periodAmount: '100', scoreThreshold: 70, governanceMode: 'HYBRID'
  })

  it('stores the escrow terms given at creation', async () => {
    const id = await create('terms')
    expect(await database.getAgreement(id)).toMatchObject({ period_amount: '100', score_threshold: 70, governance_mode: 'HYBRID' })
  })

  it('links an agreement once, including on-chain id 0, and never replaces the link', async () => {
    const id = await create('once')

    await expect(database.linkAgreementOnchain(id, 0, '0.0.1@1.2')).resolves.toBe(true)
    await expect(database.linkAgreementOnchain(id, 5)).resolves.toBe(false)
    expect(await database.getAgreement(id)).toMatchObject({ blockchain_id: 0, transaction_id: '0.0.1@1.2' })
  })

  it('refuses to link one on-chain agreement to two local agreements', async () => {
    const first = await create('first')
    const second = await create('second')

    await database.linkAgreementOnchain(first, 3)
    await expect(database.linkAgreementOnchain(second, 3)).rejects.toMatchObject({ code: 'P2002' })
  })
})

describe('Escrow v3 migration', () => {
  const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations')
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wata-migration-'))
  const dbUrl = 'file:' + path.join(workDir, 'migration.db')
  let client: PrismaClient | undefined

  afterAll(async () => {
    await client?.$disconnect()
    fs.rmSync(workDir, { recursive: true, force: true })
  })

  function deploy(migrationNames: string[]) {
    const target = path.join(workDir, 'migrations')
    fs.rmSync(target, { recursive: true, force: true })
    fs.mkdirSync(target)
    fs.copyFileSync(path.join(migrationsDir, 'migration_lock.toml'), path.join(target, 'migration_lock.toml'))
    for (const name of migrationNames) {
      fs.cpSync(path.join(migrationsDir, name), path.join(target, name), { recursive: true })
    }
    fs.copyFileSync(path.join(__dirname, '..', 'prisma', 'schema.prisma'), path.join(workDir, 'schema.prisma'))
    execSync(`npx prisma migrate deploy --schema ${path.join(workDir, 'schema.prisma')}`, {
      env: { ...process.env, DATABASE_URL: dbUrl },
      stdio: 'pipe'
    })
  }

  it('converts existing integer amounts to exact text and adds the escrow columns', async () => {
    const all = fs.readdirSync(migrationsDir).filter(n => fs.statSync(path.join(migrationsDir, n)).isDirectory()).sort()
    const escrow = all.filter(n => n.includes('escrow_v3'))
    expect(escrow).toHaveLength(1)
    const before = all.filter(n => n < escrow[0])

    deploy(before)
    client = new PrismaClient({ datasources: { db: { url: dbUrl } } })
    await client.$executeRawUnsafe(
      `INSERT INTO agreements (agreement_hash, producer_name, producer_address, base_value, hectares) VALUES ('h', 'p', '0.0.1', 1, 1)`
    )
    await client.$executeRawUnsafe(
      `INSERT INTO payments (agreement_id, amount, status, audit_hash) VALUES (1, 5000, 'pending', 'aa')`
    )
    await client.$disconnect()
    client = undefined

    deploy(all)
    client = new PrismaClient({ datasources: { db: { url: dbUrl } } })
    const rows = await client.$queryRawUnsafe<Array<{ kind: string; amount: string }>>(
      `SELECT typeof(amount) AS kind, amount FROM payments`
    )
    expect(rows).toEqual([{ kind: 'text', amount: '5000' }])

    const columns = async (table: string) =>
      (await client!.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info(${table})`)).map(c => c.name)
    expect(await columns('payments')).toEqual(expect.arrayContaining(['period_id', 'transaction_id', 'onchain_state']))
    expect(await columns('batches')).toEqual(expect.arrayContaining(['period_id']))
    expect(await columns('agreements')).toEqual(expect.arrayContaining(['period_amount', 'score_threshold']))

    // The unique payment index from the data-integrity migration must survive the table rebuild
    const indexes = await client.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA index_list(payments)`)
    expect(indexes.map(i => i.name)).toContain('payments_agreement_id_audit_hash_key')
  })
})
