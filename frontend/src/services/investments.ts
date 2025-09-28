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

  async createInvestmentTransaction(agreementId: number, amount: number, investorAddress: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post<ApiResponse<any>>(`/payments/create-investment-transaction/${agreementId}`, {
        amount,
        investorAddress
      })
      
      return response.data
    } catch (error: any) {
      console.error('Create transaction error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.error || 'Failed to create investment transaction')
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

  async getUserInvestments(userAddress: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(`/payments/user-investments/${userAddress}`)
      
      return response.data
    } catch (error: any) {
      console.error('Error fetching user investments:', error.response?.data || error.message)
      throw new Error(error.response?.data?.error || 'Failed to fetch user investments')
    }
  }
}

export const investmentService = new InvestmentService()
