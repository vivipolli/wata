import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { readingsService } from '../services'
import type { Reading, ReadingStats } from '../types'

interface ReadingsState {
  readings: Reading[]
  agreementReadings: Record<number, Reading[]>
  stats: Record<number, ReadingStats>
  loading: boolean
  error: string | null
  autoRefreshInterval: NodeJS.Timeout | null
  isAutoRefreshing: boolean
  
  fetchRecentReadings: (limit?: number) => Promise<void>
  fetchAgreementReadings: (agreementId: number, limit?: number) => Promise<void>
  fetchReadingStats: (agreementId: number, days?: number) => Promise<void>
  simulateReading: (agreementId: number) => Promise<Reading | null>
  startAutoRefresh: (agreementId?: number, interval?: number) => void
  stopAutoRefresh: () => void
  clearError: () => void
  clearReadings: () => void
}

export const useReadingsStore = create<ReadingsState>()(
  subscribeWithSelector((set, get) => ({
    readings: [],
    agreementReadings: {},
    stats: {},
    loading: false,
    error: null,
    autoRefreshInterval: null,
    isAutoRefreshing: false,

    fetchRecentReadings: async (limit = 20) => {
      set({ loading: true, error: null })
      try {
        const response = await readingsService.getRecent(limit)
        if (response.success && response.data) {
          set({ readings: response.data.readings || response.data || [] })
        } else {
          set({ error: 'Failed to fetch recent readings' })
        }
      } catch (error: any) {
        set({ error: error.message })
      } finally {
        set({ loading: false })
      }
    },

    fetchAgreementReadings: async (agreementId: number, limit = 50) => {
      set({ loading: true, error: null })
      try {
        const response = await readingsService.getByAgreement(agreementId, limit)
        if (response.success && response.data) {
          const readings = response.data || []
          set(state => ({
            agreementReadings: {
              ...state.agreementReadings,
              [agreementId]: readings
            }
          }))
        } else {
          set({ error: 'Failed to fetch agreement readings' })
        }
      } catch (error: any) {
        set({ error: error.message })
      } finally {
        set({ loading: false })
      }
    },

    fetchReadingStats: async (agreementId: number, days = 7) => {
      try {
        const response = await readingsService.getStats(agreementId, days)
        if (response.success && response.data?.stats) {
          set(state => ({
            stats: {
              ...state.stats,
              [agreementId]: response.data!.stats
            }
          }))
        }
      } catch (error: any) {
        console.error('Error fetching reading stats:', error)
      }
    },

    simulateReading: async (agreementId: number) => {
      set({ loading: true, error: null })
      try {
        const simulationData = {
          agreementId
        }
        
        const response = await readingsService.simulate(simulationData)
        if (response.success && response.data?.reading) {
          const newReading = response.data.reading
          
          set(state => ({
            readings: [newReading, ...state.readings]
          }))
          
          set(state => ({
            agreementReadings: {
              ...state.agreementReadings,
              [agreementId]: [newReading, ...(state.agreementReadings[agreementId] || [])]
            }
          }))
          
          
          return newReading
        } else {
          set({ error: 'Failed to simulate reading' })
          return null
        }
      } catch (error: any) {
        set({ error: error.message })
        return null
      } finally {
        set({ loading: false })
      }
    },

    startAutoRefresh: (agreementId?: number, interval = 30000) => {
      const { stopAutoRefresh } = get()
      stopAutoRefresh()
      
      const refreshInterval = setInterval(async () => {
        const currentState = get()
        if (currentState.isAutoRefreshing) {
          return // Skip if already refreshing
        }
        
        set({ isAutoRefreshing: true })
        
        try {
          if (agreementId) {
            await get().fetchAgreementReadings(agreementId)
            // Don't auto-refresh stats to avoid loops
          } else {
            await get().fetchRecentReadings()
          }
        } catch (error) {
          console.error('Auto-refresh error:', error)
        } finally {
          set({ isAutoRefreshing: false })
        }
      }, interval)
      
      set({ autoRefreshInterval: refreshInterval })
    },

    stopAutoRefresh: () => {
      const { autoRefreshInterval } = get()
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval)
        set({ autoRefreshInterval: null, isAutoRefreshing: false })
      }
    },

    clearError: () => set({ error: null }),

    clearReadings: () => set({ 
      readings: [], 
      agreementReadings: {}, 
      stats: {} 
    })
  }))
)

export const useReadings = () => useReadingsStore(state => state.readings)
export const useAgreementReadings = (agreementId: number) => 
  useReadingsStore(state => state.agreementReadings[agreementId] || [])
export const useReadingStats = (agreementId: number) => 
  useReadingsStore(state => state.stats[agreementId])
export const useReadingsLoading = () => useReadingsStore(state => state.loading)
export const useReadingsError = () => useReadingsStore(state => state.error)
