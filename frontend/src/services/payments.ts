import apiClient from './api'
import type { 
  Payment, 
  PaymentStats, 
  PaymentCheckResult,
  ApiResponse 
} from '../types'

/**
 * Payments Service
 * Handles all payment-related API calls
 */

interface PaymentHistoryFilters {
  status?: string
  startDate?: string
  endDate?: string
  limit?: number
}

export const paymentsService = {
  /**
   * Trigger payment check for an agreement
   */
  async triggerCheck(agreementId: number): Promise<ApiResponse<{ result: PaymentCheckResult }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ result: PaymentCheckResult }>>(`/payments/trigger-check/${agreementId}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to trigger payment check for agreement ${agreementId}: ${error.message}`)
    }
  },

  /**
   * Get payments for an agreement
   */
  async getByAgreement(agreementId: number): Promise<ApiResponse<{ payments: Payment[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<Payment[]>>(`/payments/agreement/${agreementId}`)
      // Backend returns data directly, not wrapped in payments
      return {
        success: response.data.success,
        data: { payments: response.data.data || [] },
        error: response.data.error,
        message: response.data.message
      }
    } catch (error: any) {
      throw new Error(`Failed to fetch payments for agreement ${agreementId}: ${error.message}`)
    }
  },

  /**
   * Get all pending payments
   */
  async getPending(): Promise<ApiResponse<{ payments: Payment[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ payments: Payment[] }>>('/payments/pending')
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch pending payments: ${error.message}`)
    }
  },

  /**
   * Process a payment manually (for testing)
   */
  async process(paymentId: number): Promise<ApiResponse<{}>> {
    try {
      const response = await apiClient.post<ApiResponse<{}>>(`/payments/process/${paymentId}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to process payment ${paymentId}: ${error.message}`)
    }
  },

  /**
   * Get payment statistics
   */
  async getStats(): Promise<ApiResponse<{ stats: PaymentStats }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ stats: PaymentStats }>>('/payments/stats')
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch payment statistics: ${error.message}`)
    }
  },

  /**
   * Get payment by ID
   */
  async getById(paymentId: number): Promise<ApiResponse<{ payment: Payment }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ payment: Payment }>>(`/payments/${paymentId}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch payment ${paymentId}: ${error.message}`)
    }
  },

  /**
   * Get payment history with filters
   */
  async getHistory(filters: PaymentHistoryFilters = {}): Promise<ApiResponse<{ payments: Payment[] }>> {
    try {
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.limit) params.append('limit', filters.limit.toString())
      
      const response = await apiClient.get<ApiResponse<{ payments: Payment[] }>>(`/payments/history?${params.toString()}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch payment history: ${error.message}`)
    }
  },

  /**
   * Get payment history (alias for getHistory)
   */
  async getPaymentHistory(): Promise<Payment[]> {
    try {
      const response = await this.getHistory({ limit: 50 })
      return response.data?.payments || []
    } catch (error: any) {
      throw new Error(`Failed to fetch payment history: ${error.message}`)
    }
  },

  /**
   * Get payments by user address (for producers)
   */
  async getUserPayments(userAddress: string, filters?: PaymentFilters): Promise<Payment[]> {
    try {
      const params = new URLSearchParams()
      
      if (filters?.status) params.append('status', filters.status)
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      if (filters?.limit) params.append('limit', filters.limit.toString())
      
      const response = await apiClient.get<ApiResponse<{ payments: Payment[] }>>(`/payments/user-payments/${userAddress}?${params.toString()}`)
      return response.data?.payments || []
    } catch (error: any) {
      throw new Error(`Failed to fetch user payments: ${error.message}`)
    }
  },

  /**
   * Get payments for an agreement (alias for getByAgreement)
   */
  async getAgreementPayments(agreementId: number): Promise<Payment[]> {
    try {
      const response = await this.getByAgreement(agreementId)
      return response.data?.payments || []
    } catch (error: any) {
      throw new Error(`Failed to fetch payments for agreement ${agreementId}: ${error.message}`)
    }
  }
}

export default paymentsService
