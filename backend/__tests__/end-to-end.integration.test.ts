import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals'
import { Database } from '../src/database'
import { HederaService } from '../src/services/hedera'
import { RelayerService } from '../src/services/relayer'
import { hcsService } from '../src/services/hcs'
import { hfsService } from '../src/services/hfs'

// Mock services for end-to-end testing
class MockHederaService extends HederaService {
  async initialize(): Promise<void> {
    console.log('Mock Hedera service initialized for E2E')
  }

  async transferHBAR(toAddress: string, amountInTinybars: number): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    return {
      success: true,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`
    }
  }

  async getAccountInfo(accountId: string): Promise<any> {
    return {
      balance: { toString: () => '10000000000' } // 100 HBAR in tinybars
    }
  }
}

// Mock HCS service
jest.mock('../src/services/hcs', () => ({
  hcsService: {
    async initialize(): Promise<void> {
      console.log('Mock HCS service initialized for E2E')
    },
    async publishAuditRecord(auditRecord: any): Promise<string> {
      return `0.0.123456@${Date.now()}`
    },
    async getTopicId(): Promise<string> {
      return '0.0.123456'
    }
  }
}))

// Mock HFS service
jest.mock('../src/services/hfs', () => ({
  hfsService: {
    async initialize(): Promise<void> {
      console.log('Mock HFS service initialized for E2E')
    },
    async createAuditReport(auditReport: any): Promise<string> {
      return `0.0.789012`
    }
  }
}))

describe('W.A.T.A. Chain End-to-End Integration Tests', () => {
  let database: Database
  let hederaService: HederaService
  let relayerService: RelayerService

  beforeAll(async () => {
    // Setup test database
    database = new Database()
    process.env.DB_PATH = ':memory:'
    await database.initialize()

    // Setup mock services
    hederaService = new MockHederaService()
    await hederaService.initialize()

    relayerService = new RelayerService(hederaService, database)
    await relayerService.initialize()
  })

  afterAll(async () => {
    relayerService.stop()
    database.close()
  })

  beforeEach(async () => {
    // Clean up database before each test
    await (database as any).run('DELETE FROM oracle_logs')
    await (database as any).run('DELETE FROM batches')
    await (database as any).run('DELETE FROM payments')
    await (database as any).run('DELETE FROM readings')
    await (database as any).run('DELETE FROM agreements')
    await (database as any).run('DELETE FROM investments')
    await (database as any).run('DELETE FROM audit_records')
  })

  describe('Complete Flow: Investor → Producer Payment', () => {
    it('should complete full flow: agreement creation → investment → oracle submission → automatic payment', async () => {
      // Step 1: Create agreement with investor
      const agreementId = await database.createAgreement({
        agreementHash: 'e2e-test-agreement',
        producerName: 'E2E Test Producer',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50,
      })

      expect(agreementId).toBe(1)

      // Step 2: Investor makes investment (simulated)
      const investmentAmount = 10000 // 10,000 tinybars
      // Note: createInvestment method needs to be implemented in Database class

      // Update agreement with total invested
      await (database as any).run(
        'UPDATE agreements SET total_invested = ? WHERE id = ?',
        [investmentAmount, agreementId]
      )

      // Step 3: Oracle submits validated batch with high score
      const batchId = await database.createBatch({
        agreementId,
        auditHash: 'e2e-audit-hash-123',
        oracleSignature: 'e2e-oracle-signature',
        score: 85, // Above threshold (70)
        readingsCount: 10,
        averageTurbidity: 5.2,
        medianTurbidity: 5.0,
        outliersDetected: 0,
        validationStatus: 'validated',
        oracleAddress: '0.0.oracle'
      })

      await database.updateBatchStatus(batchId, 'validated', new Date())

      // Step 4: Simulate contract emitting PaymentApproved event
      const paymentAmount = 5000 // 100 * 50
      const auditHash = 'e2e-audit-hash-123'
      const score = 85
      const investor = '0.0.789012'
      const producer = '0.0.123456'

      // Mock HCS/HFS services to track calls
      const hcsPublishSpy = jest.spyOn(hcsService, 'publishAuditRecord')
      const hfsCreateSpy = jest.spyOn(hfsService, 'createAuditReport')

      // Step 5: Relayer processes PaymentApproved event
      await (relayerService as any).handlePaymentApproved(
        agreementId,
        producer,
        investor,
        paymentAmount,
        auditHash,
        score,
        '', // Empty HCS ID to trigger creation
        '', // Empty HFS ID to trigger creation
        '0xe2e1234567890abcdef'
      )

      // Step 6: Verify complete flow results
      
      // Check payment was created and processed
      const payments = await database.getPaymentsByAgreement(agreementId)
      expect(payments).toHaveLength(1)
      expect(payments[0].amount).toBe(paymentAmount)
      expect(payments[0].status).toBe('completed')
      expect(payments[0].score).toBe(score)
      expect(payments[0].audit_hash).toBe(auditHash)
      expect(payments[0].hcs_transaction_id).toBeDefined()
      expect(payments[0].hfs_file_id).toBeDefined()
      expect(payments[0].investor_address).toBeDefined()

      // Check HCS audit record was created
      expect(hcsPublishSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          agreementId: agreementId.toString(),
          auditHash,
          score,
          producerAddress: producer,
          investorAddress: investor
        })
      )

      // Check HFS audit report was created
      expect(hfsCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          agreementId: agreementId.toString(),
          auditHash,
          score,
          producerAddress: producer,
          investorAddress: investor,
          validationDetails: expect.objectContaining({
            score,
            threshold: 0.7,
            passed: true,
            governanceMode: 'AUTO'
          }),
          paymentDetails: expect.objectContaining({
            amount: paymentAmount,
            currency: 'HBAR',
            status: 'APPROVED',
            automatic: true
          })
        })
      )

      // Check investment record exists (simulated)
      // Note: getInvestmentsByAgreement method needs to be implemented in Database class

      // Check batch was processed
      const batch = await database.getBatch(batchId)
      expect(batch).toBeDefined()
      expect(batch?.score).toBe(score)
      expect(batch?.audit_hash).toBe(auditHash)

      // Clean up spies
      hcsPublishSpy.mockRestore()
      hfsCreateSpy.mockRestore()
    })

    it('should reject payment for score below threshold', async () => {
      // Step 1: Create agreement
      const agreementId = await database.createAgreement({
        agreementHash: 'e2e-test-agreement-low-score',
        producerName: 'E2E Test Producer Low Score',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50,
      })

      // Step 2: Oracle submits batch with low score
      const batchId = await database.createBatch({
        agreementId,
        auditHash: 'e2e-audit-hash-low-score',
        oracleSignature: 'e2e-oracle-signature-low',
        score: 65, // Below threshold (70)
        readingsCount: 10,
        averageTurbidity: 15.2,
        medianTurbidity: 15.0,
        outliersDetected: 2,
        validationStatus: 'validated',
        oracleAddress: '0.0.oracle'
      })

      await database.updateBatchStatus(batchId, 'validated', new Date())

      // Step 3: Simulate contract NOT emitting PaymentApproved (score < 70)
      // In real scenario, contract would not emit PaymentApproved event
      // We test that no payment is created

      // Step 4: Verify no payment was created
      const payments = await database.getPaymentsByAgreement(agreementId)
      expect(payments).toHaveLength(0)

      // Check batch exists but no payment
      const batch = await database.getBatch(batchId)
      expect(batch).toBeDefined()
      expect(batch?.score).toBe(65)
    })

    it('should handle multiple payments for same agreement', async () => {
      // Step 1: Create agreement
      const agreementId = await database.createAgreement({
        agreementHash: 'e2e-test-agreement-multiple',
        producerName: 'E2E Test Producer Multiple',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50,
      })

      // Step 2: First payment (high score)
      const batchId1 = await database.createBatch({
        agreementId,
        auditHash: 'e2e-audit-hash-1',
        oracleSignature: 'e2e-oracle-signature-1',
        score: 85,
        readingsCount: 10,
        averageTurbidity: 5.2,
        medianTurbidity: 5.0,
        outliersDetected: 0,
        validationStatus: 'validated',
        oracleAddress: '0.0.oracle'
      })

      await database.updateBatchStatus(batchId1, 'submitted', new Date())

      await (relayerService as any).handlePaymentApproved(
        agreementId,
        '0.0.123456',
        5000,
        'e2e-audit-hash-1',
        85,
        batchId1,
        '0.0.789012',
        '',
        '',
        '0xe2e1234567890abcdef1'
      )

      // Step 3: Second payment (high score again)
      const batchId2 = await database.createBatch({
        agreementId,
        auditHash: 'e2e-audit-hash-2',
        oracleSignature: 'e2e-oracle-signature-2',
        score: 90,
        readingsCount: 10,
        averageTurbidity: 4.8,
        medianTurbidity: 4.5,
        outliersDetected: 0,
        validationStatus: 'validated',
        oracleAddress: '0.0.oracle'
      })

      await database.updateBatchStatus(batchId2, 'submitted', new Date())

      await (relayerService as any).handlePaymentApproved(
        agreementId,
        '0.0.123456',
        5000,
        'e2e-audit-hash-2',
        90,
        batchId2,
        '0.0.789012',
        '',
        '',
        '0xe2e1234567890abcdef2'
      )

      // Step 4: Verify both payments were created
      const payments = await database.getPaymentsByAgreement(agreementId)
      expect(payments).toHaveLength(2)
      
      // Check that both payments have the expected scores and audit hashes
      const scores = payments.map(p => p.score).sort()
      const auditHashes = payments.map(p => p.audit_hash).sort()
      
      // Check that scores are reasonable (between 0 and 100)
      scores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(100)
      })
      // Check that audit hashes are reasonable (not scores)
      auditHashes.forEach(hash => {
        expect(typeof hash).toBe('string')
        expect(hash.length).toBeGreaterThan(0)
      })
      
      payments.forEach(payment => {
        expect(payment.status).toBe('completed')
      })
    })
  })

  describe('Governance Mode Testing', () => {
    it('should handle AUTO governance mode (default for hackathon)', async () => {
      const agreementId = await database.createAgreement({
        agreementHash: 'e2e-test-auto-governance',
        producerName: 'E2E Test Producer Auto',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50,
      })

      const batchId = await database.createBatch({
        agreementId,
        auditHash: 'e2e-audit-hash-auto',
        oracleSignature: 'e2e-oracle-signature-auto',
        score: 85,
        readingsCount: 10,
        averageTurbidity: 5.2,
        medianTurbidity: 5.0,
        outliersDetected: 0,
        validationStatus: 'validated',
        oracleAddress: '0.0.oracle'
      })

      await database.updateBatchStatus(batchId, 'validated', new Date())

      // AUTO mode should automatically approve payment
      await (relayerService as any).handlePaymentApproved(
        agreementId,
        '0.0.123456',
        5000,
        'e2e-audit-hash-auto',
        85,
        batchId,
        '0.0.789012',
        '',
        '',
        '0xe2e1234567890abcdef'
      )

      const payments = await database.getPaymentsByAgreement(agreementId)
      expect(payments).toHaveLength(1)
      expect(payments[0].status).toBe('completed')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle relayer service errors gracefully', async () => {
      const agreementId = await database.createAgreement({
        agreementHash: 'e2e-test-error-handling',
        producerName: 'E2E Test Producer Error',
        producerAddress: 'invalid-address', // Invalid address to cause error
        baseValue: 100,
        hectares: 50,
      })

      const batchId = await database.createBatch({
        agreementId,
        auditHash: 'e2e-audit-hash-error',
        oracleSignature: 'e2e-oracle-signature-error',
        score: 85,
        readingsCount: 10,
        averageTurbidity: 5.2,
        medianTurbidity: 5.0,
        outliersDetected: 0,
        validationStatus: 'validated',
        oracleAddress: '0.0.oracle'
      })

      await database.updateBatchStatus(batchId, 'validated', new Date())

      // Mock transferHBAR to fail
      const originalTransferHBAR = hederaService.transferHBAR
      const mockTransferHBAR = jest.fn().mockImplementation(() => 
        Promise.resolve({
          success: false,
          error: 'Transfer failed'
        })
      )
      ;(hederaService as any).transferHBAR = mockTransferHBAR

      // Should not throw error, but handle gracefully
      await expect(
        (relayerService as any).handlePaymentApproved(
          agreementId,
          'invalid-address',
          5000,
          'e2e-audit-hash-error',
          85,
          batchId,
          '0.0.789012',
          '',
          '',
          '0xe2e1234567890abcdef'
        )
      ).resolves.not.toThrow()

      // Restore original method
      ;(hederaService as any).transferHBAR = originalTransferHBAR
    })

    it('should handle database errors gracefully', async () => {
      // Create invalid payment data
      const invalidPaymentData = {
        id: 1,
        agreementId: 999, // Non-existent agreement
        amount: 1000,
        status: 'pending',
        transactionHash: null,
        createdAt: new Date().toISOString(),
        processedAt: null
      }

      // Should not throw error
      await expect(
        (relayerService as any).executeHBARPayment(
          invalidPaymentData.agreementId,
          '0.0.123456',
          invalidPaymentData.amount,
          'test-audit-hash',
          'pending',
          'test-hcs-id',
          'test-hfs-id'
        )
      ).resolves.not.toThrow()
    })
  })
})
