import express, { Request, Response } from 'express'
import { PrismaDatabase } from '../services/orm/prismaDatabase'
import { AuthMiddleware } from '../middleware/auth'
import { validateMeasurementInput, STATION_CODE, type MeasurementInput } from '../score/measurements'
import type { ApiResponse } from '../types/index'

const MAX_BATCH = 1000

export default function measurementRoutes(database: PrismaDatabase) {
  const router = express.Router()
  const authMiddleware = new AuthMiddleware(database)
  router.use(authMiddleware.authenticate)

  // Store a batch of measurements (MANAGER). All records are validated first: one invalid record
  // rejects the batch, so a partial import never happens.
  router.post('/', authMiddleware.requireRole('MANAGER'), async (req: Request, res: Response) => {
    try {
      const batch: MeasurementInput[] = Array.isArray(req.body?.measurements) ? req.body.measurements : []
      if (batch.length === 0 || batch.length > MAX_BATCH) {
        return res.status(400).json({ success: false, error: `measurements must hold 1 to ${MAX_BATCH} records` } as ApiResponse)
      }
      const invalid = batch
        .map((m, index) => ({ index, errors: validateMeasurementInput(m) }))
        .filter(r => r.errors.length > 0)
      if (invalid.length > 0) {
        return res.status(400).json({ success: false, error: 'Invalid measurements; nothing was stored', data: { invalid } } as ApiResponse)
      }
      const result = await database.insertMeasurements(batch)
      res.status(201).json({ success: true, data: result } as ApiResponse)
    } catch (error) {
      console.error('Error storing measurements:', error)
      res.status(500).json({ success: false, error: 'Failed to store measurements', message: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse)
    }
  })

  // Measurements of a station in a period (any authenticated user: public monitoring data)
  router.get('/', async (req: Request, res: Response) => {
    try {
      const station = String(req.query.station ?? '')
      const from = new Date(String(req.query.from ?? '1900-01-01'))
      const to = new Date(String(req.query.to ?? '2999-12-31'))
      if (!STATION_CODE.test(station) || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
        return res.status(400).json({ success: false, error: 'station (code) and ISO from/to dates are required' } as ApiResponse)
      }
      res.json({ success: true, data: await database.getMeasurements(station, from, to) } as ApiResponse)
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch measurements', message: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse)
    }
  })

  return router
}
