import apiClient from './api'

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

class HederaService {
  async getAccountBalance(accountId: string): Promise<string> {
    try {
      const response = await apiClient.get(`/hedera/balance/${accountId}`)
      return response.data.balance
    } catch (error) {
      console.error('Error getting account balance:', error)
      throw error
    }
  }

  async getAccountInfo(accountId: string): Promise<HederaAccountInfo> {
    try {
      const response = await apiClient.get(`/hedera/account/${accountId}`)
      return response.data
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
      const response = await apiClient.get(`/hedera/transaction/${transactionId}`)
      return response.data
    } catch (error) {
      console.error('Error getting transaction info:', error)
      throw error
    }
  }

  getExplorerUrl(transactionId: string): string {
    return `https://hashscan.io/testnet/transaction/${transactionId}`
  }

  getAccountExplorerUrl(accountId: string): string {
    return `https://hashscan.io/testnet/account/${accountId}`
  }
}

export const hederaService = new HederaService()
