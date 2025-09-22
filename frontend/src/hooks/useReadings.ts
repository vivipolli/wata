import { useState, useEffect, useCallback } from 'react'
import { readingsService } from '../services'
import type { 
  Reading, 
  ReadingStats, 
  CreateReadingData, 
  ComplianceStatus, 
  Location, 
  UseReadingsReturn 
} from '../types'

/**
 * Custom hook for managing water quality readings
 */
export const useReadings = (): UseReadingsReturn => {
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecentReadings = useCallback(async (limit: number = 20): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await readingsService.getRecent(limit)
      if (response.success && response.data) {
        setReadings(response.data.readings || response.data || [])
      } else {
        setError('Failed to fetch recent readings')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAgreementReadings = useCallback(async (agreementId: number, limit: number = 50): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await readingsService.getByAgreement(agreementId, limit)
      if (response.success && response.data) {
        setReadings(response.data.readings || response.data || [])
      } else {
        setError('Failed to fetch agreement readings')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const getReadingStats = useCallback(async (agreementId: number, days: number = 7): Promise<ReadingStats | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await readingsService.getStats(agreementId, days)
      if (response.success && response.data) {
        return response.data.stats
      } else {
        setError('Failed to fetch reading statistics')
        return null
      }
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const simulateReading = useCallback(async (agreementId: number, location?: Location): Promise<Reading | null> => {
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
      if (response.success && response.data) {
        // Add the new reading to the current readings
        setReadings(prev => [response.data!.reading, ...prev])
        return response.data.reading
      } else {
        setError('Failed to simulate reading')
        return null
      }
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const submitReading = useCallback(async (readingData: CreateReadingData): Promise<Reading | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await readingsService.submit(readingData)
      if (response.success && response.data) {
        // Add the new reading to the current readings
        setReadings(prev => [response.data!.reading, ...prev])
        return response.data.reading
      } else {
        setError('Failed to submit reading')
        return null
      }
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getComplianceStatus = useCallback(async (agreementId: number, threshold: number = 10): Promise<ComplianceStatus | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await readingsService.getComplianceStatus(agreementId, threshold)
      if (response.success && response.data) {
        return response.data.compliance
      } else {
        setError('Failed to get compliance status')
        return null
      }
    } catch (err: any) {
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
