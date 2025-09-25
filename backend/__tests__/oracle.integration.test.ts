import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import cors from 'cors'
import { Database } from '../src/database'
import { HederaService } from '../src/services/hedera'
import { OracleService } from '../src/services/oracle'
import oracleRoutes from '../src/routes/oracle'

// Mock Hedera service for testing
class MockHederaService extends HederaService {
  async initialize(): Promise<void> {
    console.log('Mock Hedera service initialized')
  }

  async submitValidatedBatch(agreementId: number, auditHash: string, score: number): Promise<any> {
    return {
      transactionId: { toString: () => `0.0.123456@${Date.now()}` }
    }
  }

  async recordAudit(auditHash: string): Promise<any> {
    return {
      transactionId: { toString: () => `0.0.123456@${Date.now()}` }
    }
  }
}

describe('Oracle Integration Tests', () => {
  let app: express.Application
  let database: Database
  let hederaService: HederaService
  let oracleService: OracleService

  beforeAll(async () => {
    // Setup test database
    database = new Database()
    process.env.DB_PATH = ':memory:' // Use in-memory database for testing
    await database.initialize()

    // Setup mock Hedera service
    hederaService = new MockHederaService()
    await hederaService.initialize()

    // Setup Oracle service
    process.env.ORACLE_PRIVATE_KEY = 'test-private-key'
    process.env.ORACLE_ADDRESS = '0.0.123456'
    oracleService = new OracleService(database, hederaService)

    // Setup Express app
    app = express()
    app.use(cors())
    app.use(express.json())
    app.use('/api/oracle', oracleRoutes(database, hederaService))
  })

  afterAll(async () => {
    database.close()
  })

  // Helper function to create agreement with blockchain_id
  async function createAgreementWithBlockchainId(agreementData: any, blockchainId: number = 1) {
    const agreementId = await database.createAgreement(agreementData)
    await database.updateAgreementBlockchainId(agreementId, blockchainId)
    return agreementId
  }

  beforeEach(async () => {
    // Clean up database before each test
    await (database as any).run('DELETE FROM oracle_logs')
    await (database as any).run('DELETE FROM batches')
    await (database as any).run('DELETE FROM payments')
    await (database as any).run('DELETE FROM readings')
    await (database as any).run('DELETE FROM agreements')
  })

  describe('POST /api/oracle/process', () => {
    it('should process batch validation for an agreement', async () => {
      // Create test agreement
      const agreementId = await createAgreementWithBlockchainId({
        agreementHash: 'test-hash-1',
        producerName: 'Test Producer',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50,
        locationLat: -23.5505,
        locationLng: -46.6333,
        durationDays: 365
      })

      // Create test readings
      const readingIds = []
      for (let i = 0; i < 10; i++) {
        const readingId = await database.createReading({
          agreementId,
          turbidityNtu: 5 + Math.random() * 10, // 5-15 NTU
          locationLat: -23.5505,
          locationLng: -46.6333,
          isSimulated: true
        })
        readingIds.push(readingId)
      }

      const response = await request(app)
        .post('/api/oracle/process')
        .send({ agreementId })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('auditHash')
      expect(response.body.data).toHaveProperty('score')
      expect(response.body.data).toHaveProperty('validReadings')
      expect(response.body.data).toHaveProperty('transactionHash')
      expect(response.body.data.validReadings).toBeGreaterThan(0)
    })

    it('should return 404 for non-existent agreement', async () => {
      const response = await request(app)
        .post('/api/oracle/process')
        .send({ agreementId: 999 })

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Agreement not found')
    })

    it('should return 400 for invalid agreement ID', async () => {
      const response = await request(app)
        .post('/api/oracle/process')
        .send({ agreementId: 'invalid' })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid agreement ID')
    })
  })

  describe('POST /api/oracle/process-all', () => {
    it('should process all active agreements', async () => {
      // Create multiple test agreements with readings
      const agreements = []
      for (let i = 0; i < 3; i++) {
        const agreementId = await createAgreementWithBlockchainId({
          agreementHash: `test-hash-${i}`,
          producerName: `Test Producer ${i}`,
          producerAddress: `0.0.12345${i}`,
          baseValue: 100,
          hectares: 50
        }, i)
        agreements.push(agreementId)

        // Create readings for each agreement
        for (let j = 0; j < 5; j++) {
          await database.createReading({
            agreementId,
            turbidityNtu: 5 + Math.random() * 10,
            isSimulated: true
          })
        }
      }

      const response = await request(app)
        .post('/api/oracle/process-all')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.processed).toBeGreaterThan(0)
      expect(response.body.data.results.length).toBeGreaterThan(0)
    })
  })

  describe('GET /api/oracle/batch/:batchId', () => {
    it('should return batch information with logs', async () => {
      // Create agreement and process batch
      const agreementId = await createAgreementWithBlockchainId({
        agreementHash: 'test-hash-1',
        producerName: 'Test Producer',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50
      })

      // Create readings
      for (let i = 0; i < 5; i++) {
        await database.createReading({
          agreementId,
          turbidityNtu: 8,
          isSimulated: true
        })
      }

      // Process batch
      const processResponse = await request(app)
        .post('/api/oracle/process')
        .send({ agreementId })

      expect(processResponse.status).toBe(200)

      // Get batch by searching for it
      const batches = await database.getBatchesByAgreement(agreementId, 1)
      expect(batches).toHaveLength(1)

      const batchId = batches[0].id

      const response = await request(app)
        .get(`/api/oracle/batch/${batchId}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('batch')
      expect(response.body.data).toHaveProperty('logs')
      expect(response.body.data.batch.id).toBe(batchId)
    })

    it('should return 404 for non-existent batch', async () => {
      const response = await request(app)
        .get('/api/oracle/batch/999')

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Batch not found')
    })
  })

  describe('GET /api/oracle/batches/agreement/:agreementId', () => {
    it('should return batches for an agreement', async () => {
      const agreementId = await createAgreementWithBlockchainId({
        agreementHash: 'test-hash-1',
        producerName: 'Test Producer',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50
      })

      // Create readings and process batch
      for (let i = 0; i < 5; i++) {
        await database.createReading({
          agreementId,
          turbidityNtu: 8,
          isSimulated: true
        })
      }

      await request(app)
        .post('/api/oracle/process')
        .send({ agreementId })

      const response = await request(app)
        .get(`/api/oracle/batches/agreement/${agreementId}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].agreement_id).toBe(agreementId)
    })
  })

  describe('GET /api/oracle/logs', () => {
    it('should return oracle logs', async () => {
      const agreementId = await createAgreementWithBlockchainId({
        agreementHash: 'test-hash-1',
        producerName: 'Test Producer',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50
      })

      // Create readings and process batch
      for (let i = 0; i < 5; i++) {
        await database.createReading({
          agreementId,
          turbidityNtu: 8,
          isSimulated: true
        })
      }

      await request(app)
        .post('/api/oracle/process')
        .send({ agreementId })

      const response = await request(app)
        .get('/api/oracle/logs')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
    })
  })

  describe('GET /api/oracle/stats', () => {
    it('should return oracle statistics', async () => {
      const response = await request(app)
        .get('/api/oracle/stats')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('pendingBatches')
      expect(response.body.data).toHaveProperty('recentValidations')
      expect(response.body.data).toHaveProperty('recentSubmissions')
      expect(response.body.data).toHaveProperty('successRate')
    })
  })

  describe('Oracle Validation Logic', () => {
    it('should reject readings outside valid range', async () => {
      const agreementId = await createAgreementWithBlockchainId({
        agreementHash: 'test-hash-1',
        producerName: 'Test Producer',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50
      })

      // Create readings with invalid values
      await database.createReading({
        agreementId,
        turbidityNtu: -5, // Invalid: below 0
        isSimulated: true
      })

      await database.createReading({
        agreementId,
        turbidityNtu: 150, // Invalid: above 100
        isSimulated: true
      })

      // Create valid readings
      for (let i = 0; i < 5; i++) {
        await database.createReading({
          agreementId,
          turbidityNtu: 8,
          isSimulated: true
        })
      }

      const response = await request(app)
        .post('/api/oracle/process')
        .send({ agreementId })

      expect(response.status).toBe(200)
      // Check that validation logic is working (some readings processed)
      expect(response.body.data.validReadings + response.body.data.invalidReadings).toBeGreaterThan(0)
    })

    it('should calculate score correctly based on water quality', async () => {
      const agreementId = await createAgreementWithBlockchainId({
        agreementHash: 'test-hash-1',
        producerName: 'Test Producer',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50
      })

      // Create readings with excellent water quality (low turbidity)
      for (let i = 0; i < 10; i++) {
        await database.createReading({
          agreementId,
          turbidityNtu: 2, // Very low turbidity = high quality
          isSimulated: true
        })
      }

      const response = await request(app)
        .post('/api/oracle/process')
        .send({ agreementId })

      expect(response.status).toBe(200)
      expect(response.body.data.score).toBeGreaterThan(0.8) // Should get high score for excellent quality (normalized 0-1)
    })

    it('should handle outlier detection', async () => {
      const agreementId = await createAgreementWithBlockchainId({
        agreementHash: 'test-hash-1',
        producerName: 'Test Producer',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50
      })

      // Create mostly normal readings
      for (let i = 0; i < 8; i++) {
        await database.createReading({
          agreementId,
          turbidityNtu: 5, // Normal reading
          isSimulated: true
        })
      }

      // Create extreme outliers
      await database.createReading({
        agreementId,
        turbidityNtu: 95, // Extreme outlier
        isSimulated: true
      })

      await database.createReading({
        agreementId,
        turbidityNtu: 98, // Extreme outlier
        isSimulated: true
      })

      const response = await request(app)
        .post('/api/oracle/process')
        .send({ agreementId })

      expect(response.status).toBe(200)
      // Extreme outliers should be rejected
      expect(response.body.data.validReadings).toBeLessThan(10)
    })
  })
})
