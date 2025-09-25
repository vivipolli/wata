import {
  Client,
  FileCreateTransaction,
  FileAppendTransaction,
  FileId,
  PrivateKey,
  AccountId,
  Hbar,
} from '@hashgraph/sdk'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

config()

export interface AuditReport {
  agreementId: string
  batchId: number
  auditHash: string
  score: number
  timestamp: string
  transactionHash: string
  producerAddress: string
  investorAddress?: string
  readings: any[]
  validationDetails: any
  paymentDetails?: any
}

export class HederaFileService {
  private client: Client
  private operatorId: AccountId
  private operatorKey: PrivateKey

  constructor() {
    this.operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!)
    
    // Handle different private key formats
    const privateKeyString = process.env.HEDERA_PRIVATE_KEY!
    if (privateKeyString.startsWith('0x')) {
      // Remove 0x prefix for Hedera SDK
      this.operatorKey = PrivateKey.fromString(privateKeyString.slice(2))
    } else {
      this.operatorKey = PrivateKey.fromString(privateKeyString)
    }
    
    this.client = Client.forTestnet()
    this.client.setOperator(this.operatorId, this.operatorKey)
    // Set default max transaction fee - skip for now to avoid constructor issues
    // this.client.setDefaultMaxTransactionFee(new Hbar(10))
  }

  async createAuditReport(report: AuditReport): Promise<string> {
    try {
      // Generate report content
      const reportContent = this.generateReportContent(report)
      
      // Create file on Hedera
      const createFileTx = new FileCreateTransaction()
        .setContents(reportContent)
        .setMaxTransactionFee(new Hbar(5))

      const createFileResponse = await createFileTx.execute(this.client)
      const createFileReceipt = await createFileResponse.getReceipt(this.client)
      
      const fileId = createFileReceipt.fileId!
      console.log(`Audit report created on HFS: ${fileId}`)
      
      return fileId.toString()
    } catch (error) {
      console.error('Failed to create audit report on HFS:', error)
      throw error
    }
  }

  async appendToReport(fileId: string, additionalData: any): Promise<void> {
    try {
      const fileIdObj = FileId.fromString(fileId)
      const content = JSON.stringify(additionalData, null, 2)
      
      const appendTx = new FileAppendTransaction()
        .setFileId(fileIdObj)
        .setContents(content)
        .setMaxTransactionFee(new Hbar(2))

      await appendTx.execute(this.client)
      console.log(`Data appended to HFS file: ${fileId}`)
    } catch (error) {
      console.error('Failed to append to HFS file:', error)
      throw error
    }
  }

  private generateReportContent(report: AuditReport): string {
    const reportData = {
      metadata: {
        version: '1.0',
        generatedAt: new Date().toISOString(),
        reportType: 'WATA_AUDIT_REPORT'
      },
      summary: {
        agreementId: report.agreementId,
        batchId: report.batchId,
        auditHash: report.auditHash,
        score: report.score,
        timestamp: report.timestamp,
        transactionHash: report.transactionHash,
        producerAddress: report.producerAddress,
        investorAddress: report.investorAddress
      },
      details: {
        readings: report.readings,
        validationDetails: report.validationDetails,
        paymentDetails: report.paymentDetails
      },
      compliance: {
        standards: ['ISO 14001', 'WATA_QUALITY_STANDARDS'],
        certifications: ['HEDERA_CONSENSUS_VERIFIED'],
        auditTrail: 'IMMUTABLE_HCS_RECORD'
      }
    }

    return JSON.stringify(reportData, null, 2)
  }

  async getHederaExplorerUrl(fileId: string): Promise<string> {
    return `https://hashscan.io/testnet/file/${fileId}`
  }

  async shutdown(): Promise<void> {
    this.client.close()
  }
}

export const hfsService = new HederaFileService()
