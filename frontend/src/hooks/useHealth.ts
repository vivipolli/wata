import { useState, useEffect, useCallback } from 'react'
import { healthService } from '../services'
import type { HealthData, UseHealthReturn } from '../types'

/**
 * Custom hook for system health monitoring
 */
export const useHealth = (): UseHealthReturn => {
  const [isHealthy, setIsHealthy] = useState<boolean>(false)
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const checkHealth = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await healthService.checkHealth()
      setHealthData(response)
      setIsHealthy(response.status === 'OK')
    } catch (err: any) {
      setError(err.message)
      setIsHealthy(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const ping = useCallback(async (): Promise<boolean> => {
    try {
      const isReachable = await healthService.ping()
      setIsHealthy(isReachable)
      return isReachable
    } catch (err: any) {
      setIsHealthy(false)
      return false
    }
  }, [])

  const getSystemStatus = useCallback(async (): Promise<HealthData | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await healthService.getSystemStatus()
      setHealthData(response)
      setIsHealthy(response.status === 'OK')
      return response
    } catch (err: any) {
      setError(err.message)
      setIsHealthy(false)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-check health on mount and periodically
  useEffect(() => {
    checkHealth()
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000)
    
    return () => clearInterval(interval)
  }, [checkHealth])

  return {
    isHealthy,
    healthData,
    loading,
    error,
    checkHealth,
    ping,
    getSystemStatus
  }
}
