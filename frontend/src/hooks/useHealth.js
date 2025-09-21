import { useState, useEffect, useCallback } from 'react'
import { healthService } from '../services'

/**
 * Custom hook for system health monitoring
 */
export const useHealth = () => {
  const [isHealthy, setIsHealthy] = useState(false)
  const [healthData, setHealthData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const checkHealth = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await healthService.checkHealth()
      setHealthData(response)
      setIsHealthy(response.status === 'OK')
    } catch (err) {
      setError(err.message)
      setIsHealthy(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const ping = useCallback(async () => {
    try {
      const isReachable = await healthService.ping()
      setIsHealthy(isReachable)
      return isReachable
    } catch (err) {
      setIsHealthy(false)
      return false
    }
  }, [])

  const getSystemStatus = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await healthService.getSystemStatus()
      setHealthData(response)
      setIsHealthy(response.status === 'OK')
      return response
    } catch (err) {
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
