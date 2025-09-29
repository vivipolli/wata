import express, { Request, Response } from 'express'
import crypto from 'crypto'
import { Database } from '../database'
import type { SubmitReadingRequest, SimulateReadingRequest, ApiResponse } from '../types/index'

interface ReadingData {
  id: number
  agreementId: number
  turbidityNtu: number
  locationLat?: number
  locationLng?: number
  isSimulated: boolean
  auditHash: string
  timestamp: string
}

interface AuditData {
  agreementId: number
  turbidityNtu: number
  locationLat?: number
  locationLng?: number
  timestamp: number
  isSimulated: boolean
}

interface ReadingStats {
  totalReadings: number
  averageTurbidity: number
  minTurbidity: number
  maxTurbidity: number
  complianceRate: number
  days: number
}

export default function readingRoutes(database: Database) {
  const router = express.Router()

  // Submit a new reading
  router.post('/submit', async (req: Request, res: Response) => {
    try {
      const {
        agreementId,
        turbidityNtu,
        locationLat,
        locationLng,
        isSimulated = false
      }: SubmitReadingRequest & { isSimulated?: boolean } = req.body

      // Validate required fields
      if (agreementId === undefined || agreementId === null || turbidityNtu === undefined) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required fields: agreementId, turbidityNtu'
        }
        return res.status(400).json(response)
      }

      // Validate turbidity range (0-100 NTU) - Business Rule: Leituras fora do intervalo aceitável (0–100 NTU) são automaticamente rejeitadas
      if (turbidityNtu < 0 || turbidityNtu > 100) {
        const response: ApiResponse = {
          success: false,
          error: 'Turbidity must be between 0 and 100 NTU'
        }
        return res.status(400).json(response)
      }

      // Generate audit hash
      const auditData: AuditData = {
        agreementId,
        turbidityNtu,
        locationLat,
        locationLng,
        timestamp: Date.now(),
        isSimulated
      }

      const auditHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(auditData))
        .digest('hex')

      // Create reading in database
      const readingId = await database.createReading({
        agreementId,
        turbidityNtu,
        locationLat,
        locationLng,
        isSimulated,
        auditHash
      })

      const response: ApiResponse<ReadingData> = {
        success: true,
        data: {
          id: readingId,
          agreementId,
          turbidityNtu,
          locationLat,
          locationLng,
          isSimulated,
          auditHash,
          timestamp: new Date().toISOString()
        }
      }

      res.status(201).json(response)
    } catch (error) {
      console.error('Error submitting reading:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to submit reading',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Simulate a reading
  router.post('/simulate', async (req: Request, res: Response) => {
    try {
      const { agreementId, locationLat, locationLng }: SimulateReadingRequest = req.body

      if (agreementId === undefined || agreementId === null) {
        const response: ApiResponse = {
          success: false,
          error: 'Missing required field: agreementId'
        }
        return res.status(400).json(response)
      }

      // Get agreement to use its coordinates if not provided
      const agreement = await database.getAgreement(agreementId)
      if (!agreement) {
        const response: ApiResponse = {
          success: false,
          error: 'Agreement not found'
        }
        return res.status(404).json(response)
      }

      // Use provided coordinates or fall back to agreement coordinates
      const finalLat = locationLat || agreement.location_lat
      const finalLng = locationLng || agreement.location_lng

      // Generate random turbidity between 0-20 NTU
      const turbidityNtu = Math.random() * 20
      
      // Create simulated reading
      const readingData = {
        agreementId,
        turbidityNtu: parseFloat(turbidityNtu.toFixed(2)),
        locationLat: finalLat,
        locationLng: finalLng,
        isSimulated: true
      }

      // Generate audit hash
      const auditData: AuditData = {
        ...readingData,
        timestamp: Date.now()
      }

      const auditHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(auditData))
        .digest('hex')

      // Create reading in database
      const readingId = await database.createReading({
        ...readingData,
        auditHash
      })

      const response: ApiResponse<ReadingData> = {
        success: true,
        data: {
          id: readingId,
          ...readingData,
          auditHash,
          timestamp: new Date().toISOString()
        }
      }

      res.status(201).json(response)
    } catch (error) {
      console.error('Error simulating reading:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to simulate reading',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get readings for a specific agreement
  router.get('/agreement/:agreementId', async (req: Request, res: Response) => {
    try {
      const agreementId = parseInt(req.params.agreementId)
      const limit = parseInt(req.query.limit as string) || 50

      const readings = await database.getReadingsByAgreement(agreementId, limit)

      const response: ApiResponse = {
        success: true,
        data: readings
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching readings:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch readings',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get recent readings across all agreements
  router.get('/recent', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100
      const readings = await database.getRecentReadings(limit)

      const response: ApiResponse = {
        success: true,
        data: readings
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching recent readings:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch recent readings',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get reading statistics for an agreement
  router.get('/agreement/:agreementId/stats', async (req: Request, res: Response) => {
    try {
      const agreementId = parseInt(req.params.agreementId)
      const days = parseInt(req.query.days as string) || 7

      const readings = await database.getReadingsByAgreement(agreementId, 100)
      
      // Filter readings by date range
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      
      const recentReadings = readings.filter((reading: any) => 
        new Date(reading.timestamp) >= cutoffDate
      )

      if (recentReadings.length === 0) {
        const response: ApiResponse<ReadingStats> = {
          success: true,
          data: {
            totalReadings: 0,
            averageTurbidity: 0,
            minTurbidity: 0,
            maxTurbidity: 0,
            complianceRate: 0,
            days: days
          }
        }
        return res.json(response)
      }

      const turbidityValues = recentReadings.map((r: any) => r.turbidity_ntu)
      const averageTurbidity = turbidityValues.reduce((sum: number, val: number) => sum + val, 0) / turbidityValues.length
      const minTurbidity = Math.min(...turbidityValues)
      const maxTurbidity = Math.max(...turbidityValues)
      
      // Calculate compliance rate (turbidity <= 100 NTU) - All readings within valid range are compliant
      const compliantReadings = recentReadings.filter((r: any) => r.turbidity_ntu <= 100)
      const complianceRate = (compliantReadings.length / recentReadings.length) * 100

      const response: ApiResponse<ReadingStats> = {
        success: true,
        data: {
          totalReadings: recentReadings.length,
          averageTurbidity: parseFloat(averageTurbidity.toFixed(2)),
          minTurbidity: parseFloat(minTurbidity.toFixed(2)),
          maxTurbidity: parseFloat(maxTurbidity.toFixed(2)),
          complianceRate: parseFloat(complianceRate.toFixed(2)),
          days: days
        }
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching reading stats:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch reading statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  return router
}
