import apiClient from './api.js'

/**
 * Payments Service
 * Handles all payment-related API calls
 */

export const paymentsService = {
  /**
   * Trigger payment check for an agreement
   * @param {number} agreementId - Agreement ID
   * @returns {Promise<Object>} Response with payment check result
   */
  async triggerCheck(agreementId) {
    try {
      const response = await apiClient.post(`/payments/trigger-check/${agreementId}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to trigger payment check for agreement ${agreementId}: ${error.message}`)
    }
  },

  /**
   * Get payments for an agreement
   * @param {number} agreementId - Agreement ID
   * @returns {Promise<Object>} Response with payments array
   */
  async getByAgreement(agreementId) {
    try {
      const response = await apiClient.get(`/payments/agreement/${agreementId}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch payments for agreement ${agreementId}: ${error.message}`)
    }
  },

  /**
   * Get all pending payments
   * @returns {Promise<Object>} Response with pending payments array
   */
  async getPending() {
    try {
      const response = await apiClient.get('/payments/pending')
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch pending payments: ${error.message}`)
    }
  },

  /**
   * Process a payment manually (for testing)
   * @param {number} paymentId - Payment ID
   * @returns {Promise<Object>} Response with processing result
   */
  async process(paymentId) {
    try {
      const response = await apiClient.post(`/payments/process/${paymentId}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to process payment ${paymentId}: ${error.message}`)
    }
  },

  /**
   * Get payment statistics
   * @returns {Promise<Object>} Response with payment statistics
   */
  async getStats() {
    try {
      const response = await apiClient.get('/payments/stats')
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch payment statistics: ${error.message}`)
    }
  },

  /**
   * Get payment by ID
   * @param {number} paymentId - Payment ID
   * @returns {Promise<Object>} Response with payment data
   */
  async getById(paymentId) {
    try {
      const response = await apiClient.get(`/payments/${paymentId}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch payment ${paymentId}: ${error.message}`)
    }
  },

  /**
   * Get payment history with filters
   * @param {Object} filters - Filter options
   * @param {string} [filters.status] - Payment status filter
   * @param {string} [filters.startDate] - Start date filter
   * @param {string} [filters.endDate] - End date filter
   * @param {number} [filters.limit=50] - Number of payments to fetch
   * @returns {Promise<Object>} Response with filtered payments
   */
  async getHistory(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.limit) params.append('limit', filters.limit)
      
      const response = await apiClient.get(`/payments/history?${params.toString()}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch payment history: ${error.message}`)
    }
  }
}

export default paymentsService
