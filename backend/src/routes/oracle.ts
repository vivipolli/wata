import express, { Request, Response } from 'express'
import { Database } from '../database'
import { HederaService } from '../services/hedera'
import { OracleService } from '../services/oracle'
import type { ApiResponse } from '../types/index'

interface ProcessBatchRequest {
  agreementId: number
  hoursBack?: number
}

interface BatchProcessResult {
  batchId: number
  auditHash: string
  score: number
  validReadings: number
  invalidReadings: number
  transactionHash: string
}

export default function oracleRoutes(database: Database, hederaService: HederaService) {
  const router = express.Router()
  const oracleService = new OracleService(database, hederaService)

  // Process batch validation for a specific agreement
  router.post('/process', async (req: Request, res: Response) => {
    try {
      const { agreementId, hoursBack = 168 } = req.body as ProcessBatchRequest

      if (!agreementId || isNaN(agreementId)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid agreement ID'
        }
        return res.status(400).json(response)
      }

      // Check if agreement exists
      const agreement = await database.getAgreement(agreementId)
      if (!agreement) {
        const response: ApiResponse = {
          success: false,
          error: 'Agreement not found'
        }
        return res.status(404).json(response)
      }

      // Process the batch
      const batchResult = await oracleService.processBatch(agreementId)
      
      // Submit to smart contract
      const transactionHash = await oracleService.submitValidatedBatch(agreementId, batchResult)

      const result: BatchProcessResult = {
        batchId: 0, // Will be updated by the service
        auditHash: batchResult.auditHash,
        score: batchResult.score,
        validReadings: batchResult.validReadings.length,
        invalidReadings: batchResult.invalidReadings.length,
        transactionHash
      }

      const response: ApiResponse<BatchProcessResult> = {
        success: true,
        data: result,
        message: 'Batch processed and submitted successfully'
      }

      res.json(response)
    } catch (error) {
      console.error('Error processing oracle batch:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to process batch',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Process all active agreements
  router.post('/process-all', async (req: Request, res: Response) => {
    try {
      const agreements = await database.getAgreementsWithRecentActivity(7)
      const results: BatchProcessResult[] = []
      const errors: string[] = []

      for (const agreement of agreements) {
        try {
          const batchResult = await oracleService.processBatch(agreement.id)
          const transactionHash = await oracleService.submitValidatedBatch(agreement.id, batchResult)

          results.push({
            batchId: agreement.id,
            auditHash: batchResult.auditHash,
            score: batchResult.score,
            validReadings: batchResult.validReadings.length,
            invalidReadings: batchResult.invalidReadings.length,
            transactionHash
          })
        } catch (error) {
          errors.push(`Agreement ${agreement.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      const response: ApiResponse = {
        success: true,
        data: {
          processed: results.length,
          results,
          errors
        },
        message: `Processed ${results.length} agreements${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
      }

      res.json(response)
    } catch (error) {
      console.error('Error processing all oracle batches:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to process batches',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get batch information
  router.get('/batch/:batchId', async (req: Request, res: Response) => {
    try {
      const batchId = parseInt(req.params.batchId)
      
      if (isNaN(batchId)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid batch ID'
        }
        return res.status(400).json(response)
      }

      const batch = await database.getBatch(batchId)
      if (!batch) {
        const response: ApiResponse = {
          success: false,
          error: 'Batch not found'
        }
        return res.status(404).json(response)
      }

      // Get associated logs
      const logs = await database.getOracleLogsByBatch(batchId)

      const response: ApiResponse = {
        success: true,
        data: {
          batch,
          logs
        }
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching batch:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch batch',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get batches by agreement
  router.get('/batches/agreement/:agreementId', async (req: Request, res: Response) => {
    try {
      const agreementId = parseInt(req.params.agreementId)
      const limit = parseInt(req.query.limit as string) || 50
      
      if (isNaN(agreementId)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid agreement ID'
        }
        return res.status(400).json(response)
      }

      const batches = await database.getBatchesByAgreement(agreementId, limit)

      // Add transaction_hash from oracle logs for each batch
      const batchesWithTxHash = await Promise.all(
        batches.map(async (batch: any) => {
          const oracleLog = await (database as any).get(
            'SELECT transaction_hash FROM oracle_logs WHERE batch_id = ? AND action = "batch_submitted" ORDER BY timestamp DESC LIMIT 1',
            [batch.id]
          )
          
          let transactionHash = oracleLog?.transaction_hash || null
          
          // Convert binary hash to hex string if needed
          if (transactionHash && typeof transactionHash === 'object' && transactionHash.type === 'Buffer') {
            transactionHash = '0x' + Buffer.from(transactionHash.data).toString('hex')
          }
          
          return {
            ...batch,
            transaction_hash: transactionHash
          }
        })
      )

      const response: ApiResponse = {
        success: true,
        data: batchesWithTxHash
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching batches:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch batches',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get oracle logs
  router.get('/logs', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100
      const logs = await database.getRecentOracleLogs(limit)

      const response: ApiResponse = {
        success: true,
        data: logs
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching oracle logs:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch oracle logs',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get oracle statistics
  router.get('/stats', async (req: Request, res: Response) => {
    try {
      const pendingBatches = await database.getPendingBatches()
      const recentLogs = await database.getRecentOracleLogs(50)
      
      // Calculate some basic statistics
      const validationActions = recentLogs.filter(log => log.action === 'batch_validated')
      const submissionActions = recentLogs.filter(log => log.action === 'batch_submitted')
      
      const stats = {
        pendingBatches: pendingBatches.length,
        recentValidations: validationActions.length,
        recentSubmissions: submissionActions.length,
        successRate: submissionActions.length > 0 ? 
          (submissionActions.length / validationActions.length * 100).toFixed(2) : '0',
        lastActivity: recentLogs.length > 0 ? recentLogs[0].timestamp : null
      }

      const response: ApiResponse = {
        success: true,
        data: stats
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching oracle stats:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch oracle statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get weekly average score for an agreement
  // Business Rule: A média semanal deve ser normalizada em um score entre 0 e 1
  router.get('/weekly-average/:agreementId', async (req: Request, res: Response) => {
    try {
      const agreementId = parseInt(req.params.agreementId)
      
      if (isNaN(agreementId)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid agreement ID'
        }
        return res.status(400).json(response)
      }

      const weeklyScore = await oracleService.calculateWeeklyAverage(agreementId)
      
      const response: ApiResponse = {
        success: true,
        data: {
          agreementId,
          weeklyScore,
          threshold: 0.7,
          isEligible: weeklyScore >= 0.7,
          timestamp: new Date().toISOString()
        }
      }
      
      res.json(response)
    } catch (error) {
      console.error('Error calculating weekly average:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to calculate weekly average'
      }
      res.status(500).json(response)
    }
  })

  return router
}
