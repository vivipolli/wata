import apiClient from './api'

export interface BlockchainRecordAgreement {
  id: number
  agreement_hash: string
  producer_name: string
  producer_address: string
  base_value: number
  hectares: number
  location_lat?: number
  location_lng?: number
  duration_days?: number
  created_at: string
  is_active: boolean
  blockchain_id?: number
  transaction_id?: string | null
  total_invested?: number
  total_paid?: number
}

export interface BlockchainRecord {
  id: number
  agreementId: number
  batchId?: number | null
  amount: number
  status: string
  auditHash?: string | null
  score?: number | null
  createdAt: string
  processedAt?: string | null
  transactionHash?: string | null
  hcsTransactionId?: string | null
  hfsFileId?: string | null
  producerAddress?: string | null
  investorAddress?: string | null
  agreement?: BlockchainRecordAgreement | null
}

export interface BlockchainRecordsResponse {
  success: boolean
  data?: {
    records: BlockchainRecord[]
    total: number
    page?: number
    limit?: number
  }
  error?: string
}

const normalizeRecord = (record: any): BlockchainRecord => {
  const agreement = record.agreement ?? null

  const amount = typeof record.amount === 'number' ? record.amount : Number(record.amount || 0)
  const score = typeof record.score === 'number'
    ? record.score
    : typeof record.score === 'string'
      ? Number(record.score)
      : null

  return {
    id: record.id,
    agreementId: record.agreement_id ?? record.agreementId ?? agreement?.id ?? 0,
    batchId: record.batch_id ?? record.batchId ?? null,
    amount,
    status: record.status ?? 'pending',
    auditHash: record.audit_hash ?? record.auditHash ?? null,
    score: Number.isNaN(score) ? null : score,
    createdAt: record.created_at ?? record.timestamp ?? '',
    processedAt: record.processed_at ?? null,
    transactionHash: record.transaction_hash ?? record.transactionHash ?? null,
    hcsTransactionId: record.hcs_transaction_id ?? record.hcsTransactionId ?? null,
    hfsFileId: record.hfs_file_id ?? record.hfsFileId ?? null,
    producerAddress: record.producer_address ?? record.producerAddress ?? agreement?.producer_address ?? null,
    investorAddress: record.investor_address ?? record.investorAddress ?? null,
    agreement
  }
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
      const apiResponse = response.data

      if (apiResponse?.success && apiResponse?.data?.records) {
        const normalizedRecords = apiResponse.data.records.map((record: any) => normalizeRecord(record))
        return {
          success: true,
          data: {
            ...apiResponse.data,
            records: normalizedRecords
          }
        }
      }

      return apiResponse
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
      const apiResponse = response.data

      if (apiResponse?.success && apiResponse?.data?.records) {
        const normalizedRecords = apiResponse.data.records.map((record: any) => normalizeRecord(record))
        return {
          success: true,
          data: {
            ...apiResponse.data,
            records: normalizedRecords
          }
        }
      }

      return apiResponse
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
