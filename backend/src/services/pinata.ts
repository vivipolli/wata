import PinataSDK from '@pinata/sdk'
import dotenv from 'dotenv'

dotenv.config()

export interface PinataMetadata {
  name: string
  description: string
  image?: string
  external_url?: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
}

export interface PinataUploadResult {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

export class PinataService {
  private pinata: PinataSDK | null = null
  private isInitialized: boolean = false

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    const apiKey = process.env.PINATA_API_KEY
    const apiSecret = process.env.PINATA_API_SECRET

    if (!apiKey || !apiSecret) {
      throw new Error('Pinata API credentials not configured')
    }

    try {
      this.pinata = new PinataSDK({
        pinataApiKey: apiKey,
        pinataSecretApiKey: apiSecret
      })

      // Test connection
      await this.pinata.testAuthentication()
      this.isInitialized = true
      console.log('Pinata service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Pinata service:', error)
      throw error
    }
  }

  async uploadMetadata(metadata: PinataMetadata, fileName?: string): Promise<PinataUploadResult> {
    if (!this.pinata || !this.isInitialized) {
      throw new Error('Pinata service not initialized')
    }

    try {
      const metadataJson = JSON.stringify(metadata, null, 2)
      const buffer = Buffer.from(metadataJson, 'utf-8')

      const options = {
        pinataMetadata: {
          name: fileName || `wata-certificate-${Date.now()}.json`
        },
        pinataOptions: {
          cidVersion: 0 as const
        }
      }

      const result = await this.pinata.pinFileToIPFS(buffer, options)
      
      console.log(`Metadata uploaded to Pinata: ${result.IpfsHash}`)
      return result
    } catch (error) {
      console.error('Failed to upload metadata to Pinata:', error)
      throw error
    }
  }

  async uploadFile(fileBuffer: Buffer, fileName: string, metadata?: any): Promise<PinataUploadResult> {
    if (!this.pinata || !this.isInitialized) {
      throw new Error('Pinata service not initialized')
    }

    try {
      const options = {
        pinataMetadata: {
          name: fileName
        },
        pinataOptions: {
          cidVersion: 0 as const
        }
      }

      const result = await this.pinata.pinFileToIPFS(fileBuffer, options)
      
      console.log(`File uploaded to Pinata: ${result.IpfsHash}`)
      return result
    } catch (error) {
      console.error('Failed to upload file to Pinata:', error)
      throw error
    }
  }

  getGatewayUrl(ipfsHash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
  }

  getPublicGatewayUrl(ipfsHash: string): string {
    return `https://ipfs.io/ipfs/${ipfsHash}`
  }

  async getFileList(): Promise<any[]> {
    if (!this.pinata || !this.isInitialized) {
      throw new Error('Pinata service not initialized')
    }

    try {
      const result = await this.pinata.pinList({
        status: 'pinned',
        pageLimit: 100
      })
      return result.rows
    } catch (error) {
      console.error('Failed to get file list from Pinata:', error)
      throw error
    }
  }

  async unpinFile(ipfsHash: string): Promise<boolean> {
    if (!this.pinata || !this.isInitialized) {
      throw new Error('Pinata service not initialized')
    }

    try {
      await this.pinata.unpin(ipfsHash)
      console.log(`File unpinned from Pinata: ${ipfsHash}`)
      return true
    } catch (error) {
      console.error('Failed to unpin file from Pinata:', error)
      return false
    }
  }
}

export const pinataService = new PinataService()
