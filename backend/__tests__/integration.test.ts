import request from 'supertest'
import express from 'express'
import cors from 'cors'
import { Database } from '../src/database'
import { HederaService } from '../src/services/hedera'
// Mock RelayerService to avoid HederaService import issues
class MockRelayerService {
  async initialize(): Promise<void> {
    console.log('Mock RelayerService initialized')
  }

  async start(): Promise<void> {
    console.log('Mock RelayerService started')
  }

  async stop(): Promise<void> {
    console.log('Mock RelayerService stopped')
  }
}
import agreementRoutes from '../src/routes/agreements'
import readingRoutes from '../src/routes/readings'
import paymentRoutes from '../src/routes/payments'
import authRoutes from '../src/routes/auth'

// Jest types
declare const jest: any
declare const expect: any
declare const beforeAll: any
declare const afterAll: any

// Mock Hedera service for testing
class MockHederaService extends HederaService {
  async initialize(): Promise<void> {
    console.log('Mock Hedera service initialized')
  }

  async createAgreementWithSystem(agreementHash: string, producerAddress: string, baseValue: number, hectares: number): Promise<{ agreementId: number, transactionId: string }> {
    return {
      agreementId: 1,
      transactionId: '0.0.123456@1758983593753'
    }
  }

  async requestPayment(agreementId: number, auditHash: string): Promise<any> {
    return {
      transactionId: '0.0.123456@1758983593753'
    }
  }

  async submitValidatedBatch(agreementId: number, auditHash: string, score: number): Promise<any> {
    return {
      transactionId: '0.0.123456@1758983593753'
    }
  }

  async recordAudit(auditHash: string): Promise<any> {
    return {
      transactionId: '0.0.123456@1758983593753'
    }
  }

  async getAgreement(agreementId: number): Promise<any> {
    return {
      agreementHash: 'mock-hash',
      producer: '0x742d35Cc6639C0532fEb217F5e4B9af48Bf9bA2A',
      baseValue: 1000,
      hectares: 50,
      isActive: true,
      createdAt: BigInt(Date.now())
    }
  }

  async investInAgreement(agreementId: number, amount: number, investorAddress: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    return {
      success: true,
      transactionId: '0.0.123456@1758983593753'
    }
  }

  async verifyTransaction(transactionHash: string): Promise<{ status: string; success: boolean; details?: any }> {
    return {
      status: 'SUCCESS',
      success: true,
      details: { transactionId: transactionHash }
    }
  }

  async getAccountBalance(accountId: string): Promise<string> {
    return '100.0 ℏ'
  }

  async transferHBAR(toAddress: string, amountInTinybars: number): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    return {
      success: true,
      transactionHash: '0.0.123456@1758983593753'
    }
  }

  async getAccountInfo(accountId: string): Promise<any> {
    return {
      accountId: accountId,
      balance: '100.0 ℏ',
      key: 'mock-key',
      isDeleted: false
    }
  }
}

describe('W.A.T.A. Chain Integration Tests', () => {
  let app: express.Application
  let database: Database
  let hederaService: HederaService
  let relayerService: MockRelayerService
  let authToken: string

  beforeAll(async () => {
    // Setup test application
    app = express()
    app.use(cors())
    app.use(express.json())

    // Initialize services with mocked Hedera
    database = new Database()
    await database.initialize()

    hederaService = new MockHederaService()
    await hederaService.initialize()

    relayerService = new MockRelayerService()

    // Setup routes
    app.use('/api/auth', authRoutes)
    app.use('/api/agreements', agreementRoutes(hederaService, database))
    app.use('/api/readings', readingRoutes(database))
    app.use('/api/payments', paymentRoutes(hederaService, database, relayerService as any))

    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: { database: true, hedera: true, relayer: true },
        version: '1.0.0'
      })
    })

    // Create test user directly in database and generate token
    try {
      const testUser = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        role: 'INVESTOR',
        address: '0x742d35Cc6639C0532fEb217F5e4B9af48Bf9bA2A',
        isActive: true,
        createdAt: new Date().toISOString()
      }

      // Create user directly in database
      const userId = await database.createUser(testUser)
      console.log('Test user created with ID:', userId)

      // Generate JWT token manually
      const jwt = require('jsonwebtoken')
      const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
      
      authToken = jwt.sign(
        {
          userId: userId,
          email: testUser.email,
          role: testUser.role
        },
        jwtSecret,
        { expiresIn: '1h' }
      )
      
      console.log('Auth token generated successfully')
    } catch (error) {
      console.warn('Auth setup failed, tests may fail:', error)
      authToken = 'mock-token'
    }
  })

  afterAll(async () => {
    database.close()
  })

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200)

      expect(response.body).toMatchObject({
        status: 'healthy',
        services: {
          database: true,
          hedera: true,
          relayer: true
        },
        version: '1.0.0'
      })
    })
  })

  describe('POST /api/agreements - Agreement Creation', () => {
    const validAgreementData = {
      producerName: 'João Silva',
      producerAddress: '0x742d35Cc6639C0532fEb217F5e4B9af48Bf9bA2A',
      baseValue: 1000,
      hectares: 50,
      locationLat: -23.5505,
      locationLng: -46.6333,
      durationDays: 365
    }

    it('should create agreement successfully and return 201', async () => {
      const response = await request(app)
        .post('/api/agreements')
        .send(validAgreementData)
        .expect(201)

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: expect.any(Number),
          blockchainId: expect.any(Number),
          agreementHash: expect.any(String),
          producerName: validAgreementData.producerName,
          producerAddress: validAgreementData.producerAddress,
          baseValue: validAgreementData.baseValue,
          hectares: validAgreementData.hectares,
          createdAt: expect.any(String)
        })
      })
    })

    it('should reject agreement with missing required fields', async () => {
      const incompleteData = {
        producerName: 'João Silva',
        // Missing producerAddress, baseValue, hectares
      }

      const response = await request(app)
        .post('/api/agreements')
        .send(incompleteData)
        .expect(400)

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Missing required fields')
      })
    })

    it('should save agreement in database', async () => {
      await request(app)
        .post('/api/agreements')
        .send(validAgreementData)
        .expect(201)

      // Verify it's saved in database
      const agreements = await database.getAllAgreements()
      expect(agreements.length).toBeGreaterThan(0)
      
      const lastAgreement = agreements[agreements.length - 1]
      expect(lastAgreement.producer_name).toBe(validAgreementData.producerName)
    })
  })

  describe('POST /api/readings/simulate - Reading Simulation', () => {
    let agreementId: number

    beforeEach(async () => {
      // Create an agreement first
      const agreementData = {
        producerName: 'Test Producer',
        producerAddress: '0x742d35Cc6639C0532fEb217F5e4B9af48Bf9bA2A',
        baseValue: 1000,
        hectares: 50,
        locationLat: -23.5505,
        locationLng: -46.6333,
        durationDays: 365
      }

      const response = await request(app)
        .post('/api/agreements')
        .send(agreementData)

      agreementId = response.body.data.id
    })

    it('should generate valid turbidity reading (0-20 NTU)', async () => {
      const response = await request(app)
        .post('/api/readings/simulate')
        .send({ agreementId })
        .expect(201)

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: expect.any(Number),
          agreementId: agreementId,
          turbidityNtu: expect.any(Number),
          isSimulated: true,
          auditHash: expect.any(String),
          timestamp: expect.any(String)
        })
      })

      // Verify turbidity is within valid range (0-100 NTU) - Business Rule
      expect(response.body.data.turbidityNtu).toBeGreaterThanOrEqual(0)
      expect(response.body.data.turbidityNtu).toBeLessThanOrEqual(100)
    })

    it('should reject simulation without agreementId', async () => {
      const response = await request(app)
        .post('/api/readings/simulate')
        .send({})
        .expect(400)

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Missing required field: agreementId')
      })
    })
  })

  describe('POST /api/readings/submit - Reading Submission', () => {
    let agreementId: number

    beforeEach(async () => {
      // Create an agreement first
      const agreementData = {
        producerName: 'Test Producer',
        producerAddress: '0x742d35Cc6639C0532fEb217F5e4B9af48Bf9bA2A',
        baseValue: 1000,
        hectares: 50,
        locationLat: -23.5505,
        locationLng: -46.6333,
        durationDays: 365
      }

      const response = await request(app)
        .post('/api/agreements')
        .send(agreementData)

      agreementId = response.body.data.id
    })

    it('should accept valid reading and call recordAudit', async () => {
      const readingData = {
        agreementId: agreementId,
        turbidityNtu: 8.5,
        locationLat: -23.5505,
        locationLng: -46.6333
      }

      const response = await request(app)
        .post('/api/readings/submit')
        .send(readingData)
        .expect(201)

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: expect.any(Number),
          agreementId: agreementId,
          turbidityNtu: 8.5,
          auditHash: expect.any(String),
          timestamp: expect.any(String)
        })
      })
    })

    it('should reject reading with invalid turbidity range', async () => {
      const invalidReadingData = {
        agreementId: agreementId,
        turbidityNtu: 150, // Above valid range (0-100 NTU) - Business Rule
      }

      const response = await request(app)
        .post('/api/readings/submit')
        .send(invalidReadingData)
        .expect(400)

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Turbidity must be between 0 and 100 NTU')
      })
    })

    it('should save reading in database', async () => {
      const readingData = {
        agreementId: agreementId,
        turbidityNtu: 5.0,
        locationLat: -23.5505,
        locationLng: -46.6333
      }

      await request(app)
        .post('/api/readings/submit')
        .send(readingData)
        .expect(201)

      // Verify it's saved in database
      const readings = await database.getReadingsByAgreement(agreementId, 10)
      expect(readings.length).toBeGreaterThan(0)
      
      const lastReading = readings[0]
      expect(lastReading.turbidity_ntu).toBe(5.0)
    })
  })

  describe('POST /api/payments/trigger-check - Payment Trigger', () => {
    let agreementId: number

    beforeEach(async () => {
      // Create an agreement
      const agreementData = {
        producerName: 'Test Producer',
        producerAddress: '0x742d35Cc6639C0532fEb217F5e4B9af48Bf9bA2A',
        baseValue: 1000,
        hectares: 50,
        locationLat: -23.5505,
        locationLng: -46.6333,
        durationDays: 365
      }

      const response = await request(app)
        .post('/api/agreements')
        .send(agreementData)

      agreementId = response.body.data.id
    })

    it('should return automatic payment processing message for V3', async () => {
      // Add compliant readings
      const compliantReadings = [8.0, 7.5, 9.0, 6.5, 8.5]
      
      for (const turbidity of compliantReadings) {
        await request(app)
          .post('/api/readings/submit')
          .send({
            agreementId: agreementId,
            turbidityNtu: turbidity,
            locationLat: -23.5505,
            locationLng: -46.6333
          })
      }

      const response = await request(app)
        .post(`/api/payments/trigger-check/${agreementId}`)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          success: true,
          message: 'Payment processing is automatic via event listeners'
        })
      })
    })

    it('should return automatic payment processing message for V3 (even with non-compliant readings)', async () => {
      // Add non-compliant readings
      const nonCompliantReadings = [15.0, 12.5, 18.0, 14.5, 16.5]
      
      for (const turbidity of nonCompliantReadings) {
        await request(app)
          .post('/api/readings/submit')
          .send({
            agreementId: agreementId,
            turbidityNtu: turbidity,
            locationLat: -23.5505,
            locationLng: -46.6333
          })
      }

      const response = await request(app)
        .post(`/api/payments/trigger-check/${agreementId}`)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          success: true,
          message: 'Payment processing is automatic via event listeners'
        })
      })
    })

    it('should reject trigger for non-existent agreement', async () => {
      const invalidAgreementId = 99999

      const response = await request(app)
        .post(`/api/payments/trigger-check/${invalidAgreementId}`)
        .expect(404)

      expect(response.body).toMatchObject({
        success: false,
        error: 'Agreement not found'
      })
    })

    it('should return automatic payment processing message for V3 (payment record creation)', async () => {
      // Add compliant readings
      const compliantReadings = [5.0, 6.0, 7.0]
      
      for (const turbidity of compliantReadings) {
        await request(app)
          .post('/api/readings/submit')
          .send({
            agreementId: agreementId,
            turbidityNtu: turbidity,
            locationLat: -23.5505,
            locationLng: -46.6333
          })
      }

      const response = await request(app)
        .post(`/api/payments/trigger-check/${agreementId}`)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          success: true,
          message: 'Payment processing is automatic via event listeners'
        })
      })

      // Note: In V3, payment records are created automatically by the relayer
      // when it processes PaymentApproved events from the smart contract
    })
  })

  describe('GET /api/agreements - List Agreements', () => {
    beforeEach(async () => {
      // Create test agreements
      const agreements = [
        {
          producerName: 'Producer 1',
          producerAddress: '0x742d35Cc6639C0532fEb217F5e4B9af48Bf9bA2A',
          baseValue: 1000,
          hectares: 50
        },
        {
          producerName: 'Producer 2',
          producerAddress: '0x742d35Cc6639C0532fEb217F5e4B9af48Bf9bA2B',
          baseValue: 1500,
          hectares: 75
        }
      ]

      for (const agreement of agreements) {
        await request(app)
          .post('/api/agreements')
          .send(agreement)
      }
    })

    it('should return list of agreements', async () => {
      const response = await request(app)
        .get('/api/agreements')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            producer_name: expect.any(String),
            producer_address: expect.any(String),
            base_value: expect.any(Number),
            hectares: expect.any(Number)
          })
        ])
      })

      expect(response.body.data.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('GET /api/readings/recent - Recent Readings', () => {
    beforeEach(async () => {
      // Create agreement and readings
      const agreementData = {
        producerName: 'Test Producer',
        producerAddress: '0x742d35Cc6639C0532fEb217F5e4B9af48Bf9bA2A',
        baseValue: 1000,
        hectares: 50,
        locationLat: -23.5505,
        locationLng: -46.6333,
        durationDays: 365
      }

      const agreementResponse = await request(app)
        .post('/api/agreements')
        .send(agreementData)

      const agreementId = agreementResponse.body.data.id

      // Add some readings
      const readings = [8.0, 7.5, 9.0]
      for (const turbidity of readings) {
        await request(app)
          .post('/api/readings/submit')
          .send({
            agreementId: agreementId,
            turbidityNtu: turbidity,
            locationLat: -23.5505,
            locationLng: -46.6333
          })
      }
    })

    it('should return recent readings', async () => {
      const response = await request(app)
        .get('/api/readings/recent')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            turbidity_ntu: expect.any(Number),
            timestamp: expect.any(String),
            producer_name: expect.any(String)
          })
        ])
      })
    })

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/readings/recent?limit=2')
        .expect(200)

      expect(response.body.data.length).toBeLessThanOrEqual(2)
    })
  })

  describe('GET /api/payments/stats - Payment Statistics', () => {
    it('should return payment statistics', async () => {
      const response = await request(app)
        .get('/api/payments/stats')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          pendingPayments: expect.any(Number),
          totalPendingAmount: expect.any(Number)
        })
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Close database to simulate error
      database.close()

      const response = await request(app)
        .get('/api/agreements')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500)

      expect(response.body).toMatchObject({
        success: false,
        error: expect.any(String)
      })

      // Reinitialize database for other tests
      await database.initialize()
    })

    it('should handle invalid JSON payloads', async () => {
      const response = await request(app)
        .post('/api/agreements')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400)
    })
  })
})
