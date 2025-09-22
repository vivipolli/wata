import apiClient from './api'
import type { HealthData, ApiResponse } from '../types'

/**
 * Health Service
 * Handles system health and status checks
 */

export const healthService = {
  /**
   * Check backend health status
   */
  async checkHealth(): Promise<HealthData> {
    try {
      const response = await apiClient.get<HealthData>('/health')
      return response.data
    } catch (error: any) {
      throw new Error(`Health check failed: ${error.message}`)
    }
  },

  /**
   * Get system status and metrics
   */
  async getSystemStatus(): Promise<HealthData> {
    try {
      const response = await apiClient.get<HealthData>('/health/status')
      return response.data
    } catch (error: any) {
      // Fallback to basic health check if status endpoint doesn't exist
      return await this.checkHealth()
    }
  },

  /**
   * Ping the backend to test connectivity
   */
  async ping(): Promise<boolean> {
    try {
      await apiClient.get('/health', { timeout: 5000 })
      return true
    } catch (error) {
      return false
    }
  }
}

export default healthService
