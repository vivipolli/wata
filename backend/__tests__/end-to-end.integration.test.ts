import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals'
import { PrismaDatabase, getPrismaClient } from '../src/services/orm/prismaDatabase'
import { HederaService } from '../src/services/hedera'
import { RelayerService } from '../src/services/relayer'
import { hcsService } from '../src/services/hcs'
import { hfsService } from '../src/services/hfs'

class MockHederaService extends HederaService {
  async initialize(): Promise<void> {
    console.log('Mock Hedera service initialized for E2E')
  }

  async transferHBAR(): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    return {
      success: true,
      transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`
    }
  }

  async getAccountInfo(): Promise<any> {
    return {
      balance: { toString: () => '10000000000' }
    }
  }
}

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
  let database: PrismaDatabase
  let hederaService: HederaService
  let relayerService: RelayerService

  beforeAll(async () => {
    process.env.DATABASE_URL = 'file:./data/test-db.sqlite'
    database = new PrismaDatabase()
    await database.initialize()

    hederaService = new MockHederaService()
    await hederaService.initialize()

    relayerService = new RelayerService(hederaService, database)
    await relayerService.initialize()
  })

  afterAll(async () => {
    relayerService.stop()
    await database.close()
  })

  beforeEach(async () => {
    // Clean up database before each test
    const prisma = getPrismaClient()
    try {
      await prisma.$transaction([
        prisma.oracle_logs.deleteMany(),
        prisma.audit_records.deleteMany(),
        prisma.payments.deleteMany(),
        prisma.readings.deleteMany(),
        prisma.batches.deleteMany(),
        prisma.agreements.deleteMany(),
        prisma.investments.deleteMany()
      ])
    } catch (error) {
      // Ignore errors if tables don't exist yet
    }
  })

  describe('Complete Flow: Investor → Producer Payment', () => {
    it('should complete full flow: agreement creation → investment → oracle submission → automatic payment', async () => {
      const agreementId = await database.createAgreement({
        agreementHash: 'e2e-test-agreement',
        producerName: 'E2E Test Producer',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50
      })

      expect(agreementId).toBeGreaterThan(0)

      await database.createInvestment({
        agreementId,
        investorAddress: '0.0.789012',
        amount: 10000
      })

      const prisma = getPrismaClient()
      await prisma.agreements.update({
        where: { id: agreementId },
        data: { total_invested: 10000 }
      })

      const batchId = await database.createBatch({
        agreementId,
        auditHash: 'e2e-audit-hash-123',
        oracleSignature: 'e2e-oracle-signature',
        score: 85,
        readingsCount: 10,
        averageTurbidity: 5.2,
        medianTurbidity: 5.0,
        outliersDetected: 0,
        validationStatus: 'validated',
        oracleAddress: '0.0.oracle'
      })

      await database.updateBatchStatus(batchId, 'validated', new Date())

      const paymentAmount = 5000
      const auditHash = 'e2e-audit-hash-123'
      const score = 85
      const investor = '0.0.789012'
      const producer = '0.0.123456'

      const hcsPublishSpy = jest.spyOn(hcsService, 'publishAuditRecord')
      const hfsCreateSpy = jest.spyOn(hfsService, 'createAuditReport')

      await (relayerService as any).handlePaymentApproved(
        agreementId,
        producer,
        investor,
        paymentAmount,
        auditHash,
        score,
        '',
        '',
        '0xe2e1234567890abcdef'
      )

      const payments = await database.getPaymentsByAgreement(agreementId)
      expect(payments).toHaveLength(1)
      expect(payments[0].amount).toBe(paymentAmount)
      expect(payments[0].status).toBe('completed')
      expect(payments[0].score).toBe(score)
      expect(payments[0].audit_hash).toBe(auditHash)
      expect(payments[0].hcs_transaction_id).toBeDefined()
      expect(payments[0].hfs_file_id).toBeDefined()
      expect(payments[0].investor_address).toBeDefined()

      expect(hcsPublishSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          agreementId: agreementId.toString(),
          auditHash,
          score,
          producerAddress: producer,
          investorAddress: investor
        })
      )

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

      const batch = await database.getBatch(batchId)
      expect(batch).toBeDefined()
      expect(batch?.score).toBe(score)
      expect(batch?.audit_hash).toBe(auditHash)

      hcsPublishSpy.mockRestore()
      hfsCreateSpy.mockRestore()
    })

    it('should reject payment for score below threshold', async () => {
      const agreementId = await database.createAgreement({
        agreementHash: 'e2e-test-agreement-low-score',
        producerName: 'E2E Test Producer Low Score',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50
      })

      const batchId = await database.createBatch({
        agreementId,
        auditHash: 'e2e-audit-hash-low-score',
        oracleSignature: 'e2e-oracle-signature-low',
        score: 65,
        readingsCount: 10,
        averageTurbidity: 15.2,
        medianTurbidity: 15.0,
        outliersDetected: 2,
        validationStatus: 'validated',
        oracleAddress: '0.0.oracle'
      })

      await database.updateBatchStatus(batchId, 'validated', new Date())

      const payments = await database.getPaymentsByAgreement(agreementId)
      expect(payments).toHaveLength(0)

      const batch = await database.getBatch(batchId)
      expect(batch).toBeDefined()
      expect(batch?.score).toBe(65)
    })

    it('should handle multiple payments for same agreement', async () => {
      const agreementId = await database.createAgreement({
        agreementHash: 'e2e-test-agreement-multiple',
        producerName: 'E2E Test Producer Multiple',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50
      })

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
        '0.0.789012',
        5000,
        'e2e-audit-hash-1',
        85,
        '',
        '',
        '0xe2e1234567890abcdef1'
      )

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
        '0.0.789012',
        5000,
        'e2e-audit-hash-2',
        90,
        '',
        '',
        '0xe2e1234567890abcdef2'
      )

      const payments = await database.getPaymentsByAgreement(agreementId)
      expect(payments).toHaveLength(2)
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
        hectares: 50
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

      await (relayerService as any).handlePaymentApproved(
        agreementId,
        '0.0.123456',
        '0.0.789012',
        5000,
        'e2e-audit-hash-auto',
        85,
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
        producerAddress: 'invalid-address',
        baseValue: 100,
        hectares: 50
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

      const originalTransferHBAR = hederaService.transferHBAR
      const mockTransferHBAR = jest.fn().mockImplementation(() =>
        Promise.resolve({
          success: false,
          error: 'Transfer failed'
        })
      )
      ;(hederaService as any).transferHBAR = mockTransferHBAR

      await expect(
        (relayerService as any).handlePaymentApproved(
          agreementId,
          '0.0.123456',
          '0.0.789012',
          5000,
          'e2e-audit-hash-error',
          85,
          '',
          '',
          '0xe2e1234567890abcdef'
        )
      ).resolves.not.toThrow()

      ;(hederaService as any).transferHBAR = originalTransferHBAR
    })
  })
})
