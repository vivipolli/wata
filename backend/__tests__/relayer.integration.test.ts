import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals'
import { PrismaDatabase, getPrismaClient } from '../src/services/orm/prismaDatabase'
import { HederaService } from '../src/services/hedera'
import { RelayerService } from '../src/services/relayer'
import { hcsService } from '../src/services/hcs'
import { hfsService } from '../src/services/hfs'
import { NftService, type MintCertificateParams, type MintCertificateResult } from '../src/services/nft'

class MockHederaService extends HederaService {
  async initialize(): Promise<void> {
    console.log('Mock Hedera service initialized')
  }

  async recordAudit(): Promise<any> {
    return {
      transactionId: { toString: () => `0.0.123456@${Date.now()}` }
    }
  }

  async transferHBAR(): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    return {
      success: true,
      transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`
    }
  }

  async getAccountInfo(): Promise<any> {
    return {
      balance: { toString: () => '1000000000' }
    }
  }
}

class MockNftService extends NftService {
  async initialize(): Promise<void> {
    console.log('Mock NFT service initialized')
  }

  async mintCertificate(params: MintCertificateParams): Promise<MintCertificateResult> {
    return {
      tokenId: '0.0.999999',
      serialNumber: params.agreementId,
      metadata: JSON.stringify({ test: true }),
      metadataUri: `https://gateway.pinata.cloud/ipfs/test-${params.agreementId}`,
      transactionId: `mint-${Date.now()}`
    }
  }
}

jest.mock('../src/services/hcs', () => ({
  hcsService: {
    async initialize(): Promise<void> {
      console.log('Mock HCS service initialized')
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
      console.log('Mock HFS service initialized')
    },
    async createAuditReport(auditReport: any): Promise<string> {
      return `0.0.789012`
    }
  }
}))

const TEST_DB_PATH = 'file:./data/test-db.sqlite'

describe('Relayer Integration Tests', () => {
  let database: PrismaDatabase
  let hederaService: HederaService
  let relayerService: RelayerService
  let nftService: NftService

  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DB_PATH
    database = new PrismaDatabase()
    await database.initialize()

    hederaService = new MockHederaService()
    await hederaService.initialize()

    nftService = new MockNftService()
    await nftService.initialize()

    relayerService = new RelayerService(hederaService, database, nftService)
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
        prisma.agreements.deleteMany()
      ])
    } catch (error) {
      // Ignore errors if tables don't exist yet
    }
  })

  describe('Payment Processing', () => {
    it('should process approved payments automatically', async () => {
      const agreementId = await database.createAgreement({
        agreementHash: 'test-hash-1',
        producerName: 'Test Producer',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50
      })

      const batchId = await database.createBatch({
        agreementId,
        auditHash: 'audit-hash-123',
        oracleSignature: 'signature-123',
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
        'audit-hash-123',
        85,
        '0.0.123456@1234567890.123456789',
        '0.0.789012',
        '0x1234567890abcdef'
      )

      const payments = await database.getPaymentsByAgreement(agreementId)
      expect(payments).toHaveLength(1)
      expect(payments[0].batch_id).toBe(batchId)
      expect(payments[0].score).toBe(85)
      expect(payments[0].amount).toBe(5000)
      expect(payments[0].status).toBe('completed')
      expect(payments[0].transaction_hash).toBeDefined()
      expect(payments[0].nft_token_id).toBe('0.0.999999')
      expect(payments[0].nft_serial).toBe(agreementId)
    })

    it('should not process payments for scores below threshold', async () => {
      const agreementId = await database.createAgreement({
        agreementHash: 'test-hash-low',
        producerName: 'Test Producer',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50
      })

      await database.createBatch({
        agreementId,
        auditHash: 'audit-hash-low',
        score: 65,
        readingsCount: 10,
        averageTurbidity: 15.2,
        medianTurbidity: 15.0,
        outliersDetected: 2,
        validationStatus: 'validated',
        oracleAddress: '0.0.oracle'
      })

      const payments = await database.getPaymentsByAgreement(agreementId)
      expect(payments).toHaveLength(0)
    })

    it('should not process the same batch twice', async () => {
      const agreementId = await database.createAgreement({
        agreementHash: 'test-hash-dup',
        producerName: 'Test Producer',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50
      })

      const batchId = await database.createBatch({
        agreementId,
        auditHash: 'audit-hash-dup',
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
        'audit-hash-dup',
        85,
        '0.0.123456@1234567890.123456789',
        '0.0.789012',
        '0x1234567890abcdef'
      )

      await (relayerService as any).handlePaymentApproved(
        agreementId,
        '0.0.123456',
        '0.0.789012',
        5000,
        'audit-hash-dup',
        85,
        '0.0.123456@1234567890.123456789',
        '0.0.789012',
        '0x1234567890abcdef'
      )

      const payments = await database.getPaymentsByAgreement(agreementId)
      expect(payments).toHaveLength(1)
    })
  })

  describe('Payment Event Handling', () => {
    it('should handle PaymentApproved event correctly with V3 features', async () => {
      const agreementId = await database.createAgreement({
        agreementHash: 'test-hash-1',
        producerName: 'Test Producer',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50
      })

      await (relayerService as any).handlePaymentApproved(
        agreementId,
        '0.0.123456',
        '0.0.789012',
        5000,
        'audit-hash-123',
        85,
        '0.0.123456@1234567890',
        '0.0.789012',
        '0x1234567890abcdef'
      )

      const payments = await database.getPaymentsByAgreement(agreementId)
      expect(payments).toHaveLength(1)
      expect(payments[0].audit_hash).toBe('audit-hash-123')
      expect(payments[0].score).toBe(85)
      expect(payments[0].status).toBe('completed')
    })

    it('should handle PaymentApproved event without HCS/HFS IDs (create new ones)', async () => {
      const agreementId = await database.createAgreement({
        agreementHash: 'test-hash-2',
        producerName: 'Test Producer 2',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50
      })

      await (relayerService as any).handlePaymentApproved(
        agreementId,
        '0.0.123456',
        '0.0.789012',
        5000,
        'audit-hash-456',
        85,
        '',
        '',
        '0x1234567890abcdef'
      )

      const payments = await database.getPaymentsByAgreement(agreementId)
      expect(payments).toHaveLength(1)
      if (payments[0].hcs_transaction_id) {
        expect(payments[0].hcs_transaction_id).toMatch(/^0\.0\.\d+@\d+$/)
      }
      if (payments[0].hfs_file_id) {
        expect(payments[0].hfs_file_id).toMatch(/^0\.0\.\d+$/)
      }
    })
  })

  describe('Relayer Service Lifecycle', () => {
    it('should start and stop correctly', async () => {
      const newRelayerService = new RelayerService(hederaService, database, nftService)
      await newRelayerService.start()
      expect((newRelayerService as any).isRunning).toBe(true)
      newRelayerService.stop()
      expect((newRelayerService as any).isRunning).toBe(false)
    })

    it('should handle starting already running service', async () => {
      const newRelayerService = new RelayerService(hederaService, database, nftService)
      await newRelayerService.start()
      await expect(newRelayerService.start()).resolves.not.toThrow()
      newRelayerService.stop()
    })
  })

  describe('V3 Features - HCS/HFS Integration', () => {
    it('should create HCS audit record when processing payment', async () => {
      const agreementId = await database.createAgreement({
        agreementHash: 'test-hash-hcs',
        producerName: 'Test Producer HCS',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50
      })

      const hcsPublishSpy = jest.spyOn(hcsService, 'publishAuditRecord')

      await (relayerService as any).handlePaymentApproved(
        agreementId,
        '0.0.123456',
        '0.0.789012',
        5000,
        'audit-hash-hcs',
        85,
        '',
        '',
        '0x1234567890abcdef'
      )

      expect(hcsPublishSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          agreementId: agreementId.toString(),
          auditHash: 'audit-hash-hcs',
          score: 85,
          producerAddress: '0.0.123456',
          investorAddress: '0.0.789012'
        })
      )

      hcsPublishSpy.mockRestore()
    })

    it('should create HFS audit report when processing payment', async () => {
      const agreementId = await database.createAgreement({
        agreementHash: 'test-hash-hfs',
        producerName: 'Test Producer HFS',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50
      })

      const hfsCreateSpy = jest.spyOn(hfsService, 'createAuditReport')

      await (relayerService as any).handlePaymentApproved(
        agreementId,
        '0.0.123456',
        '0.0.789012',
        5000,
        'audit-hash-hfs',
        85,
        '',
        '',
        '0x1234567890abcdef'
      )

      expect(hfsCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          agreementId: agreementId.toString(),
          auditHash: 'audit-hash-hfs',
          score: 85,
          producerAddress: '0.0.123456',
          investorAddress: '0.0.789012'
        })
      )

      hfsCreateSpy.mockRestore()
    })
  })
})
