import { Router, Request, Response } from 'express'
import { BatchSchedulerService } from '../services/batchScheduler'
import { ApiResponse } from '../types'

export default function batchSchedulerRoutes(batchSchedulerService: BatchSchedulerService) {
  const router = Router()

  // Start batch scheduler
  router.post('/start', async (req: Request, res: Response) => {
    try {
      await batchSchedulerService.start()
      
      const response: ApiResponse = {
        success: true,
        message: 'Batch scheduler started successfully'
      }
      
      res.json(response)
    } catch (error) {
      console.error('Error starting batch scheduler:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to start batch scheduler'
      }
      res.status(500).json(response)
    }
  })

  // Stop batch scheduler
  router.post('/stop', async (req: Request, res: Response) => {
    try {
      batchSchedulerService.stop()
      
      const response: ApiResponse = {
        success: true,
        message: 'Batch scheduler stopped successfully'
      }
      
      res.json(response)
    } catch (error) {
      console.error('Error stopping batch scheduler:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to stop batch scheduler'
      }
      res.status(500).json(response)
    }
  })

  // Get scheduler status
  router.get('/status', async (req: Request, res: Response) => {
    try {
      const status = batchSchedulerService.getStatus()
      
      const response: ApiResponse = {
        success: true,
        data: status
      }
      
      res.json(response)
    } catch (error) {
      console.error('Error getting batch scheduler status:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get batch scheduler status'
      }
      res.status(500).json(response)
    }
  })

  // Manually process batch for specific agreement
  router.post('/process/:agreementId', async (req: Request, res: Response) => {
    try {
      const agreementId = parseInt(req.params.agreementId)
      
      if (isNaN(agreementId)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid agreement ID'
        }
        return res.status(400).json(response)
      }

      await batchSchedulerService.processBatchForAgreement(agreementId)
      
      const response: ApiResponse = {
        success: true,
        message: `Batch processed successfully for agreement ${agreementId}`
      }
      
      res.json(response)
    } catch (error) {
      console.error('Error processing batch for agreement:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to process batch for agreement'
      }
      res.status(500).json(response)
    }
  })

  return router
}
