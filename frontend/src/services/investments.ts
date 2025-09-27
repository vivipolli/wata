import apiClient from './api'
import type { ApiResponse } from '../types'

export interface InvestmentData {
  agreementId: number
  amount: number
  investorAddress: string
}

export interface InvestmentResponse {
  investmentId: number
  agreementId: number
  amount: number
  investorAddress: string
  transactionId: string
  message: string
}

class InvestmentService {
  async contributeToAgreement(agreementId: number, amount: number, investorAddress: string): Promise<ApiResponse<InvestmentResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<InvestmentResponse>>(`/payments/contribute/${agreementId}`, {
        amount,
        investorAddress
      })
      
      return response.data
    } catch (error: any) {
      console.error('Investment error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.error || 'Investment failed')
    }
  }

  async getAgreementInvestments(agreementId: number): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(`/payments/investments/${agreementId}`)
      
      return response.data
    } catch (error: any) {
      console.error('Error fetching investments:', error.response?.data || error.message)
      throw new Error(error.response?.data?.error || 'Failed to fetch investments')
    }
  }
}

export const investmentService = new InvestmentService()
