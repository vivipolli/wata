import apiClient from './api'
import { useContractService } from './wagmiContract'
import { hederaSignatureService } from './hederaSignature'
import type { Agreement, CreateAgreementData, Payment, ApiResponse } from '../types'

/**
 * Agreements Service
 * Handles all agreement-related API calls
 */

export const agreementsService = {
  /**
   * Get all agreements
   */
  async getAll(): Promise<ApiResponse<{ agreements: Agreement[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ agreements: Agreement[] }>>('/agreements')
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch agreements: ${error.message}`)
    }
  },

  /**
   * Get agreement by ID
   */
  async getById(id: number): Promise<ApiResponse<{ agreement: Agreement }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ agreement: Agreement }>>(`/agreements/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch agreement ${id}: ${error.message}`)
    }
  },

  /**
   * Get agreements by producer address
   */
  async getByProducer(producerAddress: string): Promise<ApiResponse<{ agreements: Agreement[], producerAddress: string, totalAgreements: number }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ agreements: Agreement[], producerAddress: string, totalAgreements: number }>>(`/agreements/producer/${encodeURIComponent(producerAddress)}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch agreements for producer ${producerAddress}: ${error.message}`)
    }
  },

  /**
   * Create new agreement with user signature flow
   */
  async create(agreementData: CreateAgreementData): Promise<ApiResponse<{ agreement: Agreement }>> {
    try {
      // Create agreement in database and get transaction for user to sign
      const response = await apiClient.post<ApiResponse<{ agreement: Agreement }>>('/agreements', agreementData)
      
      if (response.data.success && response.data.data) {
        const agreement = response.data.data.agreement || response.data.data
        
        // Check if we have transaction data for user to sign
        if (agreement.transaction_bytes && agreement.transaction_id) {
          // Show user signature modal/interface
          const signedTransaction = await this.promptUserSignature(agreement.transaction_bytes, agreement.transaction_id)
          
          if (signedTransaction) {
            // Submit the signed transaction
            await this.submitSignedTransaction(signedTransaction, agreement.id)
          }
        }
      }
      
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to create agreement: ${error.message}`)
    }
  },

  /**
   * Prompt user to sign Hedera transaction with their wallet
   */
  async promptUserSignature(transactionBytes: string, transactionId: string): Promise<string | null> {
    try {
      // Check if Hedera Wallet Snap is available (preferred for Hedera)
      const isSnapAvailable = await hederaSignatureService.isHederaWalletSnapAvailable()
      
      if (isSnapAvailable) {
        return await this.signWithHederaWalletSnap(transactionBytes, transactionId)
      }
      
      // Fallback to private key signing (for development/testing)
      return await this.signWithPrivateKey(transactionBytes, transactionId)
    } catch (error) {
      console.error('Error signing transaction:', error)
      throw error
    }
  },

  /**
   * Sign Hedera transaction with Hedera Wallet Snap
   */
  async signWithHederaWalletSnap(transactionBytes: string, transactionId: string): Promise<string | null> {
    try {
      const transactionData = {
        transactionBytes,
        transactionId,
        message: 'Sign this Hedera transaction'
      }

      const signedData = await hederaSignatureService.signTransactionWithMetaMask(transactionData)
      
      // Return the signed transaction data as JSON string
      const signedTransactionData = JSON.stringify({
        transactionBytes: signedData.transactionBytes,
        signature: signedData.signature,
        signer: signedData.signer,
        transactionId: signedData.transactionId
      })

      console.log('Transaction signed with Hedera Wallet Snap:', { transactionId })
      return signedTransactionData
    } catch (error) {
      console.error('Hedera Wallet Snap signing error:', error)
      throw error
    }
  },

  /**
   * Sign with private key (fallback for development/testing)
   */
  async signWithPrivateKey(transactionBytes: string, transactionId: string): Promise<string | null> {
    try {
      // For development/testing, prompt user for private key
      const privateKey = prompt('Enter your Hedera private key for signing (development only):')
      
      if (!privateKey) {
        throw new Error('Private key is required for signing')
      }

      const transactionData = {
        transactionBytes,
        transactionId,
        message: 'Sign this Hedera transaction'
      }

      const signedData = await hederaSignatureService.signTransactionWithPrivateKey(transactionData, privateKey)
      
      // Return the signed transaction data as JSON string
      const signedTransactionData = JSON.stringify({
        transactionBytes: signedData.transactionBytes,
        signature: signedData.signature,
        signer: signedData.signer,
        transactionId: signedData.transactionId
      })

      console.log('Transaction signed with private key:', { transactionId })
      return signedTransactionData
    } catch (error) {
      console.error('Private key signing error:', error)
      throw error
    }
  },

  /**
   * Submit signed transaction to backend
   */
  async submitSignedTransaction(signedTransactionBytes: string, agreementId: number): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<{
        agreementId: number
        transactionId: string
        success: boolean
      }>>('/agreements/submit-signed-transaction', {
        signedTransactionBytes,
        agreementId
      })
      
      if (!response.data.success) {
        throw new Error('Failed to submit signed transaction')
      }
    } catch (error: any) {
      throw new Error(`Failed to submit signed transaction: ${error.message}`)
    }
  },

  /**
   * Create agreement hash (same logic as backend)
   */
  createAgreementHash(agreementData: CreateAgreementData): string {
    const data = {
      producerName: agreementData.producerName,
      producerAddress: agreementData.producerAddress,
      baseValue: agreementData.baseValue,
      hectares: agreementData.hectares,
      locationLat: agreementData.locationLat,
      locationLng: agreementData.locationLng,
      durationDays: agreementData.durationDays,
      timestamp: Date.now()
    }

    // Simple hash creation (should match backend logic)
    const dataString = JSON.stringify(data)
    let hash = 0
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0')
  },

  /**
   * Get payments for an agreement
   */
  async getPayments(agreementId: number): Promise<ApiResponse<{ payments: Payment[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ payments: Payment[] }>>(`/agreements/${agreementId}/payments`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch payments for agreement ${agreementId}: ${error.message}`)
    }
  },

  /**
   * Update agreement status
   */
  async update(id: number, updateData: Partial<Agreement>): Promise<ApiResponse<{ agreement: Agreement }>> {
    try {
      const response = await apiClient.put<ApiResponse<{ agreement: Agreement }>>(`/agreements/${id}`, updateData)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to update agreement ${id}: ${error.message}`)
    }
  },

  /**
   * Delete agreement
   */
  async delete(id: number): Promise<ApiResponse<{}>> {
    try {
      const response = await apiClient.delete<ApiResponse<{}>>(`/agreements/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to delete agreement ${id}: ${error.message}`)
    }
  }
}

export default agreementsService
