import apiClient from './api'
import { hederaSignatureService } from './hederaSignature'

export interface HederaAccountInfo {
  accountId: string
  balance: string
  key: string
  isDeleted: boolean
  proxyAccountId?: string
  proxyReceived: string
}

export interface TransferResult {
  success: boolean
  transactionHash?: string
  error?: string
}

export interface HederaTransactionData {
  transactionBytes: string
  transactionId: string
  message: string
}

class HederaService {
  async getAccountBalance(accountId: string): Promise<string> {
    try {
      const response = await apiClient.get(`/agreements/balance`)
      return response.data.data.balance
    } catch (error) {
      console.error('Error getting account balance:', error)
      throw error
    }
  }

  async getAccountInfo(accountId: string): Promise<HederaAccountInfo> {
    try {
      const response = await apiClient.get(`/agreements/test-connection`)
      return response.data.data.accountInfo
    } catch (error) {
      console.error('Error getting account info:', error)
      throw error
    }
  }

  async transferHBAR(toAddress: string, amount: number): Promise<TransferResult> {
    try {
      const response = await apiClient.post('/hedera/transfer', {
        toAddress,
        amount
      })
      return response.data
    } catch (error) {
      console.error('Error transferring HBAR:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transfer failed'
      }
    }
  }

  async getTransactionInfo(transactionId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/agreements/verify/${transactionId}`)
      return response.data.data
    } catch (error) {
      console.error('Error getting transaction info:', error)
      throw error
    }
  }

  /**
   * Create agreement transaction for user to sign
   */
  async createAgreementTransaction(
    agreementHash: string,
    producerAddress: string,
    baseValue: number,
    hectares: number
  ): Promise<HederaTransactionData> {
    try {
      // Create a simple transaction data object without actual Hedera transaction
      const transactionId = `wata-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      return {
        transactionBytes: '', // Empty - we'll use message signing instead
        transactionId: transactionId,
        message: 'Transaction created successfully. User must sign and submit this transaction.'
      }
    } catch (error) {
      console.error('Error creating agreement transaction:', error)
      throw error
    }
  }

  /**
   * Sign transaction with user's wallet
   */
  async signTransaction(transactionData: HederaTransactionData): Promise<string> {
    try {
      // Use MetaMask message signing (simplified approach)
      const signedData = await hederaSignatureService.signMessageWithMetaMask(transactionData)
      return JSON.stringify(signedData)
    } catch (error) {
      console.error('Error signing transaction:', error)
      throw error
    }
  }

  /**
   * Create agreement using system credentials (no user signature required)
   */
  async createAgreement(agreementHash: string, producerAddress: string, baseValue: number, hectares: number, producerName?: string, locationLat?: number, locationLng?: number, durationDays?: number): Promise<{ success: boolean; transactionId?: string; agreementId?: number; error?: string }> {
    try {
      // Send agreement data to backend for processing
      const response = await apiClient.post('/agreements/create-agreement', {
        agreementHash,
        producerAddress,
        baseValue,
        hectares,
        producerName,
        locationLat,
        locationLng,
        durationDays
      })
      
      if (response.data.success) {
        return {
          success: true,
          transactionId: response.data.data.transactionId,
          agreementId: response.data.data.agreementId
        }
      } else {
        return {
          success: false,
          error: response.data.error || 'Unknown error'
        }
      }
    } catch (error) {
      console.error('Error creating agreement:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Check if Hedera Wallet Snap is available
   */
  async isHederaWalletSnapAvailable(): Promise<boolean> {
    return await hederaSignatureService.isHederaWalletSnapAvailable()
  }

  /**
   * Install Hedera Wallet Snap
   */
  async installHederaWalletSnap(): Promise<boolean> {
    return await hederaSignatureService.installHederaWalletSnap()
  }

  getExplorerUrl(transactionId: string): string {
    return `https://hashscan.io/testnet/transaction/${transactionId}`
  }

  getAccountExplorerUrl(accountId: string): string {
    return `https://hashscan.io/testnet/account/${accountId}`
  }
}

export const hederaService = new HederaService()
