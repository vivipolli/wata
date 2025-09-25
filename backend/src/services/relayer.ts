import { HederaService } from './hedera'
import { Database } from '../database'
import { hcsService, type AuditRecord } from './hcs'
import { hfsService, type AuditReport } from './hfs'
import { ethers } from 'ethers'

interface PaymentCheckResult {
  success: boolean
  message: string
  averageTurbidity?: number
  amount?: number
  threshold?: number
  hcsTransactionId?: string
  hfsFileId?: string
}

export class RelayerService {
  private hederaService: HederaService
  private database: Database
  private isRunning: boolean = false
  private contract: ethers.Contract | null = null
  private provider: ethers.Provider | null = null
  constructor(hederaService: HederaService, database: Database) {
    this.hederaService = hederaService
    this.database = database
  }

  async initialize(): Promise<void> {
    try {
      await this.hederaService.initialize()
      await hcsService.initialize()
      
      this.provider = new ethers.JsonRpcProvider(process.env.HEDERA_RPC_URL || 'https://testnet.hashio.io/api')
      
      const contractAddress = process.env.CONTRACT_ADDRESS
      if (contractAddress) {
        this.contract = new ethers.Contract(
          contractAddress,
          this.getContractABI(),
          this.provider
        )
      }

      console.log('RelayerService initialized successfully')
    } catch (error) {
      console.error('Failed to initialize RelayerService:', error)
      throw error
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Relayer service is already running')
      return
    }

    try {
      await this.initialize()
      this.isRunning = true
      console.log('🔄 Relayer service started - listening for payment events')

      this.setupEventListeners()
    } catch (error) {
      console.error('Failed to start RelayerService:', error)
      this.isRunning = false
      throw error
    }
  }

  stop(): void {
    this.isRunning = false
    console.log('Relayer service stopped')
  }

  private setupEventListeners(): void {
    if (!this.contract) {
      console.warn('No contract available for event listening')
      return
    }

    // Listen for PaymentApproved events
    this.contract.on('PaymentApproved', async (...args: any[]) => {
      try {
        console.log('PaymentApproved event received:', args)
        
        await this.handlePaymentApproved(
          Number(args[0]), // agreementId
          args[1],         // producer
          args[2],         // investor
          Number(args[3]), // amount
          args[4],         // auditHash
          Number(args[5]), // score
          args[6],         // hcsTransactionId
          args[7],         // hfsFileId
          args[8]?.transactionHash // transactionHash
        )
      } catch (error) {
        console.error('Error handling PaymentApproved event:', error)
      }
    })
  }

  // Main payment handler - processes PaymentApproved events
  private async handlePaymentApproved(
    agreementId: number,
    producer: string,
    investor: string,
    amount: number,
    auditHash: string,
    score: number,
    hcsTransactionId: string,
    hfsFileId: string,
    transactionHash: string
  ): Promise<void> {
    try {
      console.log(`Processing payment for agreement ${agreementId}`)
      
      // Get agreement details
      const agreement = await this.database.getAgreement(agreementId)
      if (!agreement) {
        console.error(`Agreement ${agreementId} not found`)
        return
      }

      // Use HCS/HFS IDs from contract if available, otherwise create new ones
      let finalHcsTransactionId = hcsTransactionId
      let finalHfsFileId = hfsFileId

      // Create audit record for HCS if no HCS ID provided
      if (!finalHcsTransactionId || finalHcsTransactionId === '') {
        const auditRecord: AuditRecord = {
          agreementId: agreementId.toString(),
          batchId: 0,
          auditHash,
          score,
          timestamp: new Date().toISOString(),
          transactionHash,
          producerAddress: producer,
          investorAddress: investor
        }
        finalHcsTransactionId = await hcsService.publishAuditRecord(auditRecord)
      }

      // Create detailed audit report for HFS if no HFS ID provided
      if (!finalHfsFileId || finalHfsFileId === '' || finalHfsFileId === '0.0.0') {
        const batch = await this.getBatchByAuditHash(auditHash)
        const auditReport: AuditReport = {
          agreementId: agreementId.toString(),
          batchId: batch?.id || 0,
          auditHash,
          score,
          timestamp: new Date().toISOString(),
          transactionHash,
          producerAddress: producer,
          investorAddress: investor,
          readings: batch ? await this.getBatchReadings(batch.id) : [],
          validationDetails: {
            score,
            threshold: 0.7,
            passed: score >= 0.7,
            governanceMode: agreement.governance_mode || 'AUTO'
          },
          paymentDetails: {
            amount,
            currency: 'HBAR',
            status: 'APPROVED',
            automatic: true
          }
        }
        finalHfsFileId = await hfsService.createAuditReport(auditReport)
      }

      // Execute HBAR payment
      const paymentResult = await this.executeHBARPayment(
        agreementId,
        producer,
        amount,
        auditHash,
        score,
        finalHcsTransactionId,
        finalHfsFileId
      )

      if (paymentResult.success) {
        console.log(`Payment executed successfully for agreement ${agreementId}`)
      } else {
        console.error(`Payment failed for agreement ${agreementId}:`, paymentResult.message)
      }
    } catch (error) {
      console.error('Error handling payment approval:', error)
    }
  }

  // Execute HBAR payment using HederaService
  private async executeHBARPayment(
    agreementId: number,
    producerAddress: string,
    amount: number,
    auditHash: string,
    score: number,
    hcsTransactionId: string,
    hfsFileId: string
  ): Promise<PaymentCheckResult> {
    try {
      // Check if payment already exists for this audit hash
      const existingPayments = await this.database.getPaymentsByAgreement(agreementId)
      const existingPayment = existingPayments.find(p => p.audit_hash === auditHash)
      
      if (existingPayment) {
        console.log(`Payment already exists for audit hash ${auditHash}, skipping`)
        return {
          success: true,
          message: 'Payment already exists',
          amount,
          hcsTransactionId,
          hfsFileId
        }
      }

      // Convert amount to tinybars (1 HBAR = 100,000,000 tinybars)
      const amountInTinybars = Math.floor(amount * 100000000)

      // Execute HBAR transfer using HederaService
      const transferResult = await this.hederaService.transferHBAR(
        producerAddress,
        amountInTinybars
      )

      if (transferResult.success) {
        // Get batch ID from audit hash
        const batch = await this.getBatchByAuditHash(auditHash)
        
        // Record successful payment with V3 fields if available
        const paymentData: any = {
          agreementId,
          batchId: batch?.id || null,
          amount,
          status: 'completed',
          auditHash,
          score,
          transactionHash: transferResult.transactionHash
        }

        // Add HCS/HFS fields and investor address
        paymentData.hcsTransactionId = hcsTransactionId
        paymentData.hfsFileId = hfsFileId
        paymentData.investorAddress = await this.getInvestorAddress(agreementId)

        await this.database.createPayment(paymentData)

        return {
          success: true,
          message: 'Payment executed successfully',
          amount,
          hcsTransactionId,
          hfsFileId
        }
      } else {
        return {
          success: false,
          message: transferResult.error || 'Payment execution failed'
        }
      }
    } catch (error) {
      console.error('Error executing HBAR payment:', error)
      return {
        success: false,
        message: `Payment execution error: ${error}`
      }
    }
  }

  // Helper methods
  private async getBatchByAuditHash(auditHash: string): Promise<any> {
    try {
      const batch = await this.database.getBatchByAuditHash(auditHash)
      return batch
    } catch (error) {
      console.error('Error getting batch by audit hash:', error)
      return null
    }
  }

  // Helper method to get investor address from agreement
  private async getInvestorAddress(agreementId: number): Promise<string | null> {
    try {
      const agreement = await this.database.getAgreement(agreementId)
      return agreement?.investor_address || null
    } catch (error) {
      console.error('Error getting investor address:', error)
      return null
    }
  }

  private async getBatchReadings(batchId: number): Promise<any[]> {
    try {
      // This would need to be implemented in the database service
      return []
    } catch (error) {
      console.error('Error getting batch readings:', error)
      return []
    }
  }

  private getContractABI(): any[] {
    return [
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "agreementId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "producer",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "investor",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "auditHash",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "score",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "hcsTransactionId",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "hfsFileId",
            "type": "string"
          }
        ],
        "name": "PaymentApproved",
        "type": "event"
      }
    ]
  }

  async getStatus(): Promise<any> {
    return {
      isRunning: this.isRunning,
      contractAddress: process.env.CONTRACT_ADDRESS,
      hcsTopicId: await hcsService.getTopicId(),
      lastProcessedAt: new Date().toISOString()
    }
  }
}