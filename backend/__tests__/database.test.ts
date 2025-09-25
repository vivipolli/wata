import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { Database } from '../src/database'

describe('Database Tests', () => {
  let database: Database

  beforeEach(async () => {
    // Use in-memory database for testing
    process.env.DB_PATH = ':memory:'
    database = new Database()
    await database.initialize()
  })

  afterEach(() => {
    database.close()
  })

  it('should create agreement with all V3 fields', async () => {
    const agreementId = await database.createAgreement({
      agreementHash: 'test-hash-123',
      producerName: 'Test Producer',
      producerAddress: '0.0.123456',
      baseValue: 100,
      hectares: 50
    })

    expect(agreementId).toBeGreaterThan(0)

    const agreement = await database.getAgreement(agreementId)
    expect(agreement).toBeDefined()
    expect(agreement?.producer_name).toBe('Test Producer')
    expect(agreement?.blockchain_id).toBeNull()
    expect(agreement?.investor_address).toBeNull()
    expect(agreement?.governance_mode).toBe('AUTO')
    expect(agreement?.total_invested).toBe(0)
    expect(agreement?.total_paid).toBe(0)
  })

  it('should create investment', async () => {
    // First create an agreement
    const agreementId = await database.createAgreement({
      agreementHash: 'test-hash-investment',
      producerName: 'Test Producer',
      producerAddress: '0.0.123456',
      baseValue: 100,
      hectares: 50
    })

    // Create investment
    const investmentId = await database.createInvestment({
      agreementId,
      investorAddress: '0.0.789012',
      amount: 1000,
      transactionHash: '0x1234567890abcdef'
    })

    expect(investmentId).toBeGreaterThan(0)

    const investment = await database.getInvestment(investmentId)
    expect(investment).toBeDefined()
    expect(investment?.agreement_id).toBe(agreementId)
    expect(investment?.investor_address).toBe('0.0.789012')
    expect(investment?.amount).toBe(1000)
  })

  it('should create audit record', async () => {
    // First create an agreement
    const agreementId = await database.createAgreement({
      agreementHash: 'test-hash-audit',
      producerName: 'Test Producer',
      producerAddress: '0.0.123456',
      baseValue: 100,
      hectares: 50
    })

    // Create audit record
    const auditId = await database.createAuditRecord({
      agreementId,
      auditHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      score: 85,
      producerAddress: '0.0.123456',
      investorAddress: '0.0.789012',
      hcsTransactionId: '0.0.123456@1234567890.123456789',
      hfsFileId: '0.0.789012'
    })

    expect(auditId).toBeGreaterThan(0)

    const audit = await database.getAuditRecord(auditId)
    expect(audit).toBeDefined()
    expect(audit?.agreement_id).toBe(agreementId)
    expect(audit?.audit_hash).toBe('0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890')
    expect(audit?.score).toBe(85)
    expect(audit?.hcs_transaction_id).toBe('0.0.123456@1234567890.123456789')
    expect(audit?.hfs_file_id).toBe('0.0.789012')
  })

  it('should create batch with validation status', async () => {
    // First create an agreement
    const agreementId = await database.createAgreement({
      agreementHash: 'test-hash-batch',
      producerName: 'Test Producer',
      producerAddress: '0.0.123456',
      baseValue: 100,
      hectares: 50
    })

    // Create batch
    const batchId = await database.createBatch({
      agreementId,
      auditHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      score: 75,
      readingsCount: 10,
      averageTurbidity: 2.5,
      validationStatus: 'pending'
    })

    expect(batchId).toBeGreaterThan(0)

    const batch = await database.getBatch(batchId)
    expect(batch).toBeDefined()
    expect(batch?.agreement_id).toBe(agreementId)
    expect(batch?.score).toBe(75)
    expect(batch?.validation_status).toBe('pending')
  })

  it('should create payment with V3 fields', async () => {
    // First create an agreement
    const agreementId = await database.createAgreement({
      agreementHash: 'test-hash-payment',
      producerName: 'Test Producer',
      producerAddress: '0.0.123456',
      baseValue: 100,
      hectares: 50
    })

    // Create batch
    const batchId = await database.createBatch({
      agreementId,
      auditHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      score: 75,
      readingsCount: 10,
      averageTurbidity: 2.5,
      validationStatus: 'pending'
    })

    // Create payment
    const paymentId = await database.createPayment({
      agreementId,
      batchId,
      amount: 5000,
      status: 'pending',
      auditHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      score: 75
    })

    expect(paymentId).toBeGreaterThan(0)

    const payment = await database.getPayment(paymentId)
    expect(payment).toBeDefined()
    expect(payment?.agreement_id).toBe(agreementId)
    expect(payment?.batch_id).toBe(batchId)
    expect(payment?.amount).toBe(5000)
    expect(payment?.status).toBe('pending')
    expect(payment?.score).toBe(75)
  })

  it('should get investments by agreement', async () => {
    // First create an agreement
    const agreementId = await database.createAgreement({
      agreementHash: 'test-hash-investments',
      producerName: 'Test Producer',
      producerAddress: '0.0.123456',
      baseValue: 100,
      hectares: 50
    })

    // Create multiple investments
    await database.createInvestment({
      agreementId,
      investorAddress: '0.0.111111',
      amount: 500
    })

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10))

    await database.createInvestment({
      agreementId,
      investorAddress: '0.0.222222',
      amount: 1000
    })

    const investments = await database.getInvestmentsByAgreement(agreementId)
    expect(investments).toHaveLength(2)
    
    // Check that both investments exist (order may vary due to timing)
    const amounts = investments.map(inv => inv.amount).sort((a, b) => b - a)
    expect(amounts).toEqual([1000, 500])
  })

  it('should get audit records by agreement', async () => {
    // First create an agreement
    const agreementId = await database.createAgreement({
      agreementHash: 'test-hash-audits',
      producerName: 'Test Producer',
      producerAddress: '0.0.123456',
      baseValue: 100,
      hectares: 50
    })

    // Create multiple audit records
    await database.createAuditRecord({
      agreementId,
      auditHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
      score: 80
    })

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10))

    await database.createAuditRecord({
      agreementId,
      auditHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
      score: 90
    })

    const audits = await database.getAuditRecordsByAgreement(agreementId)
    expect(audits).toHaveLength(2)
    
    // Check that both audit records exist (order may vary due to timing)
    const scores = audits.map(audit => audit.score).sort((a, b) => b - a)
    expect(scores).toEqual([90, 80])
  })
})
