import {
  Client,
  AccountId,
  PrivateKey,
  ContractFunctionParameters,
  ContractCallQuery,
  ContractExecuteTransaction,
  Hbar,
  ContractId,
  AccountBalanceQuery,
  TransactionRecord,
  TransferTransaction,
  AccountInfoQuery,
  TransactionId,
  TransactionRecordQuery
} from '@hashgraph/sdk'
import { ethers } from 'ethers'
import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

function formatBytes32String(str: string): Uint8Array {
  const hash = Buffer.from(str, 'utf8')
  const padded = Buffer.alloc(32)
  hash.copy(padded, 0, 0, Math.min(hash.length, 32))
  return new Uint8Array(padded)
}

interface AgreementData {
  agreementHash: string
  producer: string
  baseValue: bigint
  hectares: bigint
  isActive: boolean
  createdAt: bigint
}

export class HederaService {
  private client: Client | null = null
  private accountId: AccountId | null = null
  private privateKey: PrivateKey | null = null
  private contractAddress: string | null = null
  private contractId: ContractId | null = null

  async initialize(): Promise<void> {
    try {
      this.accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!)
      
      const privateKeyString = process.env.HEDERA_PRIVATE_KEY!
      if (privateKeyString.startsWith('0x')) {
        this.privateKey = PrivateKey.fromStringECDSA(privateKeyString.slice(2))
      } else {
        this.privateKey = PrivateKey.fromString(privateKeyString)
      }
      this.contractAddress = process.env.CONTRACT_ADDRESS!

      this.client = Client.forTestnet().setOperator(this.accountId, this.privateKey)
      
      if (this.contractAddress.startsWith('0x')) {
        this.contractId = ContractId.fromEvmAddress(0, 0, this.contractAddress)
      } else {
        this.contractId = ContractId.fromString(this.contractAddress)
      }
    } catch (error) {
      throw error
    }
  }

  async createAgreementWithSystem(agreementHash: string, producerAddress: string, baseValue: number, hectares: number): Promise<{ agreementId: number, transactionId: string }> {
    try {
      let contractAddress: string
      if (producerAddress.startsWith('0.0.')) {
        const accountId = AccountId.fromString(producerAddress)
        contractAddress = accountId.toSolidityAddress()
      } else {
        contractAddress = producerAddress
      }

      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId!)
        .setGas(200000)
        .setFunction(
          'createAgreement',
          new ContractFunctionParameters()
            .addBytes32(this.formatBytes32String(agreementHash))
            .addAddress(contractAddress)
            .addUint256(baseValue)
            .addUint256(hectares)
        )
      
      const serverTransactionId = TransactionId.generate(this.accountId!)
      transaction.setTransactionId(serverTransactionId)
      
      const response = await transaction.execute(this.client!)
      const receipt = await response.getReceipt(this.client!)
      const record = await response.getRecord(this.client!)
      const result = record.contractFunctionResult?.getUint256(0)
      const transactionId = record.transactionId?.toString()
      
      return {
        agreementId: Number(result || 0),
        transactionId: transactionId
      }
    } catch (error) {
      throw error
    }
  }

  async requestPayment(agreementId: number, auditHash: string): Promise<TransactionRecord> {
    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId!)
        .setGas(200000)
        .setFunction(
          'requestPayment',
          new ContractFunctionParameters()
            .addUint256(agreementId)
            .addBytes32(formatBytes32String(auditHash))
        )

      const frozenTransaction = await transaction.freezeWith(this.client!)
      const response = await frozenTransaction.execute(this.client!)
      const receipt = await response.getReceipt(this.client!)
      const record = await response.getRecord(this.client!)

      return record
    } catch (error) {
      throw error
    }
  }

  async submitValidatedBatch(agreementId: number, auditHash: string, score: number): Promise<TransactionRecord> {
    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId!)
        .setGas(200000)
        .setFunction(
          'submitValidatedBatch',
          new ContractFunctionParameters()
            .addUint256(agreementId)
            .addBytes32(formatBytes32String(auditHash))
            .addUint256(score)
        )

      const frozenTransaction = await transaction.freezeWith(this.client!)
      const response = await frozenTransaction.execute(this.client!)
      const receipt = await response.getReceipt(this.client!)
      const record = await response.getRecord(this.client!)

      const accountId = record.transactionId.accountId?.toString()
      const validStart = record.transactionId.validStart
      const transactionId = `${accountId}@${validStart.seconds}.${validStart.nanos}`
      
      console.log('HederaService - Transaction details:', {
        accountId,
        validStart: validStart.toString(),
        transactionId,
        receiptStatus: receipt.status
      })
      
      return {
        ...receipt,
        transactionHash: transactionId,
        transactionId: record.transactionId
      } as any
    } catch (error) {
      throw error
    }
  }

  async verifyTransaction(transactionHash: string): Promise<{
    status: string
    success: boolean
    details?: any
  }> {
    try {
      const transactionId = TransactionId.fromString(transactionHash)
      const record = await new TransactionRecordQuery()
        .setTransactionId(transactionId)
        .execute(this.client!)
      
      const status = record.receipt?.status?.toString() || 'UNKNOWN'
      const success = status === 'SUCCESS'
      
      return {
        status,
        success,
        details: {
          consensusTimestamp: record.consensusTimestamp,
          transactionId: record.transactionId,
          receipt: record.receipt
        }
      }
    } catch (error) {
      return {
        status: 'ERROR',
        success: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  async recordAudit(auditHash: string): Promise<TransactionRecord> {
    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId!)
        .setGas(200000)
        .setFunction(
          'recordAudit',
          new ContractFunctionParameters()
            .addBytes32(formatBytes32String(auditHash))
        )

      const frozenTransaction = await transaction.freezeWith(this.client!)
      const response = await frozenTransaction.execute(this.client!)
      const receipt = await response.getReceipt(this.client!)
      const record = await response.getRecord(this.client!)

      return record
    } catch (error) {
      throw error
    }
  }

  async getAgreement(agreementId: number): Promise<AgreementData> {
    try {
      const query = new ContractCallQuery()
        .setContractId(this.contractId!)
        .setGas(200000)
        .setFunction(
          'getAgreement',
          new ContractFunctionParameters().addUint256(agreementId)
        )

      const response = await query.execute(this.client!)
      const result = (response as any).getContractFunctionResult()

      return {
        agreementHash: result.getBytes32(0),
        producer: result.getAddress(1),
        baseValue: result.getUint256(2),
        hectares: result.getUint256(3),
        isActive: result.getBool(4),
        createdAt: result.getUint256(5)
      }
    } catch (error) {
      console.error('Error getting agreement from Hedera:', error)
      throw error
    }
  }


  async getAccountBalance(accountId: string): Promise<string> {
    try {
      const balance = await new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(accountId))
        .execute(this.client!)

      return balance.hbars.toString()
    } catch (error) {
      throw error
    }
  }

  async transferHBAR(toAddress: string, amountInTinybars: number): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      const transferTransaction = new TransferTransaction()
        .addHbarTransfer(AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!), new Hbar(-amountInTinybars / 100000000))
        .addHbarTransfer(AccountId.fromString(toAddress), new Hbar(amountInTinybars / 100000000))
        .setMaxTransactionFee(new Hbar(5))

      const frozenTransaction = await transferTransaction.freezeWith(this.client!)
      const response = await frozenTransaction.execute(this.client!)
      const receipt = await response.getReceipt(this.client!)
      
      const transactionId = response.transactionId.toString()

      return {
        success: true,
        transactionHash: transactionId
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getAccountInfo(accountId: string): Promise<any> {
    try {
      const accountInfo = await new AccountInfoQuery()
        .setAccountId(AccountId.fromString(accountId))
        .execute(this.client!)

      return {
        accountId: accountInfo.accountId.toString(),
        balance: accountInfo.balance.toString(),
        key: accountInfo.key.toString(),
        isDeleted: accountInfo.isDeleted,
        proxyAccountId: accountInfo.proxyAccountId?.toString(),
        proxyReceived: accountInfo.proxyReceived.toString()
      }
    } catch (error) {
      throw error
    }
  }

  async investInAgreement(agreementId: number, amount: number, investorAddress: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      if (!this.client || !this.contractId || !this.accountId || !this.privateKey) {
        throw new Error('Hedera service not initialized')
      }

      // Convert amount to tinybars (1 HBAR = 100,000,000 tinybars)
      const amountInTinybars = Math.floor(amount * 100000000)

      // Create investment transaction
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(1000000)
        .setFunction('investInAgreement', new ContractFunctionParameters().addUint256(agreementId))
        .setPayableAmount(Hbar.fromTinybars(amountInTinybars))
        .setTransactionMemo(`Investment in agreement ${agreementId} by ${investorAddress}`)

      // Freeze, sign and execute transaction
      const frozenTransaction = await transaction.freezeWith(this.client!)
      const signedTransaction = await frozenTransaction.sign(this.privateKey)
      const txResponse = await signedTransaction.execute(this.client)

      // Get transaction receipt
      const receipt = await txResponse.getReceipt(this.client)
      const transactionId = txResponse.transactionId.toString()

      console.log(`Investment successful for agreement ${agreementId}: ${transactionId}`)
      console.log(`Investment made by server on behalf of investor: ${investorAddress}`)

      return {
        success: true,
        transactionId
      }
    } catch (error) {
      console.error('Error investing in agreement:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // New method: Create investment transaction for investor to sign
  async createInvestmentTransaction(agreementId: number, amount: number, investorAddress: string): Promise<{ success: boolean; transactionBytes?: string; error?: string }> {
    try {
      if (!this.client || !this.contractId) {
        throw new Error('Hedera service not initialized')
      }

      // Convert amount to tinybars (1 HBAR = 100,000,000 tinybars)
      const amountInTinybars = Math.floor(amount * 100000000)

      // Create investment transaction
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(1000000)
        .setFunction('investInAgreement', new ContractFunctionParameters().addUint256(agreementId))
        .setPayableAmount(Hbar.fromTinybars(amountInTinybars))
        .setTransactionMemo(`Investment in agreement ${agreementId} by ${investorAddress}`)

      // Freeze transaction for investor to sign
      const frozenTransaction = await transaction.freezeWith(this.client!)
      
      // Convert to bytes for investor to sign
      const transactionBytes = frozenTransaction.toBytes()

      return {
        success: true,
        transactionBytes: Buffer.from(transactionBytes).toString('hex')
      }
    } catch (error) {
      console.error('Error creating investment transaction:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private formatBytes32String(str: string): Uint8Array {
    const hash = Buffer.from(str, 'utf8')
    const padded = Buffer.alloc(32)
    hash.copy(padded, 0, 0, Math.min(hash.length, 32))
    return new Uint8Array(padded)
  }
}
