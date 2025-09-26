import { useAccount, useSignMessage } from 'wagmi'
import { useWallet } from '../contexts/WalletContext'

export interface TransactionData {
  agreementHash: string
  producerAddress: string
  baseValue: number
  hectares: number
  timestamp: number
}

export interface SignedTransaction {
  transactionData: TransactionData
  signature: string
  signer: string
  timestamp: number
}

class TransactionSignerService {
  /**
   * Sign transaction data with user's wallet
   */
  async signTransaction(transactionData: TransactionData): Promise<SignedTransaction> {
    try {
      // Get the user's wallet
      const wallet = window.ethereum
      if (!wallet) {
        throw new Error('Wallet not found. Please connect your wallet.')
      }

      // Check if wallet is connected
      const accounts = await wallet.request({ method: 'eth_accounts' })
      if (accounts.length === 0) {
        throw new Error('Wallet not connected. Please connect your wallet.')
      }

      const signerAddress = accounts[0]

      // Create message to sign
      const message = this.createSigningMessage(transactionData)
      
      // Sign the message
      const signature = await wallet.request({
        method: 'personal_sign',
        params: [message, signerAddress],
      })

      return {
        transactionData,
        signature,
        signer: signerAddress,
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Error signing transaction:', error)
      throw new Error(`Failed to sign transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create a standardized message for signing
   */
  private createSigningMessage(transactionData: TransactionData): string {
    return `W.A.T.A. Chain Agreement Creation

Agreement Hash: ${transactionData.agreementHash}
Producer Address: ${transactionData.producerAddress}
Base Value: ${transactionData.baseValue} HBAR
Hectares: ${transactionData.hectares}
Timestamp: ${transactionData.timestamp}

By signing this message, you agree to create this PES agreement on the W.A.T.A. Chain blockchain.

Nonce: ${Math.random().toString(36).substring(2, 15)}`
  }

  /**
   * Verify signature (for backend validation)
   */
  async verifySignature(signedTransaction: SignedTransaction): Promise<boolean> {
    try {
      // This would typically be done on the backend
      // For now, we'll just validate the structure
      return !!(
        signedTransaction.transactionData &&
        signedTransaction.signature &&
        signedTransaction.signer &&
        signedTransaction.timestamp
      )
    } catch (error) {
      console.error('Error verifying signature:', error)
      return false
    }
  }

  /**
   * Create transaction data for agreement creation
   */
  createAgreementTransactionData(
    producerName: string,
    producerAddress: string,
    baseValue: number,
    hectares: number,
    locationLat?: number,
    locationLng?: number,
    durationDays?: number
  ): TransactionData {
    // Create agreement hash (same logic as backend)
    const agreementData = {
      producerName,
      producerAddress,
      baseValue,
      hectares,
      locationLat,
      locationLng,
      durationDays,
      timestamp: Date.now()
    }

    const agreementHash = this.createAgreementHash(agreementData)

    return {
      agreementHash,
      producerAddress,
      baseValue,
      hectares,
      timestamp: Date.now()
    }
  }

  /**
   * Create agreement hash (same logic as backend)
   */
  private createAgreementHash(agreementData: any): string {
    // Simple hash creation (should match backend logic)
    const dataString = JSON.stringify(agreementData)
    let hash = 0
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0')
  }
}

export const transactionSignerService = new TransactionSignerService()
