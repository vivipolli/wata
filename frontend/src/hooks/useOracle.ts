
import { useState, useEffect, useCallback } from 'react'
import { oracleService, type BatchInfo, type OracleLog, type OracleStats } from '../services/oracle'

export const useOracle = () => {
  const [stats, setStats] = useState<OracleStats | null>(null)
  const [logs, setLogs] = useState<OracleLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const data = await oracleService.getOracleStats()
      setStats(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch oracle stats')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLogs = useCallback(async (limit?: number) => {
    try {
      setLoading(true)
      const data = await oracleService.getOracleLogs(limit)
      setLogs(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch oracle logs')
    } finally {
      setLoading(false)
    }
  }, [])

  const processBatch = useCallback(async (agreementId: number) => {
    try {
      setLoading(true)
      const result = await oracleService.processBatch(agreementId)
      setError(null)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process batch'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const processAllBatches = useCallback(async () => {
    try {
      setLoading(true)
      const result = await oracleService.processAllBatches()
      setError(null)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process all batches'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    fetchLogs(50)
  }, [fetchStats, fetchLogs])

  return {
    stats,
    logs,
    loading,
    error,
    fetchStats,
    fetchLogs,
    processBatch,
    processAllBatches,
    refresh: () => {
      fetchStats()
      fetchLogs(50)
    }
  }
}

export const useAgreementBatches = (agreementId: number | null) => {
  const [batches, setBatches] = useState<BatchInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBatches = useCallback(async () => {
    if (!agreementId) {
      setBatches([])
      return
    }

    try {
      setLoading(true)
      const data = await oracleService.getBatchesByAgreement(agreementId)
      setBatches(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch batches')
    } finally {
      setLoading(false)
    }
  }, [agreementId])

  useEffect(() => {
    fetchBatches()
  }, [fetchBatches])

  return {
    batches,
    loading,
    error,
    refresh: fetchBatches
  }
}