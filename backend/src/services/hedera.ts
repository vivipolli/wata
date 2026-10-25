import {
  Client,
  AccountId,
  PrivateKey,
  ContractFunctionParameters,
  ContractCallQuery,
  ContractExecuteTransaction,
  ContractId,
  AccountBalanceQuery,
  TransactionRecord,
  AccountInfoQuery,
  TransactionId,
  TransactionRecordQuery
} from '@hashgraph/sdk'
import { ethers } from 'ethers'
import crypto from 'crypto'
import dotenv from 'dotenv'
import { sha256HexToBytes32 } from '../utils/bytes32'
import { createHederaClient } from '../utils/hederaNetwork'
import { EscrowService, type EscrowLedger, type ContractExecution, type OnPrepared } from './escrow'

dotenv.config()

interface AgreementData {
  agreementHash: string
  producer: string
  baseValue: bigint
  hectares: bigint
  isActive: boolean
  createdAt: bigint
}

// Gas limits for escrow v3 calls. Hedera charges at least 80% of the gas limit, so these stay tight;
// they are to be confirmed against measured usage on a local network.
const ESCROW_EXECUTE_GAS = 300000
const ESCROW_QUERY_GAS = 100000
const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/
const SDK_TRANSACTION_ID = /^(\d+\.\d+\.\d+)@(\d+)\.(\d{1,9})$/

// 0.0.1001@1700000000.42 -> 0.0.1001-1700000000-000000042 (Mirror Node format)
function toMirrorTransactionId(transactionId: string): string {
  const match = SDK_TRANSACTION_ID.exec(transactionId)
  if (!match) throw new Error(`Malformed transaction id: ${transactionId}`)
  return `${match[1]}-${match[2]}-${match[3].padStart(9, '0')}`
}

function mirrorBaseUrl(): string {
  const url = process.env.MIRROR_NODE_URL
  if (!url || !/^https?:\/\/[^\s/]+(:\d+)?\/?$/.test(url)) {
    throw new Error('MIRROR_NODE_URL must be set to the http(s) base URL of the Mirror Node REST API')
  }
  return url.replace(/\/$/, '')
}

function toHex(bytes: Uint8Array): string {
  return '0x' + Buffer.from(bytes).toString('hex')
}

export class HederaService implements EscrowLedger {
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

      this.client = createHederaClient().setOperator(this.accountId, this.privateKey)
      
      if (this.contractAddress.startsWith('0x')) {
        this.contractId = ContractId.fromEvmAddress(0, 0, this.contractAddress)
      } else {
        this.contractId = ContractId.fromString(this.contractAddress)
      }
    } catch (error) {
      throw error
    }
  }

  /** EscrowService bound to ESCROW_CONTRACT_ADDRESS, using this service as the ledger. */
  getEscrowService(): EscrowService {
    const address = process.env.ESCROW_CONTRACT_ADDRESS
    if (!address || !EVM_ADDRESS.test(address)) {
      throw new Error('ESCROW_CONTRACT_ADDRESS must be set to the 0x-prefixed EVM address of PESEscrowV3')
    }
    return new EscrowService(this, address)
  }

  // EscrowLedger: executes a contract call and reports the outcome from the receipt and record.
  // A failed receipt is returned as is (no logs, no hash) so the caller decides; nothing is fabricated.
  // The transaction id is generated here and handed to onPrepared before sending, so a lost outcome
  // can be reconciled from the ledger. If onPrepared throws, the transaction is never sent.
  async execute(contractAddress: string, callData: string, onPrepared?: OnPrepared): Promise<ContractExecution> {
    const transaction = new ContractExecuteTransaction()
      .setTransactionId(TransactionId.generate(this.client!.operatorAccountId!))
      .setContractId(ContractId.fromEvmAddress(0, 0, contractAddress))
      .setGas(ESCROW_EXECUTE_GAS)
      .setFunctionParameters(Buffer.from(callData.slice(2), 'hex'))
      .freezeWith(this.client!)
    const transactionId = transaction.transactionId!.toString()
    if (onPrepared) await onPrepared(transactionId)
    const response = await transaction.execute(this.client!)
    const receipt = await response.getReceiptQuery().setValidateStatus(false).execute(this.client!)
    const status = receipt.status.toString()
    if (status !== 'SUCCESS') {
      return { transactionId, status, transactionHash: null, logs: [] }
    }

    const record = await response.getRecord(this.client!)
    const hash = record.transactionHash
    return {
      transactionId,
      status,
      transactionHash: hash && hash.length > 0 ? toHex(hash) : null,
      logs: (record.contractFunctionResult?.logs ?? []).map(log => ({
        address: '0x' + log.contractId.toEvmAddress(),
        topics: log.topics.map(toHex),
        data: toHex(log.data)
      }))
    }
  }

  // EscrowLedger: outcome of an earlier transaction from the Mirror Node. The hash is the full record
  // hash (same as the SDK record); logs come from the contract result. Unknown transaction -> null.
  async lookup(transactionId: string): Promise<ContractExecution | null> {
    const id = toMirrorTransactionId(transactionId)
    const base = mirrorBaseUrl()
    const txResponse = await fetch(`${base}/api/v1/transactions/${id}`)
    if (txResponse.status === 404) return null
    if (!txResponse.ok) throw new Error(`Mirror Node returned ${txResponse.status} for transaction ${transactionId}`)
    const body = await txResponse.json() as { transactions?: Array<Record<string, any>> }
    // The top-level transaction, not a child record it may have produced
    const tx = (body.transactions ?? []).find(t => t.parent_consensus_timestamp == null && (t.nonce ?? 0) === 0)
    if (!tx) return null
    const status = String(tx.result)
    if (status !== 'SUCCESS') {
      return { transactionId, status, transactionHash: null, logs: [] }
    }

    const resultResponse = await fetch(`${base}/api/v1/contracts/results/${id}`)
    if (!resultResponse.ok) throw new Error(`Mirror Node returned ${resultResponse.status} for contract result ${transactionId}`)
    const result = await resultResponse.json() as { logs?: Array<{ address: string; topics: string[]; data: string }> }
    const hash = Buffer.from(String(tx.transaction_hash ?? ''), 'base64')
    return {
      transactionId,
      status,
      transactionHash: hash.length > 0 ? toHex(hash) : null,
      logs: (result.logs ?? []).map(log => ({ address: log.address, topics: log.topics, data: log.data }))
    }
  }

  // EscrowLedger: read-only call; returns the raw ABI-encoded result.
  async query(contractAddress: string, callData: string): Promise<string> {
    const result = await new ContractCallQuery()
      .setContractId(ContractId.fromEvmAddress(0, 0, contractAddress))
      .setGas(ESCROW_QUERY_GAS)
      .setFunctionParameters(Buffer.from(callData.slice(2), 'hex'))
      .execute(this.client!)
    return toHex(result.bytes)
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
            .addBytes32(sha256HexToBytes32(agreementHash))
            .addAddress(contractAddress)
            .addUint256(baseValue)
            .addUint256(hectares)
        )
      
      const serverTransactionId = TransactionId.generate(this.accountId!)
      transaction.setTransactionId(serverTransactionId)
      
      const response = await transaction.execute(this.client!)
      const receipt = await response.getReceipt(this.client!)
      const record = await response.getRecord(this.client!)
      const transactionId = record.transactionId?.toString()

      // The agreement ID is the contract's return value. A missing or out-of-range result must
      // fail loudly: defaulting to 0 would bind this agreement to on-chain agreement #0.
      const functionResult = record.contractFunctionResult
      if (!functionResult) {
        throw new Error(`createAgreement returned no function result (transaction ${transactionId ?? 'unknown'})`)
      }
      const result = functionResult.getUint256(0)
      const agreementId = result == null ? NaN : Number(result.toString())
      if (!Number.isSafeInteger(agreementId) || agreementId < 0) {
        throw new Error(`createAgreement returned an invalid agreement ID (transaction ${transactionId ?? 'unknown'})`)
      }

      return {
        agreementId,
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
            .addBytes32(sha256HexToBytes32(auditHash))
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
            .addBytes32(sha256HexToBytes32(auditHash))
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
            .addBytes32(sha256HexToBytes32(auditHash))
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
}
