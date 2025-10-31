import apiClient from './api'
import type { NFTPendingInfo } from '../types'

interface CheckAssociationResponse {
  success: boolean
  isAssociated: boolean
  error?: string
}

interface ClaimNFTResponse {
  success: boolean
  transactionId?: string
  error?: string
}

interface AssociateTokenResponse {
  success: boolean
  transactionId?: string
  error?: string
}

class NFTService {
  async checkTokenAssociation(accountId: string, tokenId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<CheckAssociationResponse>(
        `/nft/check-association/${accountId}/${tokenId}`
      )
      return response.data?.isAssociated ?? false
    } catch (error) {
      console.error('Error checking token association:', error)
      return false
    }
  }

  async claimNFT(serialNumber: number, userAddress: string): Promise<ClaimNFTResponse> {
    try {
      const response = await apiClient.post<ClaimNFTResponse>(
        `/nft/claim/${serialNumber}`,
        { userAddress }
      )
      return response.data ?? { success: false, error: 'Unknown error' }
    } catch (error: any) {
      console.error('Error claiming NFT:', error)
      return {
        success: false,
        error: error.response?.data?.error ?? error.message ?? 'Failed to claim NFT'
      }
    }
  }

  async getPendingNFTs(userAddress: string): Promise<NFTPendingInfo[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: NFTPendingInfo[] }>(
        `/nft/pending/${userAddress}`
      )
      return response.data?.data ?? []
    } catch (error) {
      console.error('Error fetching pending NFTs:', error)
      return []
    }
  }

  getHederaNFTUrl(tokenId: string, serialNumber: number): string {
    return `https://hashscan.io/testnet/token/${tokenId}/${serialNumber}`
  }

  getMetadataUrl(ipfsHash: string): string {
    if (ipfsHash.startsWith('http')) {
      return ipfsHash
    }
    if (ipfsHash.startsWith('ipfs://')) {
      const hash = ipfsHash.replace('ipfs://', '')
      return `https://gateway.pinata.cloud/ipfs/${hash}`
    }
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
  }
}

export const nftService = new NFTService()
export default nftService

