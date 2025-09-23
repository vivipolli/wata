import { HederaService } from './hedera.js'
import { Database } from '../database.js'
import { ethers } from 'ethers'

interface PaymentData {
  id: number
  agreement_id: number
  amount: number
  status: string
  transaction_hash?: string
  created_at: string
  processed_at?: string
  batch_id?: number
}

interface AgreementData {
  id: number
  producer_address: string
  base_value: number
  hectares: number
  agreement_hash: string
  created_at: string
  is_active: boolean
}

interface ReadingData {
  id: number
  agreement_id: number
  turbidity_ntu: number
  timestamp: string
  location_lat?: number
  location_lng?: number
  is_simulated: boolean
  audit_hash?: string
}

interface PaymentCheckResult {
  success: boolean
  message: string
  averageTurbidity?: number
  amount?: number
  threshold?: number
}

export class RelayerService {
  private hederaService: HederaService
  private database: Database
  private isRunning: boolean = false
  private eventListeners: Map<string, Function> = new Map()
  private intervalId: NodeJS.Timeout | null = null

  constructor(hederaService: HederaService, database: Database) {
    this.hederaService = hederaService
    this.database = database
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Relayer service is already running')
      return
    }

    this.isRunning = true
    console.log('🔄 Relayer service started - listening for payment events')

    // In a real implementation, you would listen to Hedera events
    // For this MVP, we'll simulate event processing
    this.startEventProcessing()
  }

  stop(): void {
    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    console.log('Relayer service stopped')
  }

  private startEventProcessing(): void {
    // Simulate listening for PaymentApproved events from the oracle system
    // In production, this would connect to Hedera's event system
    this.intervalId = setInterval(async () => {
      if (!this.isRunning) return

      try {
        await this.processPendingPayments()
        await this.processApprovedPayments()
      } catch (error) {
        console.error('Error processing payments:', error)
      }
    }, 30000) // Check every 30 seconds
  }

  private async processPendingPayments(): Promise<void> {
    try {
      const pendingPayments = await this.database.getPendingPayments()
      
      for (const payment of pendingPayments) {
        await this.processPayment(payment as PaymentData)
      }
    } catch (error) {
      console.error('Error processing pending payments:', error)
    }
  }

  private async processApprovedPayments(): Promise<void> {
    try {
      // Get batches that have been validated and have scores >= 70
      const approvedBatches = await (this.database as any).all(`
        SELECT b.*, a.producer_address, a.base_value, a.hectares 
        FROM batches b
        JOIN agreements a ON b.agreement_id = a.id
        WHERE b.score >= 70 
        AND b.validation_status = 'submitted'
        AND b.id NOT IN (
          SELECT DISTINCT batch_id FROM payments WHERE batch_id IS NOT NULL
        )
        ORDER BY b.submitted_at ASC
      `)

      for (const batch of approvedBatches) {
        await this.handlePaymentApproved(
          batch.agreement_id,
          batch.producer_address,
          batch.base_value * batch.hectares,
          batch.audit_hash,
          batch.score,
          batch.id
        )
      }
    } catch (error) {
      console.error('Error processing approved payments:', error)
    }
  }

  private async processPayment(payment: PaymentData): Promise<void> {
    try {
      console.log(`Processing payment ${payment.id} for agreement ${payment.agreement_id}`)

      // Get agreement details
      const agreement = await this.database.getAgreement(payment.agreement_id) as AgreementData
      if (!agreement) {
        console.error(`Agreement ${payment.agreement_id} not found`)
        return
      }

      // Get the transaction hash from the oracle logs for this batch
      const oracleLog = await (this.database as any).get(
        'SELECT transaction_hash FROM oracle_logs WHERE batch_id = ? AND action = "batch_submitted" ORDER BY timestamp DESC LIMIT 1',
        [payment.batch_id]
      )
      
      const transactionHash = oracleLog?.transaction_hash || 'simulated_transfer'

      // In production, this would use Hedera SDK to transfer HBAR or HTS tokens
      // For now, we'll use the batch transaction hash as the payment reference
      console.log(`Processing payment for batch ${payment.batch_id} with tx: ${transactionHash}`)

      // Update payment status
      await this.database.updatePaymentStatus(
        payment.id,
        'completed',
        transactionHash
      )

      console.log(`✅ Payment ${payment.id} completed with tx: ${transactionHash}`)
    } catch (error) {
      console.error(`Error processing payment ${payment.id}:`, error)
      
      // Mark payment as failed
      await this.database.updatePaymentStatus(payment.id, 'failed')
    }
  }

  private async simulateHbarTransfer(toAddress: string, amount: number): Promise<string> {
    // Simulate HBAR transfer
    // In production, this would use Hedera SDK:
    // const transaction = new TransferTransaction()
    //   .addHbarTransfer(this.hederaService.accountId, new Hbar(-amount))
    //   .addHbarTransfer(AccountId.fromString(toAddress), new Hbar(amount))
    
    const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`
    
    console.log(`Simulated HBAR transfer: ${amount} to ${toAddress}`)
    console.log(`Transaction hash: ${transactionHash}`)
    
    return transactionHash
  }

  async handlePaymentApproved(
    agreementId: number, 
    producerAddress: string, 
    amount: number, 
    auditHash: string, 
    score: number,
    batchId: number
  ): Promise<void> {
    try {
      console.log(`Payment approved event received:`)
      console.log(`- Agreement ID: ${agreementId}`)
      console.log(`- Producer: ${producerAddress}`)
      console.log(`- Amount: ${amount}`)
      console.log(`- Score: ${score}`)
      console.log(`- Audit Hash: ${auditHash}`)

      // Create payment record in database
      const paymentId = await this.database.createPayment({
        agreementId: agreementId,
        batchId: batchId,
        amount: amount,
        status: 'pending',
        auditHash: auditHash,
        score: score
      })

      console.log(`Payment record created with ID: ${paymentId}`)
      
      // Process payment immediately
      const payment = await this.database.getPayment(paymentId) as PaymentData
      if (payment) {
        await this.processPayment(payment)
        
        // Record audit on blockchain after successful payment
        await this.hederaService.recordAudit(auditHash)
        
        // Log the successful payment processing
        await this.database.createOracleLog({
          batchId: batchId,
          action: 'payment_processed',
          details: `Payment of ${amount} processed for score ${score}`,
          transactionHash: payment.transaction_hash
        })
      }
    } catch (error) {
      console.error('Error handling payment approved event:', error)
    }
  }

  async handlePaymentRequested(agreementId: number, producerAddress: string, amount: number, auditHash: string): Promise<void> {
    try {
      console.log(`Payment requested event received:`)
      console.log(`- Agreement ID: ${agreementId}`)
      console.log(`- Producer: ${producerAddress}`)
      console.log(`- Amount: ${amount}`)
      console.log(`- Audit Hash: ${auditHash}`)

      // Create payment record in database
      const paymentId = await this.database.createPayment({
        agreementId: agreementId,
        amount: amount,
        status: 'pending',
        auditHash: auditHash
      })

      console.log(`Payment record created with ID: ${paymentId}`)
      
      // Process payment immediately
      const payment = await this.database.getPayment(paymentId) as PaymentData
      if (payment) {
        await this.processPayment(payment)
      }
    } catch (error) {
      console.error('Error handling payment requested event:', error)
    }
  }

  // Method to manually trigger payment processing (for testing)
  async triggerPaymentCheck(agreementId: number): Promise<PaymentCheckResult> {
    try {
      const agreement = await this.database.getAgreement(agreementId) as AgreementData
      if (!agreement) {
        throw new Error('Agreement not found')
      }

      // Get recent readings for this agreement
      const readings = await this.database.getReadingsByAgreement(agreementId, 7) as ReadingData[]
      
      if (readings.length === 0) {
        throw new Error('No readings found for this agreement')
      }

      // Calculate average turbidity for the last 7 readings
      const avgTurbidity = readings.reduce((sum, reading) => sum + reading.turbidity_ntu, 0) / readings.length
      
      console.log(`Average turbidity for agreement ${agreementId}: ${avgTurbidity.toFixed(2)} NTU`)

      // Check if water quality meets standards (≤ 10 NTU)
      if (avgTurbidity <= 10) {
        const auditHash = `audit_${Date.now()}_${Math.random().toString(16).substr(2, 8)}`
        
        // Record audit on blockchain
        await this.hederaService.recordAudit(auditHash)
        
        // Request payment
        await this.hederaService.requestPayment(agreementId, auditHash)
        
        // Simulate the payment requested event
        const amount = agreement.base_value * agreement.hectares
        await this.handlePaymentRequested(agreementId, agreement.producer_address, amount, auditHash)
        
        return {
          success: true,
          message: 'Payment approved and processed',
          averageTurbidity: avgTurbidity,
          amount: amount
        }
      } else {
        return {
          success: false,
          message: 'Water quality does not meet standards',
          averageTurbidity: avgTurbidity,
          threshold: 10
        }
      }
    } catch (error) {
      console.error('Error triggering payment check:', error)
      throw error
    }
  }
}
