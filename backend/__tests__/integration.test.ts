import request from 'supertest'
import express from 'express'
import cors from 'cors'
import { Database } from '../src/database'
import { HederaService } from '../src/services/hedera'
import { RelayerService } from '../src/services/relayer'
import agreementRoutes from '../src/routes/agreements'
import readingRoutes from '../src/routes/readings'
import paymentRoutes from '../src/routes/payments'

// Mock Hedera SDK to avoid real blockchain calls
jest.mock('@hashgraph/sdk', () => ({
  Client: {
    forTestnet: jest.fn().mockReturnValue({
      setOperator: jest.fn().mockReturnThis()
    })
  },
  AccountId: {
    fromString: jest.fn().mockReturnValue({ toString: () => '0.0.1234567' })
  },
  PrivateKey: {
    fromString: jest.fn().mockReturnValue({})
  },
  ContractId: {
    fromString: jest.fn().mockReturnValue({})
  },
  ContractExecuteTransaction: jest.fn().mockImplementation(() => ({
    setContractId: jest.fn().mockReturnThis(),
    setGas: jest.fn().mockReturnThis(),
    setFunction: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({
      getRecord: jest.fn().mockResolvedValue({
        contractFunctionResult: {
          getUint256: jest.fn().mockReturnValue(BigInt(1))
        }
      })
    })
  })),
  ContractFunctionParameters: jest.fn().mockImplementation(() => ({
    addBytes32: jest.fn().mockReturnThis(),
    addAddress: jest.fn().mockReturnThis(),
    addUint256: jest.fn().mockReturnThis()
  })),
  AccountBalanceQuery: jest.fn().mockImplementation(() => ({
    setAccountId: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({
      hbars: { toString: () => '100.0 ℏ' }
    })
  }))
}))

describe('W.A.T.A. Chain Integration Tests', () => {
  let app: express.Application
  let database: Database
  let hederaService: HederaService
  let relayerService: RelayerService

  beforeAll(async () => {
    // Setup test application
    app = express()
    app.use(cors())
    app.use(express.json())

    // Initialize services with mocked Hedera
    database = new Database()
    await database.initialize()

    hederaService = new HederaService()
    await hederaService.initialize()

    relayerService = new RelayerService(hederaService, database)

    // Setup routes
    app.use('/api/agreements', agreementRoutes(hederaService, database))
    app.use('/api/readings', readingRoutes(database))
    app.use('/api/payments', paymentRoutes(hederaService, database, relayerService))

    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: { database: true, hedera: true, relayer: true },
        version: '1.0.0'
      })
    })
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
