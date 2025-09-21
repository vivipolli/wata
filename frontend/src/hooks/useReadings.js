import { useState, useEffect, useCallback } from 'react'
import { readingsService } from '../services'

/**
 * Custom hook for managing water quality readings
 */
export const useReadings = () => {
  const [readings, setReadings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchRecentReadings = useCallback(async (limit = 20) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await readingsService.getRecent(limit)
      if (response.success) {
        setReadings(response.readings)
      } else {
        setError('Failed to fetch recent readings')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAgreementReadings = useCallback(async (agreementId, limit = 50) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await readingsService.getByAgreement(agreementId, limit)
      if (response.success) {
        setReadings(response.readings)
      } else {
        setError('Failed to fetch agreement readings')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const getReadingStats = useCallback(async (agreementId, days = 7) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await readingsService.getStats(agreementId, days)
      if (response.success) {
        return response.stats
      } else {
        setError('Failed to fetch reading statistics')
        return null
      }
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const simulateReading = useCallback(async (agreementId, location = null) => {
    setLoading(true)
    setError(null)
    
    try {
      const simulationData = {
        agreementId,
        ...(location && {
          locationLat: location.lat,
          locationLng: location.lng
        })
      }
      
      const response = await readingsService.simulate(simulationData)
      if (response.success) {
        // Add the new reading to the current readings
        setReadings(prev => [response.reading, ...prev])
        return response.reading
      } else {
        setError('Failed to simulate reading')
        return null
      }
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const submitReading = useCallback(async (readingData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await readingsService.submit(readingData)
      if (response.success) {
        // Add the new reading to the current readings
        setReadings(prev => [response.reading, ...prev])
        return response.reading
      } else {
        setError('Failed to submit reading')
        return null
      }
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getComplianceStatus = useCallback(async (agreementId, threshold = 10) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await readingsService.getComplianceStatus(agreementId, threshold)
      if (response.success) {
        return response.compliance
      } else {
        setError('Failed to get compliance status')
        return null
      }
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecentReadings()
  }, [fetchRecentReadings])

  return {
    readings,
    loading,
    error,
    fetchRecentReadings,
    fetchAgreementReadings,
    getReadingStats,
    simulateReading,
    submitReading,
    getComplianceStatus
  }
}
