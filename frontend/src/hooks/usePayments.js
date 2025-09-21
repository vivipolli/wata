import { useState, useEffect, useCallback } from 'react'
import { paymentsService } from '../services'

/**
 * Custom hook for managing payments
 */
export const usePayments = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAgreementPayments = useCallback(async (agreementId) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await paymentsService.getByAgreement(agreementId)
      if (response.success) {
        setPayments(response.payments)
      } else {
        setError('Failed to fetch agreement payments')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPendingPayments = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await paymentsService.getPending()
      if (response.success) {
        setPayments(response.payments)
      } else {
        setError('Failed to fetch pending payments')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const triggerPaymentCheck = useCallback(async (agreementId) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await paymentsService.triggerCheck(agreementId)
      if (response.success) {
        return response.result
      } else {
        setError('Failed to trigger payment check')
        return null
      }
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const processPayment = useCallback(async (paymentId) => {
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
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getPaymentStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await paymentsService.getStats()
      if (response.success) {
        return response.stats
      } else {
        setError('Failed to fetch payment statistics')
        return null
      }
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getPaymentHistory = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await paymentsService.getHistory(filters)
      if (response.success) {
        setPayments(response.payments)
      } else {
        setError('Failed to fetch payment history')
      }
    } catch (err) {
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
    getPaymentHistory
  }
}
