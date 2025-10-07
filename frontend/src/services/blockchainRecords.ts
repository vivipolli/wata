import apiClient from './api'

export interface BlockchainRecord {
  id: number
  agreementId: number
  amount: number
  status: string
  auditHash: string
  score: number
  timestamp: string
  hcsTransactionId?: string
  hfsFileId?: string
  producerAddress: string
  investorAddress?: string
}

export interface BlockchainRecordsResponse {
  success: boolean
  data?: {
    records: BlockchainRecord[]
    total: number
    page: number
    limit: number
  }
  error?: string
}

class BlockchainRecordsService {
  /**
   * Fetch blockchain records for a specific user
   */
  async getUserRecords(
    userType: 'producer' | 'investor',
    userAddress: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<BlockchainRecordsResponse> {
    try {
      const response = await apiClient.get('/payments/blockchain-records', {
        params: {
          userType,
          userAddress,
          limit,
          offset
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Error fetching blockchain records:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch blockchain records'
      }
    }
  }

  /**
   * Fetch blockchain records for a specific agreement
   */
  async getAgreementRecords(
    agreementId: number,
    limit: number = 20
  ): Promise<BlockchainRecordsResponse> {
    try {
      const response = await apiClient.get(`/api/blockchain/records/agreement/${agreementId}`, {
        params: { limit }
      })
      return response.data
    } catch (error: any) {
      console.error('Error fetching agreement blockchain records:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch agreement blockchain records'
      }
    }
  }

  /**
   * Get blockchain record details by ID
   */
  async getRecordDetails(recordId: number): Promise<{
    success: boolean
    data?: BlockchainRecord
    error?: string
  }> {
    try {
      const response = await apiClient.get(`/api/blockchain/records/${recordId}`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching blockchain record details:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch blockchain record details'
      }
    }
  }

  /**
   * Verify blockchain record authenticity
   */
  async verifyRecord(recordId: number): Promise<{
    success: boolean
    data?: {
      isValid: boolean
      hcsVerified: boolean
      hfsVerified: boolean
      verificationDetails: any
    }
    error?: string
  }> {
    try {
      const response = await apiClient.post(`/api/blockchain/records/${recordId}/verify`)
      return response.data
    } catch (error: any) {
      console.error('Error verifying blockchain record:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to verify blockchain record'
      }
    }
  }

  /**
   * Get blockchain statistics for user
   */
  async getUserStats(userType: 'producer' | 'investor', userAddress: string): Promise<{
    success: boolean
    data?: {
      totalRecords: number
      verifiedRecords: number
      totalHCSRecords: number
      totalHFSRecords: number
      averageScore: number
      totalAmount: number
    }
    error?: string
  }> {
    try {
      const response = await apiClient.get('/api/blockchain/stats', {
        params: { userType, userAddress }
      })
      return response.data
    } catch (error: any) {
      console.error('Error fetching blockchain stats:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch blockchain statistics'
      }
    }
  }
}

export const blockchainRecordsService = new BlockchainRecordsService()
