import crypto from 'crypto'
import type { SignedTransaction, TransactionData } from '../types'

export class SignatureValidator {
  /**
   * Validate a signed transaction
   */
  static validateSignature(signedTransaction: SignedTransaction): boolean {
    try {
      // Check if all required fields are present
      if (!signedTransaction.transactionData || 
          !signedTransaction.signature || 
          !signedTransaction.signer || 
          !signedTransaction.timestamp) {
        return false
      }

      // Check if signature is not too old (24 hours)
      const now = Date.now()
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      if (now - signedTransaction.timestamp > maxAge) {
        console.warn('Signature is too old:', now - signedTransaction.timestamp)
        return false
      }

      // Validate transaction data structure
      const { transactionData } = signedTransaction
      if (!transactionData.agreementHash || 
          !transactionData.producerAddress || 
          !transactionData.baseValue || 
          !transactionData.hectares) {
        return false
      }

      return true
    } catch (error) {
      console.error('Error validating signature:', error)
      return false
    }
  }

  /**
   * Verify that the signature matches the expected message
   * Note: This is a simplified validation. In production, you would use
   * proper cryptographic signature verification with the user's public key
   */
  static verifySignatureMatch(signedTransaction: SignedTransaction): boolean {
    try {
      // Create the expected message (same as frontend)
      const message = this.createExpectedMessage(signedTransaction.transactionData)
      
      // In a real implementation, you would:
      // 1. Recover the public key from the signature
      // 2. Verify that the public key matches the signer address
      // 3. Verify that the signature is valid for the message
      
      // For now, we'll do basic validation
      return signedTransaction.signature.length > 0 && 
             signedTransaction.signer.length > 0
    } catch (error) {
      console.error('Error verifying signature match:', error)
      return false
    }
  }

  /**
   * Create the expected message for signature verification
   * This should match exactly what the frontend creates
   */
  private static createExpectedMessage(transactionData: TransactionData): string {
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
   * Validate that the signer matches the producer address
   */
  static validateSignerMatch(signedTransaction: SignedTransaction): boolean {
    try {
      // In a real implementation, you would verify that the signer's address
      // matches the producer address or is authorized to sign for that address
      
      // For now, we'll check that the signer is a valid address format
      const signer = signedTransaction.signer
      const producerAddress = signedTransaction.transactionData.producerAddress
      
      // Basic address format validation
      const isValidAddress = (address: string) => {
        return address && address.length > 0 && 
               (address.startsWith('0x') || address.startsWith('0.0.'))
      }
      
      return isValidAddress(signer) && isValidAddress(producerAddress)
    } catch (error) {
      console.error('Error validating signer match:', error)
      return false
    }
  }

  /**
   * Complete signature validation
   */
  static validateCompleteSignature(signedTransaction: SignedTransaction): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Basic structure validation
    if (!this.validateSignature(signedTransaction)) {
      errors.push('Invalid signature structure or expired signature')
    }

    // Signature match validation
    if (!this.verifySignatureMatch(signedTransaction)) {
      errors.push('Signature does not match expected message')
    }

    // Signer match validation
    if (!this.validateSignerMatch(signedTransaction)) {
      errors.push('Signer does not match producer address')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}
