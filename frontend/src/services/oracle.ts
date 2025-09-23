import apiClient from './api'

export interface BatchProcessResult {
  batchId: number
  auditHash: string
  score: number
  validReadings: number
  invalidReadings: number
  transactionHash: string
}

export interface BatchInfo {
  id: number
  agreement_id: number
  audit_hash: string
  oracle_signature: string
  score: number
  readings_count: number
  average_turbidity: number
  median_turbidity: number
  outliers_detected: number
  validation_status: string
  created_at: string
  submitted_at: string
  oracle_address: string
  transaction_hash?: string
}

export interface OracleLog {
  id: number
  batch_id: number
  action: string
  details: string
  oracle_address: string
  timestamp: string
  transaction_hash?: string
  audit_hash?: string
  agreement_id?: number
}

export interface OracleStats {
  pendingBatches: number
  recentValidations: number
  recentSubmissions: number
  successRate: string
  lastActivity: string | null
}

export const oracleService = {
  async processBatch(agreementId: number, hoursBack?: number): Promise<BatchProcessResult> {
    const response = await apiClient.post('/oracle/process', { agreementId, hoursBack })
    return response.data.data
  },

  async processAllBatches(): Promise<{ processed: number; results: BatchProcessResult[]; errors: string[] }> {
    const response = await apiClient.post('/oracle/process-all')
    return response.data.data
  },

  async getBatch(batchId: number): Promise<{ batch: BatchInfo; logs: OracleLog[] }> {
    const response = await apiClient.get(`/oracle/batch/${batchId}`)
    return response.data.data
  },

  async getBatchesByAgreement(agreementId: number, limit?: number): Promise<BatchInfo[]> {
    const params = limit ? { limit } : {}
    const response = await apiClient.get(`/oracle/batches/agreement/${agreementId}`, { params })
    return response.data.data
  },

  async getOracleLogs(limit?: number): Promise<OracleLog[]> {
    const params = limit ? { limit } : {}
    const response = await apiClient.get('/oracle/logs', { params })
    return response.data.data
  },

  async getOracleStats(): Promise<OracleStats> {
    const response = await apiClient.get('/oracle/stats')
    return response.data.data
  }
}
