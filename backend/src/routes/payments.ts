import express, { Request, Response } from 'express'
import { HederaService } from '../services/hedera'
import { Database } from '../database'
import { RelayerService } from '../services/relayer'
import type { TriggerCheckRequest, ApiResponse } from '../types/index'

interface PaymentCheckResult {
  success: boolean
  message: string
  averageTurbidity?: number
  amount?: number
  threshold?: number
}

interface PaymentStats {
  pendingPayments: number
  totalPendingAmount: number
}

export default function paymentRoutes(hederaService: HederaService, database: Database, relayerService: RelayerService) {
  const router = express.Router()

  // Trigger payment check for an agreement
  router.post('/trigger-check/:agreementId', async (req: Request, res: Response) => {
    try {
      const agreementId = parseInt(req.params.agreementId)

      if (isNaN(agreementId) || agreementId < 0) {
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

      // Trigger payment check through relayer service
      // Note: triggerPaymentCheck method was removed in V3 refactoring
      // Payments are now handled automatically via event listeners
      const result = { success: true, message: 'Payment processing is automatic via event listeners' }

      const response: ApiResponse<PaymentCheckResult> = {
        success: true,
        data: result
      }

      res.json(response)
    } catch (error) {
      console.error('Error triggering payment check:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to trigger payment check',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get payment status for an agreement
  router.get('/agreement/:agreementId', async (req: Request, res: Response) => {
    try {
      const agreementId = parseInt(req.params.agreementId)
      const payments = await database.getPaymentsByAgreement(agreementId)

      const response: ApiResponse = {
        success: true,
        data: payments
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching payments:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch payments',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get all pending payments
  router.get('/pending', async (req: Request, res: Response) => {
    try {
      const pendingPayments = await database.getPendingPayments()

      const response: ApiResponse = {
        success: true,
        data: pendingPayments
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching pending payments:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch pending payments',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Manual payment processing (for testing)
  router.post('/process/:paymentId', async (req: Request, res: Response) => {
    try {
      const paymentId = parseInt(req.params.paymentId)
      
      // Get payment details
      const payment = await database.getPayment(paymentId)
      if (!payment) {
        const response: ApiResponse = {
          success: false,
          error: 'Payment not found'
        }
        return res.status(404).json(response)
      }

      if (payment.status !== 'pending') {
        const response: ApiResponse = {
          success: false,
          error: 'Payment is not in pending status'
        }
        return res.status(400).json(response)
      }

      // Process payment through relayer
      await (relayerService as any).processPayment(payment)

      const response: ApiResponse = {
        success: true,
        message: 'Payment processed successfully'
      }

      res.json(response)
    } catch (error) {
      console.error('Error processing payment:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to process payment',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get payment history
  router.get('/history', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50
      const status = req.query.status as string
      
      let payments
      if (status) {
        payments = await (database as any).all(
          'SELECT * FROM payments WHERE status = ? ORDER BY created_at DESC LIMIT ?',
          [status, limit]
        )
      } else {
        payments = await (database as any).all(
          'SELECT * FROM payments ORDER BY created_at DESC LIMIT ?',
          [limit]
        )
      }

      const response: ApiResponse = {
        success: true,
        data: { payments }
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching payment history:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch payment history',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get payment statistics
  router.get('/stats', async (req: Request, res: Response) => {
    try {
      // This would require additional database methods to get statistics
      // For now, return basic info
      const pendingPayments = await database.getPendingPayments()
      
      const totalPendingAmount = pendingPayments.reduce((sum: number, p: any) => sum + p.amount, 0)

      const response: ApiResponse<PaymentStats> = {
        success: true,
        data: {
          pendingPayments: pendingPayments.length,
          totalPendingAmount
        }
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching payment stats:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch payment statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  return router
}
