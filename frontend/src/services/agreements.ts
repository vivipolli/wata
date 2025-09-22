import apiClient from './api'
import type { Agreement, CreateAgreementData, Payment, ApiResponse } from '../types'

/**
 * Agreements Service
 * Handles all agreement-related API calls
 */

export const agreementsService = {
  /**
   * Get all agreements
   */
  async getAll(): Promise<ApiResponse<{ agreements: Agreement[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ agreements: Agreement[] }>>('/agreements')
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch agreements: ${error.message}`)
    }
  },

  /**
   * Get agreement by ID
   */
  async getById(id: number): Promise<ApiResponse<{ agreement: Agreement }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ agreement: Agreement }>>(`/agreements/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch agreement ${id}: ${error.message}`)
    }
  },

  /**
   * Create new agreement
   */
  async create(agreementData: CreateAgreementData): Promise<ApiResponse<{ agreement: Agreement }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ agreement: Agreement }>>('/agreements', agreementData)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to create agreement: ${error.message}`)
    }
  },

  /**
   * Get payments for an agreement
   */
  async getPayments(agreementId: number): Promise<ApiResponse<{ payments: Payment[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ payments: Payment[] }>>(`/agreements/${agreementId}/payments`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch payments for agreement ${agreementId}: ${error.message}`)
    }
  },

  /**
   * Update agreement status
   */
  async update(id: number, updateData: Partial<Agreement>): Promise<ApiResponse<{ agreement: Agreement }>> {
    try {
      const response = await apiClient.put<ApiResponse<{ agreement: Agreement }>>(`/agreements/${id}`, updateData)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to update agreement ${id}: ${error.message}`)
    }
  },

  /**
   * Delete agreement
   */
  async delete(id: number): Promise<ApiResponse<{}>> {
    try {
      const response = await apiClient.delete<ApiResponse<{}>>(`/agreements/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to delete agreement ${id}: ${error.message}`)
    }
  }
}

export default agreementsService
