import {
  AccountId,
  AccountInfoQuery,
  Client,
  Hbar,
  PrivateKey,
  TokenId,
  TokenMintTransaction,
  TransferTransaction
} from '@hashgraph/sdk'
import dotenv from 'dotenv'
import { pinataService, type PinataMetadata } from './pinata'

dotenv.config()

export interface MintCertificateParams {
  agreementId: number
  paymentAmount: number
  producerAddress: string
  auditHash: string
  score: number
  paymentTransactionHash?: string
  hcsTransactionId?: string
  hfsFileId?: string
}

export interface MintCertificateResult {
  tokenId: string
  serialNumber: number
  metadata: string
  metadataUri: string
  transactionId: string
}

export interface MintDualCertificatesParams extends MintCertificateParams {
  investorAddress: string
  batchData?: {
    readingsCount: number
    averageTurbidity: number
    medianTurbidity?: number
  }
}

export interface DualCertificateResult {
  producer: MintCertificateResult
  investor: MintCertificateResult
}

export class NftService {
  private client: Client | null = null
  private operatorId: AccountId | null = null
  private operatorKey: PrivateKey | null = null
  private tokenId: TokenId | null = null
  private metadataBaseUri: string | null = null

  async initialize(): Promise<void> {
    if (this.client) {
      return
    }

    const accountId = process.env.HEDERA_ACCOUNT_ID
    const privateKey = process.env.HEDERA_PRIVATE_KEY
    const tokenId = process.env.NFT_CERTIFICATION_TOKEN_ID

    if (!accountId || !privateKey) {
      throw new Error('Missing Hedera operator credentials for NFT service')
    }

    if (!tokenId) {
      console.warn('NFT_CERTIFICATION_TOKEN_ID not set - NFT minting will be disabled')
      return
    }

    try {
      const tokenIdObject = TokenId.fromString(tokenId)
      this.tokenId = tokenIdObject
    } catch (error) {
      console.warn('Invalid NFT_CERTIFICATION_TOKEN_ID - NFT minting will be disabled:', error.message)
      return
    }

    this.operatorId = AccountId.fromString(accountId)
    
    // Try ECDSA first (for EVM-compatible accounts), then ED25519
    try {
      this.operatorKey = PrivateKey.fromStringECDSA(privateKey)
      console.log('NFT Service: Using ECDSA key')
    } catch {
      try {
        this.operatorKey = privateKey.startsWith('0x')
          ? PrivateKey.fromStringED25519(privateKey)
          : PrivateKey.fromString(privateKey)
        console.log('NFT Service: Using ED25519 key')
      } catch (error) {
        throw new Error('Invalid private key format')
      }
    }

    this.client = Client.forTestnet().setOperator(this.operatorId, this.operatorKey)
    this.metadataBaseUri = process.env.NFT_CERT_METADATA_BASE_URI || null

    // Initialize Pinata service
    await pinataService.initialize()
  }

  async mintCertificate(params: MintCertificateParams): Promise<MintCertificateResult> {
    if (!this.client || !this.operatorId || !this.operatorKey || !this.tokenId) {
      throw new Error('NFT service not initialized')
    }

    try {
      // Upload metadata to Pinata first
      const metadata = this.buildPinataMetadata(params)
      const pinataResult = await pinataService.uploadMetadata(
        metadata,
        `wata-certificate-${params.agreementId}-${Date.now()}.json`
      )

      const metadataUri = pinataService.getGatewayUrl(pinataResult.IpfsHash)

      // Mint NFT with metadata URI
      const mintTx = new TokenMintTransaction()
        .setTokenId(this.tokenId)
        .setMaxTransactionFee(new Hbar(5))
        .addMetadata(Buffer.from(metadataUri, 'utf-8'))

      const response = await mintTx.execute(this.client)
      const receipt = await response.getReceipt(this.client)

      const serial = receipt.serials?.[0]

      if (!serial) {
        throw new Error('NFT mint transaction did not return a serial number')
      }

      return {
        tokenId: this.tokenId.toString(),
        serialNumber: serial.toNumber(),
        metadata: JSON.stringify(metadata),
        metadataUri,
        transactionId: response.transactionId.toString()
      }
    } catch (error) {
      console.error('Error minting NFT certificate:', error)
      throw error
    }
  }

  private buildPinataMetadata(params: MintCertificateParams): PinataMetadata {
    return {
      name: `WATA Certificate #${params.agreementId}`,
      description: `Water Quality Certification for Agreement ${params.agreementId}. This NFT certifies that the producer has successfully maintained water quality standards and received payment for environmental services.`,
      external_url: this.metadataBaseUri || 'https://wata-chain.com',
      attributes: [
        {
          trait_type: 'Agreement ID',
          value: params.agreementId
        },
        {
          trait_type: 'Payment Amount',
          value: `${params.paymentAmount} HBAR`
        },
        {
          trait_type: 'Producer Address',
          value: params.producerAddress
        },
        {
          trait_type: 'Audit Hash',
          value: params.auditHash
        },
        {
          trait_type: 'Quality Score',
          value: `${(params.score * 100).toFixed(1)}%`
        },
        {
          trait_type: 'Payment Transaction',
          value: params.paymentTransactionHash || 'N/A'
        },
        {
          trait_type: 'HCS Transaction',
          value: params.hcsTransactionId || 'N/A'
        },
        {
          trait_type: 'HFS File',
          value: params.hfsFileId || 'N/A'
        },
        {
          trait_type: 'Issued At',
          value: new Date().toISOString()
        },
        {
          trait_type: 'Platform',
          value: 'WATA Chain'
        },
        {
          trait_type: 'Certificate Type',
          value: 'Water Quality PES'
        }
      ]
    }
  }

  private buildMetadata(params: MintCertificateParams): string {
    const metadata = {
      type: 'WATA_CERTIFICATE',
      version: '1.0.0',
      agreementId: params.agreementId,
      payment: {
        amount: params.paymentAmount,
        currency: 'HBAR',
        transactionHash: params.paymentTransactionHash || null
      },
      producerAddress: params.producerAddress,
      auditHash: params.auditHash,
      score: params.score,
      ledgerReferences: {
        hcsTransactionId: params.hcsTransactionId || null,
        hfsFileId: params.hfsFileId || null,
        metadataBaseUri: this.metadataBaseUri
      },
      issuedAt: new Date().toISOString()
    }

    return JSON.stringify(metadata)
  }

  async mintDualCertificates(params: MintDualCertificatesParams): Promise<DualCertificateResult & { 
    producerTransferResult?: {success: boolean; transactionId?: string; error?: string}
    investorTransferResult?: {success: boolean; transactionId?: string; error?: string}
  }> {
    if (!this.client || !this.tokenId) {
      throw new Error('NFT service not initialized')
    }

    const producerMetadata = this.buildProducerMetadata(params)
    const producerResult = await this.mintSingleCertificate(producerMetadata, params.agreementId, 'producer')

    const investorMetadata = this.buildInvestorMetadata(params)
    const investorResult = await this.mintSingleCertificate(investorMetadata, params.agreementId, 'investor')

    let producerTransferResult
    let investorTransferResult

    try {
      console.log(`🔄 Attempting to transfer producer NFT to ${params.producerAddress}...`)
      producerTransferResult = await this.transferNFT(
        producerResult.tokenId,
        producerResult.serialNumber,
        params.producerAddress,
        `WATA Producer Certificate - Agreement #${params.agreementId}`
      )

      if (producerTransferResult.success) {
        console.log(`✅ Producer NFT transferred successfully!`)
      } else {
        console.warn(`⚠️ Producer NFT transfer failed: ${producerTransferResult.error}`)
        console.warn(`NFT remains in treasury. User can claim later via /api/nft/claim endpoint.`)
      }
    } catch (error) {
      console.error('Error during producer NFT transfer:', error)
      producerTransferResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Transfer failed'
      }
    }

    if (params.investorAddress) {
      try {
        console.log(`🔄 [FUTURE] Investor NFT transfer prepared for ${params.investorAddress}`)
        console.log(`⏸️ Investor transfer currently disabled - will be implemented in future`)
        investorTransferResult = {
          success: false,
          error: 'Investor NFT transfer not yet implemented. NFT remains in treasury.'
        }
      } catch (error) {
        console.error('Error during investor NFT transfer:', error)
        investorTransferResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Transfer failed'
        }
      }
    }

    return {
      producer: producerResult,
      investor: investorResult,
      producerTransferResult,
      investorTransferResult
    }
  }

  private buildProducerMetadata(params: MintDualCertificatesParams): PinataMetadata {
    return {
      name: `WATA Producer Certificate #${params.agreementId}`,
      description: `Environmental services certificate for water quality maintenance. This NFT certifies the producer's successful environmental stewardship and received payment for ecosystem services.`,
      external_url: this.metadataBaseUri || 'https://wata-chain.com',
      attributes: [
        {
          trait_type: 'Certificate Type',
          value: 'Producer - Environmental'
        },
        {
          trait_type: 'Agreement ID',
          value: params.agreementId
        },
        {
          trait_type: 'Quality Score',
          value: `${(params.score * 100).toFixed(1)}%`
        },
        {
          trait_type: 'Payment Received',
          value: `${params.paymentAmount} HBAR`
        },
        {
          trait_type: 'Audit Hash',
          value: params.auditHash
        },
        {
          trait_type: 'Readings Count',
          value: params.batchData?.readingsCount || 0
        },
        {
          trait_type: 'Avg Turbidity (NTU)',
          value: params.batchData?.averageTurbidity || 0
        },
        {
          trait_type: 'HCS Transaction',
          value: params.hcsTransactionId || 'N/A'
        },
        {
          trait_type: 'HFS File',
          value: params.hfsFileId || 'N/A'
        },
        {
          trait_type: 'Issued At',
          value: new Date().toISOString()
        },
        {
          trait_type: 'Platform',
          value: 'WATA Chain'
        },
        {
          trait_type: 'Transferable',
          value: 'No (Soulbound)'
        }
      ]
    }
  }

  private buildInvestorMetadata(params: MintDualCertificatesParams): PinataMetadata {
    return {
      name: `WATA Investor Certificate #${params.agreementId}`,
      description: `Impact certificate for Payment for Ecosystem Services investment. This NFT represents financial contribution to water quality preservation and environmental impact.`,
      external_url: this.metadataBaseUri || 'https://wata-chain.com',
      attributes: [
        {
          trait_type: 'Certificate Type',
          value: 'Investor - Financial Impact'
        },
        {
          trait_type: 'Agreement ID',
          value: params.agreementId
        },
        {
          trait_type: 'Payment Disbursed',
          value: `${params.paymentAmount} HBAR`
        },
        {
          trait_type: 'Quality Score',
          value: `${(params.score * 100).toFixed(1)}%`
        },
        {
          trait_type: 'Audit Hash',
          value: params.auditHash
        },
        {
          trait_type: 'Environmental Impact',
          value: 'Water Quality Preservation'
        },
        {
          trait_type: 'Producer',
          value: params.producerAddress
        },
        {
          trait_type: 'HCS Transaction',
          value: params.hcsTransactionId || 'N/A'
        },
        {
          trait_type: 'Issued At',
          value: new Date().toISOString()
        },
        {
          trait_type: 'Platform',
          value: 'WATA Chain'
        },
        {
          trait_type: 'Transferable',
          value: 'No (Soulbound)'
        }
      ]
    }
  }

  private async mintSingleCertificate(
    metadata: PinataMetadata,
    agreementId: number,
    type: 'producer' | 'investor'
  ): Promise<MintCertificateResult> {
    try {
      let metadataUri: string

      try {
        const pinataResult = await pinataService.uploadMetadata(
          metadata,
          `wata-${type}-cert-${agreementId}-${Date.now()}.json`
        )
        metadataUri = pinataService.getGatewayUrl(pinataResult.IpfsHash)
      } catch (pinataError) {
        console.error('Pinata upload failed:', pinataError)
        throw pinataError
      }

      const mintTx = new TokenMintTransaction()
        .setTokenId(this.tokenId!)
        .setMaxTransactionFee(new Hbar(5))
        .addMetadata(Buffer.from(metadataUri, 'utf-8'))

      const response = await mintTx.execute(this.client!)
      const receipt = await response.getReceipt(this.client!)
      const serial = receipt.serials?.[0]

      if (!serial) {
        throw new Error('NFT mint transaction did not return a serial number')
      }

      return {
        tokenId: this.tokenId!.toString(),
        serialNumber: serial.toNumber(),
        metadata: JSON.stringify(metadata),
        metadataUri,
        transactionId: response.transactionId.toString()
      }
    } catch (error) {
      console.error(`Error minting ${type} NFT certificate:`, error)
      throw error
    }
  }

  async checkTokenAssociation(accountId: string, tokenId: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('NFT service not initialized')
    }

    try {
      const accountInfo = await new AccountInfoQuery()
        .setAccountId(AccountId.fromString(accountId))
        .execute(this.client)

      const tokens = accountInfo.tokenRelationships
      const targetTokenId = TokenId.fromString(tokenId)
      
      if (!tokens) return false
      
      for (const [token] of tokens) {
        if (token.toString() === targetTokenId.toString()) {
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error('Error checking token association:', error)
      return false
    }
  }

  async transferNFT(
    tokenId: string,
    serialNumber: number,
    toAccount: string,
    memo?: string
  ): Promise<{success: boolean; transactionId?: string; error?: string}> {
    if (!this.client || !this.operatorId) {
      throw new Error('NFT service not initialized')
    }

    try {
      // Check if trying to transfer to the same account (treasury)
      if (toAccount === this.operatorId.toString()) {
        console.log(`NFT ${serialNumber} already in treasury account ${toAccount} - marking as received`)
        return {
          success: true,
          transactionId: 'ALREADY_IN_TREASURY',
          error: undefined
        }
      }

      const isAssociated = await this.checkTokenAssociation(toAccount, tokenId)
      
      if (!isAssociated) {
        return {
          success: false,
          error: `Account ${toAccount} has not associated token ${tokenId}. User must associate token first.`
        }
      }

      const transferTx = new TransferTransaction()
        .addNftTransfer(
          TokenId.fromString(tokenId),
          serialNumber,
          this.operatorId,
          AccountId.fromString(toAccount)
        )
        .setTransactionMemo(memo || `WATA NFT Certificate #${serialNumber}`)
        .setMaxTransactionFee(new Hbar(1))

      const response = await transferTx.execute(this.client)
      const receipt = await response.getReceipt(this.client)

      console.log(`✅ NFT transferred successfully: Token ${tokenId}, Serial ${serialNumber} -> ${toAccount}`)

      return {
        success: true,
        transactionId: response.transactionId.toString()
      }
    } catch (error) {
      console.error('Error transferring NFT:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transfer failed'
      }
    }
  }
}

