import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaDatabase } from './services/orm/prismaDatabase.js'
import { HederaService } from './services/hedera.js'
import { RelayerService } from './services/relayer.js'
import { OracleService } from './services/oracle.js'
import { BatchSchedulerService } from './services/batchScheduler.js'
import agreementRoutes from './routes/agreements.js'
import readingRoutes from './routes/readings.js'
import paymentRoutes from './routes/payments.js'
import oracleRoutes from './routes/oracle.js'
import hederaRoutes from './routes/hedera.js'
import batchSchedulerRoutes from './routes/batchScheduler.js'
import authRoutes from './routes/auth.js'
import { 
  securityMiddleware, 
  requestLogger, 
  errorHandler, 
  notFoundHandler 
} from './middleware/security.js'
import type { HealthStatus } from './types/index.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Trust proxy for Railway deployment
app.set('trust proxy', true)

// Security middleware
app.use(securityMiddleware)

// Request logging
app.use(requestLogger)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Initialize services
const db = new PrismaDatabase()
const hederaService = new HederaService()
const relayerService = new RelayerService(hederaService, db)
const oracleService = new OracleService(db, hederaService)
const batchSchedulerService = new BatchSchedulerService(db, oracleService)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/agreements', agreementRoutes(hederaService, db))
app.use('/api/readings', readingRoutes(db))
app.use('/api/payments', paymentRoutes(hederaService, db, relayerService))
app.use('/api/oracle', oracleRoutes(db, hederaService))
app.use('/api/hedera', hederaRoutes)
app.use('/api/batch-scheduler', batchSchedulerRoutes(batchSchedulerService))

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: true,
      hedera: true,
      relayer: true
    },
    version: '1.0.0'
  }
  
  res.json(healthStatus)
})

// Start server
async function startServer(): Promise<void> {
  try {
    await db.initialize()
    await hederaService.initialize()
    await relayerService.start()
    await batchSchedulerService.start() // Start batch scheduler
    
    app.listen(PORT, () => {
        console.log(`🚀 W.A.T.A. Backend running on port ${PORT}`)
        console.log(`🌐 Hedera Network: ${process.env.HEDERA_NETWORK || 'testnet'}`)
        console.log(`📊 Database initialized`)
        console.log(`🔄 Relayer service started`)
        console.log(`⏰ Batch scheduler started (6-hour intervals)`)
        console.log(`🔐 Authentication system enabled`)
      })
    } catch (error) {
      console.error('Failed to start server:', error)
      process.exit(1)
    }
  }

  // Error handling middleware (must be last)
  app.use(notFoundHandler)
  app.use(errorHandler)

  startServer()
