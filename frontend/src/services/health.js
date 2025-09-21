import apiClient from './api.js'

/**
 * Health Service
 * Handles system health and status checks
 */

export const healthService = {
  /**
   * Check backend health status
   * @returns {Promise<Object>} Response with health status
   */
  async checkHealth() {
    try {
      const response = await apiClient.get('/health')
      return response.data
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`)
    }
  },

  /**
   * Get system status and metrics
   * @returns {Promise<Object>} Response with system metrics
   */
  async getSystemStatus() {
    try {
      const response = await apiClient.get('/health/status')
      return response.data
    } catch (error) {
      // Fallback to basic health check if status endpoint doesn't exist
      return await this.checkHealth()
    }
  },

  /**
   * Ping the backend to test connectivity
   * @returns {Promise<boolean>} True if backend is reachable
   */
  async ping() {
    try {
      await apiClient.get('/health', { timeout: 5000 })
      return true
    } catch (error) {
      return false
    }
  }
}

export default healthService
