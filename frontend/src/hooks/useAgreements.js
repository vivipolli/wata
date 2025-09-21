import { useState, useEffect, useCallback } from 'react'
import { agreementsService } from '../services'

/**
 * Custom hook for managing agreements
 */
export const useAgreements = () => {
  const [agreements, setAgreements] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAgreements = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await agreementsService.getAll()
      if (response.success) {
        setAgreements(response.agreements)
      } else {
        setError('Failed to fetch agreements')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const createAgreement = useCallback(async (agreementData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await agreementsService.create(agreementData)
      if (response.success) {
        setAgreements(prev => [response.agreement, ...prev])
        return response.agreement
      } else {
        setError('Failed to create agreement')
        return null
      }
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getAgreement = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await agreementsService.getById(id)
      if (response.success) {
        return response.agreement
      } else {
        setError('Failed to fetch agreement')
        return null
      }
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getAgreementPayments = useCallback(async (agreementId) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await agreementsService.getPayments(agreementId)
      if (response.success) {
        return response.payments
      } else {
        setError('Failed to fetch agreement payments')
        return []
      }
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgreements()
  }, [fetchAgreements])

  return {
    agreements,
    loading,
    error,
    fetchAgreements,
    createAgreement,
    getAgreement,
    getAgreementPayments
  }
}
