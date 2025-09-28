import { useState, useCallback } from 'react'
import { paymentsService } from '../services'
import type { 
  Payment, 
  PaymentStats, 
  PaymentCheckResult, 
  UsePaymentsReturn 
} from '../types'

/**
 * Custom hook for managing payments
 */
export const usePayments = (): UsePaymentsReturn => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAgreementPayments = useCallback(async (agreementId: number): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await paymentsService.getByAgreement(agreementId)
      if (response.success && response.data) {
        setPayments(response.data.payments)
      } else {
        setError('Failed to fetch agreement payments')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPendingPayments = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await paymentsService.getPending()
      if (response.success && response.data) {
        setPayments(response.data.payments)
      } else {
        setError('Failed to fetch pending payments')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const triggerPaymentCheck = useCallback(async (agreementId: number): Promise<PaymentCheckResult | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await paymentsService.triggerCheck(agreementId)
      if (response.success && response.data) {
        return response.data.result
      } else {
        setError('Failed to trigger payment check')
        return null
      }
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const processPayment = useCallback(async (paymentId: number): Promise<any> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await paymentsService.process(paymentId)
      if (response.success) {
        // Update the payment in the list
        setPayments(prev => 
          prev.map(payment => 
            payment.id === paymentId 
              ? { ...payment, status: 'completed' }
              : payment
          )
        )
        return response
      } else {
        setError('Failed to process payment')
        return null
      }
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUserPayments = useCallback(async (userAddress: string): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      const userPayments = await paymentsService.getUserPayments(userAddress)
      setPayments(userPayments)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const getPaymentStats = useCallback(async (): Promise<PaymentStats | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await paymentsService.getStats()
      if (response.success && response.data) {
        return response.data.stats
      } else {
        setError('Failed to fetch payment statistics')
        return null
      }
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getPaymentHistory = useCallback(async (filters: any = {}): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await paymentsService.getHistory(filters)
      if (response.success && response.data) {
        setPayments(response.data.payments)
      } else {
        setError('Failed to fetch payment history')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    payments,
    loading,
    error,
    fetchAgreementPayments,
    fetchPendingPayments,
    triggerPaymentCheck,
    processPayment,
    getPaymentStats,
    getPaymentHistory,
    fetchUserPayments
  }
}
