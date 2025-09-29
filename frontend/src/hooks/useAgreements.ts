import { useState, useEffect, useCallback } from 'react'
import { agreementsService } from '../services'
import { useAuth } from '../contexts/AuthContext'
import { USER_ROLES } from '../utils/constants'
import type { Agreement, CreateAgreementData, Payment, UseAgreementsReturn } from '../types'

/**
 * Custom hook for managing agreements
 */
export const useAgreements = (autoFetch: boolean = true): UseAgreementsReturn => {
  const { user, hasRole } = useAuth()
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAgreements = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      if (hasRole(USER_ROLES.INVESTOR)) {
        const response = await agreementsService.getAll()
        if (response.success && response.data) {
          setAgreements(response.data.agreements || response.data || [])
        } else {
          setError('Failed to fetch agreements')
        }
      } else if (hasRole(USER_ROLES.PRODUCER)) {
        // Producers should use getAgreementsByProducer with their address
        if (user?.address) {
          const response = await agreementsService.getByProducer(user.address)
          if (response.success && response.data) {
            setAgreements(response.data.agreements || [])
          } else {
            setError('Failed to fetch producer agreements')
          }
        } else {
          setError('Producer address not found')
        }
      } else {
        setError('Unauthorized to fetch agreements')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [hasRole])

  const createAgreement = useCallback(async (agreementData: CreateAgreementData): Promise<Agreement | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await agreementsService.create(agreementData)
      if (response.success && response.data) {
        setAgreements(prev => [response.data!.agreement, ...prev])
        return response.data.agreement
      } else {
        setError('Failed to create agreement')
        return null
      }
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getAgreement = useCallback(async (id: number): Promise<Agreement | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await agreementsService.getById(id)
      if (response.success && response.data) {
        return response.data.agreement
      } else {
        setError('Failed to fetch agreement')
        return null
      }
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getAgreementPayments = useCallback(async (agreementId: number): Promise<Payment[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await agreementsService.getPayments(agreementId)
      if (response.success && response.data) {
        return response.data.payments
      } else {
        setError('Failed to fetch agreement payments')
        return []
      }
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const getAgreementsByProducer = useCallback(async (producerAddress: string): Promise<Agreement[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await agreementsService.getByProducer(producerAddress)
      if (response.success && response.data) {
        const agreements = response.data.agreements || []
        setAgreements(agreements)
        return agreements
      } else {
        setError('Failed to fetch producer agreements')
        return []
      }
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const getAllAgreements = useCallback(async (): Promise<Agreement[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await agreementsService.getAll()
      if (response.success && response.data) {
        const agreements = response.data.agreements || response.data || []
        setAgreements(agreements)
        return agreements
      } else {
        setError('Failed to fetch all agreements')
        return []
      }
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    agreements,
    loading,
    error,
    fetchAgreements,
    createAgreement,
    getAgreement,
    getAgreementPayments,
    getAgreementsByProducer,
    getAllAgreements
  }
}
