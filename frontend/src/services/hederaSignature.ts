import {
  Client,
  AccountId,
  PrivateKey,
  ContractFunctionParameters,
  ContractExecuteTransaction,
  Hbar,
  TransactionResponse,
  ContractId,
  TransactionRecord,
  TransactionId
} from '@hashgraph/sdk'

export interface HederaTransactionData {
  transactionBytes: string
  transactionId: string
  message: string
}

export interface SignedTransactionData {
  transactionBytes: string
  signature: string
  signer: string
  transactionId: string
  message?: string
}

export interface HederaSignatureResult {
  success: boolean
  transactionId?: string
  agreementId?: number
  error?: string
}

class HederaSignatureService {
  private client: Client | null = null
  private contractId: ContractId | null = null

  async initialize(): Promise<void> {
    try {
      // Initialize Hedera client for testnet
      this.client = Client.forTestnet()
      
      // Get contract address from environment or use default
      const contractAddress = (import.meta as any).env?.VITE_HEDERA_CONTRACT_ADDRESS || '0.0.5904577'
      
      if (contractAddress.startsWith('0x')) {
        this.contractId = ContractId.fromEvmAddress(0, 0, contractAddress)
      } else {
        this.contractId = ContractId.fromString(contractAddress)
      }

      console.log('Hedera Signature Service initialized')
    } catch (error) {
      console.error('Failed to initialize Hedera Signature Service:', error)
      throw error
    }
  }

  /**
   * Create a transaction for user to sign
   */
  async createAgreementTransaction(
    agreementHash: string,
    producerAddress: string,
    baseValue: number,
    hectares: number
  ): Promise<HederaTransactionData> {
    try {
      if (!this.client || !this.contractId) {
        await this.initialize()
      }

      // Convert Hedera address (0.0.123456) to Ethereum format for contract interaction
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

      // Set a transaction ID for the transaction using a valid testnet account
      // Use a well-known testnet account for transaction ID generation
      const generatedTransactionId = TransactionId.generate(AccountId.fromString('0.0.3'))
      transaction.setTransactionId(generatedTransactionId)

      // Freeze the transaction for user to sign
      const frozenTransaction = await transaction.freezeWith(this.client!)
      const transactionBytes = Buffer.from(frozenTransaction.toBytes()).toString('base64')
      const transactionId = frozenTransaction.transactionId?.toString() || ''

      console.log('Transaction created for user signing:', transactionId)
      
      return {
        transactionBytes,
        transactionId,
        message: 'Transaction created successfully. User must sign and submit this transaction.'
      }
    } catch (error) {
      console.error('Error creating agreement transaction:', error)
      throw error
    }
  }

  /**
   * Sign transaction with MetaMask using Hedera Wallet Snap
   */
  async signTransactionWithMetaMask(transactionData: HederaTransactionData): Promise<SignedTransactionData> {
    try {
      // Check if MetaMask is available
      if (!(window as any).ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask wallet.')
      }

      const ethereum = (window as any).ethereum
      
      // Check if wallet is connected
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      if (accounts.length === 0) {
        throw new Error('MetaMask not connected. Please connect your wallet.')
      }

      // Check if Hedera Wallet Snap is installed
      const snaps = await ethereum.request({ method: 'wallet_getSnaps' })
      if (!snaps['npm:@hashgraph/hedera-wallet-snap']) {
        throw new Error('Hedera Wallet Snap not installed. Please install it from MetaMask.')
      }

      // Force configure the snap to use testnet
      try {
        await ethereum.request({
          method: 'wallet_invokeSnap',
          params: {
            snapId: 'npm:@hashgraph/hedera-wallet-snap',
            request: {
              method: 'setNetwork',
              params: {
                network: 'testnet'
              }
            }
          }
        })
        
        // Wait a bit for the network change to take effect
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Verify network is set to testnet
        const networkInfo = await ethereum.request({
          method: 'wallet_invokeSnap',
          params: {
            snapId: 'npm:@hashgraph/hedera-wallet-snap',
            request: {
              method: 'getNetwork',
              params: {}
            }
          }
        })
        
        console.log('Network configured:', networkInfo)
      } catch (networkError) {
        console.warn('Could not set network, continuing with default:', networkError)
      }

      // Create a Hedera account with explicit testnet configuration
      try {
        const accountResult = await ethereum.request({
          method: 'wallet_invokeSnap',
          params: {
            snapId: 'npm:@hashgraph/hedera-wallet-snap',
            request: {
              method: 'createAccount',
              params: {
                network: 'testnet'
              }
            }
          }
        })
        
        console.log('Account created:', accountResult)
      } catch (accountError) {
        console.warn('Account might already exist or creation failed:', accountError)
        
        // Try to get existing account info
        try {
          const accountInfo = await ethereum.request({
            method: 'wallet_invokeSnap',
            params: {
              snapId: 'npm:@hashgraph/hedera-wallet-snap',
              request: {
                method: 'getAccountInfo',
                params: {}
              }
            }
          })
          console.log('Existing account info:', accountInfo)
        } catch (infoError) {
          console.warn('Could not get account info:', infoError)
        }
      }

      // Use Hedera Wallet Snap to sign the transaction
      const result = await ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId: 'npm:@hashgraph/hedera-wallet-snap',
          request: {
            method: 'signTransaction',
            params: {
              transactionBytes: transactionData.transactionBytes,
              transactionId: transactionData.transactionId
            }
          }
        }
      })

      if (!result || !result.signedTransaction) {
        throw new Error('Transaction was not signed')
      }

      return {
        transactionBytes: result.signedTransaction,
        signature: result.signature,
        signer: accounts[0],
        transactionId: transactionData.transactionId
      }
    } catch (error) {
      console.error('MetaMask signing error:', error)
      throw error
    }
  }

  /**
   * Alternative: Sign with user's private key (for development/testing)
   */
  async signTransactionWithPrivateKey(
    transactionData: HederaTransactionData,
    privateKey: string
  ): Promise<SignedTransactionData> {
    try {
      if (!this.client || !this.contractId) {
        await this.initialize()
      }

      // Parse private key
      const userPrivateKey = privateKey.startsWith('0x') 
        ? PrivateKey.fromString(privateKey.slice(2))
        : PrivateKey.fromString(privateKey)

      // Get user's account ID from private key
      const userAccountId = userPrivateKey.publicKey.toAccountId(0, 0)

      // Convert transaction bytes back to transaction object
      const transactionBytes = Buffer.from(transactionData.transactionBytes, 'base64')
      const transaction = ContractExecuteTransaction.fromBytes(transactionBytes)

      // Sign the transaction with user's private key
      const signedTransaction = await transaction.sign(userPrivateKey)

      // Convert signed transaction back to bytes
      const signedBytes = Buffer.from(signedTransaction.toBytes()).toString('base64')

      return {
        transactionBytes: signedBytes,
        signature: 'signed-with-private-key',
        signer: userAccountId.toString(),
        transactionId: transactionData.transactionId
      }
    } catch (error) {
      console.error('Private key signing error:', error)
      throw error
    }
  }

  /**
   * Sign with MetaMask message signing (simplified approach)
   */
  async signMessageWithMetaMask(transactionData: HederaTransactionData): Promise<SignedTransactionData> {
    try {
      if (!(window as any).ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask wallet.')
      }

      const ethereum = (window as any).ethereum
      
      // Check if wallet is connected
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      if (accounts.length === 0) {
        throw new Error('MetaMask not connected. Please connect your wallet.')
      }

      // Create a message to sign with agreement details
      const message = `WATA Agreement Authorization\n\nTransaction ID: ${transactionData.transactionId}\n\nThis signature authorizes the creation of an agreement on the Hedera network.\n\nTimestamp: ${new Date().toISOString()}`
      
      // Sign the message with MetaMask
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [message, accounts[0]],
      })

      // Return the signature data (backend will handle the actual Hedera transaction)
      return {
        transactionBytes: '', // No actual transaction bytes needed
        signature: signature,
        signer: accounts[0],
        transactionId: transactionData.transactionId,
        message: message
      }
    } catch (error) {
      console.error('MetaMask message signing error:', error)
      throw error
    }
  }

  /**
   * Submit signed transaction to Hedera network
   */
  async submitSignedTransaction(signedData: SignedTransactionData): Promise<HederaSignatureResult> {
    try {
      // Since we're using message signing, we don't execute Hedera transactions in the frontend
      // The backend will handle the actual Hedera transaction execution
      console.log('User signature received:', {
        signer: signedData.signer,
        transactionId: signedData.transactionId,
        message: signedData.message
      })
      
      // Return success - the backend will handle the actual transaction
      return {
        success: true,
        transactionId: signedData.transactionId,
        agreementId: 0 // Will be set by backend
      }
    } catch (error) {
      console.error('Error submitting signed transaction:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Helper function to format strings as bytes32 for Hedera
   */
  private formatBytes32String(str: string): Uint8Array {
    const hash = Buffer.from(str, 'utf8')
    const padded = Buffer.alloc(32)
    hash.copy(padded, 0, 0, Math.min(hash.length, 32))
    return new Uint8Array(padded)
  }

  /**
   * Check if Hedera Wallet Snap is available
   */
  async isHederaWalletSnapAvailable(): Promise<boolean> {
    try {
      if (!(window as any).ethereum) {
        return false
      }

      const ethereum = (window as any).ethereum
      const snaps = await ethereum.request({ method: 'wallet_getSnaps' })
      return !!snaps['npm:@hashgraph/hedera-wallet-snap']
    } catch (error) {
      console.error('Error checking Hedera Wallet Snap:', error)
      return false
    }
  }

  /**
   * Install Hedera Wallet Snap
   */
  async installHederaWalletSnap(): Promise<boolean> {
    try {
      if (!(window as any).ethereum) {
        throw new Error('MetaMask not found')
      }

      const ethereum = (window as any).ethereum
      
      // Install the snap
      await ethereum.request({
        method: 'wallet_requestSnaps',
        params: {
          'npm:@hashgraph/hedera-wallet-snap': {}
        }
      })

      // Wait a bit for installation to complete
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Configure the snap to use testnet immediately after installation
      try {
        await ethereum.request({
          method: 'wallet_invokeSnap',
          params: {
            snapId: 'npm:@hashgraph/hedera-wallet-snap',
            request: {
              method: 'setNetwork',
              params: {
                network: 'testnet'
              }
            }
          }
        })
        
        console.log('Hedera Wallet Snap installed and configured for testnet')
      } catch (configError) {
        console.warn('Could not configure snap after installation:', configError)
      }

      return true
    } catch (error) {
      console.error('Error installing Hedera Wallet Snap:', error)
      return false
    }
  }
}

export const hederaSignatureService = new HederaSignatureService()
export default hederaSignatureService
