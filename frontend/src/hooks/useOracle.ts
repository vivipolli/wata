
import { useState, useEffect, useCallback } from 'react'
import { oracleService, type BatchInfo, type OracleLog, type OracleStats, type ProducerOracleStatus, type DetailedContractOracleStatus } from '../services/oracle'

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


/**
 * Hook to get oracle status for a specific producer (all their contracts)
 */
export const useProducerOracleStatus = (producerAddress: string | null) => {
  const [status, setStatus] = useState<ProducerOracleStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    if (!producerAddress) {
      setStatus(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await oracleService.getProducerOracleStatus(producerAddress)
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch producer oracle status')
    } finally {
      setLoading(false)
    }
  }, [producerAddress])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return {
    status,
    loading,
    error,
    refresh: fetchStatus
  }
}

/**
 * Hook to get detailed oracle status for a specific contract
 */
export const useContractOracleStatus = (agreementId: number | null) => {
  const [status, setStatus] = useState<DetailedContractOracleStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    if (!agreementId) {
      setStatus(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await oracleService.getContractOracleStatus(agreementId)
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contract oracle status')
    } finally {
      setLoading(false)
    }
  }, [agreementId])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return {
    status,
    loading,
    error,
    refresh: fetchStatus
  }
}