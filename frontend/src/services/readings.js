import apiClient from './api.js'

/**
 * Readings Service
 * Handles all water quality readings-related API calls
 */

export const readingsService = {
  /**
   * Get recent readings across all agreements
   * @param {number} [limit=20] - Number of readings to fetch
   * @returns {Promise<Object>} Response with readings array
   */
  async getRecent(limit = 20) {
    try {
      const response = await apiClient.get(`/readings/recent?limit=${limit}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch recent readings: ${error.message}`)
    }
  },

  /**
   * Get readings for a specific agreement
   * @param {number} agreementId - Agreement ID
   * @param {number} [limit=50] - Number of readings to fetch
   * @returns {Promise<Object>} Response with readings array
   */
  async getByAgreement(agreementId, limit = 50) {
    try {
      const response = await apiClient.get(`/readings/agreement/${agreementId}?limit=${limit}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch readings for agreement ${agreementId}: ${error.message}`)
    }
  },

  /**
   * Get reading statistics for an agreement
   * @param {number} agreementId - Agreement ID
   * @param {number} [days=7] - Number of days to analyze
   * @returns {Promise<Object>} Response with statistics
   */
  async getStats(agreementId, days = 7) {
    try {
      const response = await apiClient.get(`/readings/agreement/${agreementId}/stats?days=${days}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch reading stats for agreement ${agreementId}: ${error.message}`)
    }
  },

  /**
   * Submit a real reading
   * @param {Object} readingData - Reading data
   * @param {number} readingData.agreementId - Agreement ID
   * @param {number} readingData.turbidityNtu - Turbidity value in NTU
   * @param {number} [readingData.locationLat] - Latitude
   * @param {number} [readingData.locationLng] - Longitude
   * @param {boolean} [readingData.isSimulated=false] - Whether reading is simulated
   * @returns {Promise<Object>} Response with created reading
   */
  async submit(readingData) {
    try {
      const response = await apiClient.post('/readings/submit', readingData)
      return response.data
    } catch (error) {
      throw new Error(`Failed to submit reading: ${error.message}`)
    }
  },

  /**
   * Simulate a reading
   * @param {Object} simulationData - Simulation data
   * @param {number} simulationData.agreementId - Agreement ID
   * @param {number} [simulationData.locationLat] - Latitude
   * @param {number} [simulationData.locationLng] - Longitude
   * @returns {Promise<Object>} Response with simulated reading
   */
  async simulate(simulationData) {
    try {
      const response = await apiClient.post('/readings/simulate', simulationData)
      return response.data
    } catch (error) {
      throw new Error(`Failed to simulate reading: ${error.message}`)
    }
  },

  /**
   * Get readings by date range
   * @param {number} agreementId - Agreement ID
   * @param {string} startDate - Start date (ISO string)
   * @param {string} endDate - End date (ISO string)
   * @returns {Promise<Object>} Response with readings array
   */
  async getByDateRange(agreementId, startDate, endDate) {
    try {
      const response = await apiClient.get(
        `/readings/agreement/${agreementId}?startDate=${startDate}&endDate=${endDate}`
      )
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch readings by date range: ${error.message}`)
    }
  },

  /**
   * Get compliance status for an agreement
   * @param {number} agreementId - Agreement ID
   * @param {number} [threshold=10] - Compliance threshold in NTU
   * @returns {Promise<Object>} Response with compliance status
   */
  async getComplianceStatus(agreementId, threshold = 10) {
    try {
      const stats = await this.getStats(agreementId)
      const isCompliant = stats.stats.averageTurbidity <= threshold
      
      return {
        success: true,
        compliance: {
          isCompliant,
          averageTurbidity: stats.stats.averageTurbidity,
          threshold,
          complianceRate: stats.stats.complianceRate,
          totalReadings: stats.stats.totalReadings
        }
      }
    } catch (error) {
      throw new Error(`Failed to get compliance status: ${error.message}`)
    }
  }
}

export default readingsService
