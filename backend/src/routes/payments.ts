import express, { Request, Response } from 'express'
import { HederaService } from '../services/hedera'
import { PrismaDatabase } from '../services/orm/prismaDatabase'
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

export default function paymentRoutes(hederaService: HederaService, database: PrismaDatabase, relayerService: RelayerService) {
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

      // Get the latest batch for this agreement
      const batches = await database.getBatchesByAgreement(agreementId, 1)
      if (batches.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: 'No batches found for this agreement'
        }
        return res.status(404).json(response)
      }

      const latestBatch = batches[0]
      
      // Check if score meets threshold
      if (latestBatch.score < 0.7) {
        const response: ApiResponse = {
          success: false,
          error: `Score ${(latestBatch.score * 100).toFixed(1)}% is below threshold of 70%`
        }
        return res.status(400).json(response)
      }

      // Process payment manually (simplified for testing)
      const paymentAmount = agreement.base_value * agreement.hectares
      
      // Record payment in database
      const paymentId = await database.createPayment({
        agreementId,
        batchId: latestBatch.id,
        amount: paymentAmount,
        status: 'completed',
        auditHash: latestBatch.audit_hash,
        score: latestBatch.score,
        transactionHash: 'test_transaction_' + Date.now()
      })
      
      const result = {
        success: true,
        message: `Payment of ${paymentAmount} HBAR approved for agreement ${agreementId}`,
        amount: paymentAmount,
        paymentId
      }

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
      const status = req.query.status as string | undefined
      
      const payments = await database.getPaymentHistory({ limit, status })

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

  // Get payments by user address (for producers)
  router.get('/user-payments/:userAddress', async (req: Request, res: Response) => {
    try {
      const userAddress = req.params.userAddress
      const limit = parseInt(req.query.limit as string) || 50
      const status = req.query.status as string | undefined

      if (!userAddress) {
        const response: ApiResponse = {
          success: false,
          error: 'User address is required'
        }
        return res.status(400).json(response)
      }

      const payments = await database.getPaymentsByProducerAddress({
        producerAddress: userAddress,
        limit,
        status
      })

      const response: ApiResponse = {
        success: true,
        data: { payments }
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching user payments:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch user payments',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get payment statistics
  router.get('/stats', async (req: Request, res: Response) => {
    try {
      const pendingPayments = await database.getPendingPayments()
      
      const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0)

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

  // Investor contribution to agreement (legacy - uses owner wallet)
  router.post('/contribute/:agreementId', async (req: Request, res: Response) => {
    try {
      const agreementId = parseInt(req.params.agreementId)
      const { amount, investorAddress } = req.body

      if (isNaN(agreementId) || agreementId < 0) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid agreement ID'
        }
        return res.status(400).json(response)
      }

      if (!amount || amount <= 0) {
        const response: ApiResponse = {
          success: false,
          error: 'Investment amount must be greater than 0'
        }
        return res.status(400).json(response)
      }

      if (!investorAddress) {
        const response: ApiResponse = {
          success: false,
          error: 'Investor address is required'
        }
        return res.status(400).json(response)
      }

      // Check if agreement exists and is active
      const agreement = await database.getAgreement(agreementId)
      if (!agreement) {
        const response: ApiResponse = {
          success: false,
          error: 'Agreement not found'
        }
        return res.status(404).json(response)
      }

      if (!agreement.is_active) {
        const response: ApiResponse = {
          success: false,
          error: 'Agreement is not active'
        }
        return res.status(400).json(response)
      }

      // Create investment record in database
      const investmentId = await database.createInvestment({
        agreementId,
        investorAddress,
        amount,
        transactionHash: null
      })

      // Execute investment on Hedera blockchain
      const hederaResult = await hederaService.investInAgreement(
        agreementId,
        amount,
        investorAddress
      )

      if (hederaResult.success) {
        // Update investment with transaction hash
        await database.updateInvestmentTransactionHash(investmentId, hederaResult.transactionId)

        const response: ApiResponse = {
          success: true,
          data: {
            investmentId,
            agreementId,
            amount,
            investorAddress,
            transactionId: hederaResult.transactionId,
            message: 'Investment successful'
          }
        }

        res.json(response)
      } else {
        // Rollback database investment if blockchain fails
        await database.deleteInvestment(investmentId)
        
        const response: ApiResponse = {
          success: false,
          error: 'Failed to execute investment on blockchain',
          message: hederaResult.error
        }
        res.status(500).json(response)
      }
    } catch (error) {
      console.error('Error processing investment:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to process investment',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Create investment transaction for investor to sign
  router.post('/create-investment-transaction/:agreementId', async (req: Request, res: Response) => {
    try {
      const agreementId = parseInt(req.params.agreementId)
      const { amount, investorAddress } = req.body

      if (isNaN(agreementId) || agreementId < 0) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid agreement ID'
        }
        return res.status(400).json(response)
      }

      if (!amount || amount <= 0) {
        const response: ApiResponse = {
          success: false,
          error: 'Investment amount must be greater than 0'
        }
        return res.status(400).json(response)
      }

      if (!investorAddress) {
        const response: ApiResponse = {
          success: false,
          error: 'Investor address is required'
        }
        return res.status(400).json(response)
      }

      // Check if agreement exists and is active
      const agreement = await database.getAgreement(agreementId)
      if (!agreement) {
        const response: ApiResponse = {
          success: false,
          error: 'Agreement not found'
        }
        return res.status(404).json(response)
      }

      if (!agreement.is_active) {
        const response: ApiResponse = {
          success: false,
          error: 'Agreement is not active'
        }
        return res.status(400).json(response)
      }

      // Create investment transaction for investor to sign
      const transactionResult = await hederaService.createInvestmentTransaction(
        agreementId,
        amount,
        investorAddress
      )

      if (transactionResult.success) {
        const response: ApiResponse = {
          success: true,
          data: {
            agreementId,
            amount,
            investorAddress,
            transactionBytes: transactionResult.transactionBytes,
            message: 'Transaction created for investor signature'
          }
        }

        res.json(response)
      } else {
        const response: ApiResponse = {
          success: false,
          error: 'Failed to create investment transaction',
          message: transactionResult.error
        }
        res.status(500).json(response)
      }
    } catch (error) {
      console.error('Error creating investment transaction:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to create investment transaction',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get investments for an agreement
  router.get('/investments/:agreementId', async (req: Request, res: Response) => {
    try {
      const agreementId = parseInt(req.params.agreementId)

      if (isNaN(agreementId) || agreementId < 0) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid agreement ID'
        }
        return res.status(400).json(response)
      }

      const investments = await database.getInvestmentsByAgreement(agreementId)

      const response: ApiResponse = {
        success: true,
        data: investments
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching investments:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch investments',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get investments by user address
  router.get('/user-investments/:userAddress', async (req: Request, res: Response) => {
    try {
      const userAddress = req.params.userAddress

      if (!userAddress) {
        const response: ApiResponse = {
          success: false,
          error: 'User address is required'
        }
        return res.status(400).json(response)
      }

      const investments = await database.getInvestmentsByUser(userAddress)

      const response: ApiResponse = {
        success: true,
        data: investments
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching user investments:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch user investments',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get blockchain records for a user
  router.get('/blockchain-records', async (req: Request, res: Response) => {
    console.log('Blockchain records endpoint called')
    try {
      const userAddress = req.query.userAddress as string
      const limit = parseInt(req.query.limit as string) || 20

      if (!userAddress) {
        const response: ApiResponse = {
          success: false,
          error: 'userAddress is required'
        }
        res.status(400).json(response)
        return
      }

      const payments = await database.getPaymentsWithBlockchainData({
        producerAddress: userAddress,
        limit
      })

      const response: ApiResponse = {
        success: true,
        data: {
          records: payments,
          total: payments.length,
          userAddress
        }
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching blockchain records:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch blockchain records'
      }
      res.status(500).json(response)
    }
  })

  return router
}
