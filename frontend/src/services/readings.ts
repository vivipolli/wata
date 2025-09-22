import apiClient from './api'
import type { 
  Reading, 
  ReadingStats, 
  CreateReadingData, 
  SimulateReadingData, 
  ComplianceStatus,
  ApiResponse 
} from '../types'

/**
 * Readings Service
 * Handles all water quality readings-related API calls
 */

export const readingsService = {
  /**
   * Get recent readings across all agreements
   */
  async getRecent(limit: number = 20): Promise<ApiResponse<{ readings: Reading[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ readings: Reading[] }>>(`/readings/recent?limit=${limit}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch recent readings: ${error.message}`)
    }
  },

  /**
   * Get readings for a specific agreement
   */
  async getByAgreement(agreementId: number, limit: number = 50): Promise<ApiResponse<{ readings: Reading[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ readings: Reading[] }>>(`/readings/agreement/${agreementId}?limit=${limit}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch readings for agreement ${agreementId}: ${error.message}`)
    }
  },

  /**
   * Get reading statistics for an agreement
   */
  async getStats(agreementId: number, days: number = 7): Promise<ApiResponse<{ stats: ReadingStats }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ stats: ReadingStats }>>(`/readings/agreement/${agreementId}/stats?days=${days}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch reading stats for agreement ${agreementId}: ${error.message}`)
    }
  },

  /**
   * Submit a real reading
   */
  async submit(readingData: CreateReadingData): Promise<ApiResponse<{ reading: Reading }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ reading: Reading }>>('/readings/submit', readingData)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to submit reading: ${error.message}`)
    }
  },

  /**
   * Simulate a reading
   */
  async simulate(simulationData: SimulateReadingData): Promise<ApiResponse<{ reading: Reading }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ reading: Reading }>>('/readings/simulate', simulationData)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to simulate reading: ${error.message}`)
    }
  },

  /**
   * Get readings by date range
   */
  async getByDateRange(
    agreementId: number, 
    startDate: string, 
    endDate: string
  ): Promise<ApiResponse<{ readings: Reading[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ readings: Reading[] }>>(
        `/readings/agreement/${agreementId}?startDate=${startDate}&endDate=${endDate}`
      )
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch readings by date range: ${error.message}`)
    }
  },

  /**
   * Get compliance status for an agreement
   */
  async getComplianceStatus(agreementId: number, threshold: number = 10): Promise<ApiResponse<{ compliance: ComplianceStatus }>> {
    try {
      const stats = await this.getStats(agreementId)
      const isCompliant = stats.data!.stats.averageTurbidity <= threshold
      
      return {
        success: true,
        data: {
          compliance: {
            isCompliant,
            averageTurbidity: stats.data!.stats.averageTurbidity,
            threshold,
            complianceRate: stats.data!.stats.complianceRate,
            totalReadings: stats.data!.stats.totalReadings
          }
        }
      }
    } catch (error: any) {
      throw new Error(`Failed to get compliance status: ${error.message}`)
    }
  }
}

export default readingsService
