import apiClient from './api.js'

/**
 * Agreements Service
 * Handles all agreement-related API calls
 */

export const agreementsService = {
  /**
   * Get all agreements
   * @returns {Promise<Object>} Response with agreements array
   */
  async getAll() {
    try {
      const response = await apiClient.get('/agreements')
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch agreements: ${error.message}`)
    }
  },

  /**
   * Get agreement by ID
   * @param {number} id - Agreement ID
   * @returns {Promise<Object>} Response with agreement data
   */
  async getById(id) {
    try {
      const response = await apiClient.get(`/agreements/${id}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch agreement ${id}: ${error.message}`)
    }
  },

  /**
   * Create new agreement
   * @param {Object} agreementData - Agreement data
   * @param {string} agreementData.producerName - Producer name
   * @param {string} agreementData.producerAddress - Producer wallet address
   * @param {number} agreementData.baseValue - Base value in HBAR per hectare
   * @param {number} agreementData.hectares - Area in hectares
   * @param {number} [agreementData.locationLat] - Latitude
   * @param {number} [agreementData.locationLng] - Longitude
   * @param {number} [agreementData.durationDays] - Duration in days
   * @returns {Promise<Object>} Response with created agreement
   */
  async create(agreementData) {
    try {
      const response = await apiClient.post('/agreements', agreementData)
      return response.data
    } catch (error) {
      throw new Error(`Failed to create agreement: ${error.message}`)
    }
  },

  /**
   * Get payments for an agreement
   * @param {number} agreementId - Agreement ID
   * @returns {Promise<Object>} Response with payments array
   */
  async getPayments(agreementId) {
    try {
      const response = await apiClient.get(`/agreements/${agreementId}/payments`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch payments for agreement ${agreementId}: ${error.message}`)
    }
  },

  /**
   * Update agreement status
   * @param {number} id - Agreement ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Response with updated agreement
   */
  async update(id, updateData) {
    try {
      const response = await apiClient.put(`/agreements/${id}`, updateData)
      return response.data
    } catch (error) {
      throw new Error(`Failed to update agreement ${id}: ${error.message}`)
    }
  },

  /**
   * Delete agreement
   * @param {number} id - Agreement ID
   * @returns {Promise<Object>} Response with deletion confirmation
   */
  async delete(id) {
    try {
      const response = await apiClient.delete(`/agreements/${id}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to delete agreement ${id}: ${error.message}`)
    }
  }
}

export default agreementsService
