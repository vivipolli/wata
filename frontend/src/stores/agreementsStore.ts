import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { agreementsService } from '../services/agreements'
import type { Agreement, CreateAgreementData } from '../types'

interface AgreementsState {
  // State
  agreements: Agreement[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null

  // Actions
  fetchAgreements: () => Promise<void>
  fetchAgreementsByProducer: (producerAddress: string) => Promise<void>
  createAgreement: (agreementData: CreateAgreementData) => Promise<Agreement | null>
  addAgreement: (agreement: Agreement) => void
  updateAgreement: (id: number, updates: Partial<Agreement>) => void
  removeAgreement: (id: number) => void
  clearError: () => void
  refreshAgreements: () => Promise<void>
  refreshProducerAgreements: (producerAddress: string) => Promise<void>
}

export const useAgreementsStore = create<AgreementsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      agreements: [],
      loading: false,
      error: null,
      lastUpdated: null,

      // Fetch all agreements
      fetchAgreements: async () => {
        set({ loading: true, error: null })
        
        try {
          const response = await agreementsService.getAll()
          
          if (response.success && response.data) {
            const agreements = response.data.agreements || response.data || []
            set({ 
              agreements, 
              loading: false, 
              lastUpdated: new Date() 
            })
          } else {
            set({ 
              error: 'Failed to fetch agreements', 
              loading: false 
            })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            loading: false 
          })
        }
      },

      // Fetch agreements by producer
      fetchAgreementsByProducer: async (producerAddress: string) => {
        set({ loading: true, error: null })
        
        try {
          const response = await agreementsService.getByProducer(producerAddress)
          
          if (response.success && response.data) {
            const agreements = response.data.agreements || []
            set({ 
              agreements, 
              loading: false, 
              lastUpdated: new Date() 
            })
          } else {
            set({ 
              error: 'Failed to fetch producer agreements', 
              loading: false 
            })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            loading: false 
          })
        }
      },

      // Create new agreement
      createAgreement: async (agreementData: CreateAgreementData) => {
        set({ loading: true, error: null })
        
        try {
          const response = await agreementsService.create(agreementData)
          
          if (response.success && response.data) {
            const agreement = response.data.agreement || response.data
            
            // Add to store
            set(state => ({
              agreements: [agreement, ...state.agreements],
              loading: false,
              lastUpdated: new Date()
            }))
            
            return agreement
          } else {
            set({ 
              error: 'Failed to create agreement', 
              loading: false 
            })
            return null
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            loading: false 
          })
          return null
        }
      },

      // Add agreement to store (for external updates)
      addAgreement: (agreement: Agreement) => {
        set(state => ({
          agreements: [agreement, ...state.agreements],
          lastUpdated: new Date()
        }))
      },

      // Update agreement in store
      updateAgreement: (id: number, updates: Partial<Agreement>) => {
        set(state => ({
          agreements: state.agreements.map(agreement =>
            agreement.id === id ? { ...agreement, ...updates } : agreement
          ),
          lastUpdated: new Date()
        }))
      },

      // Remove agreement from store
      removeAgreement: (id: number) => {
        set(state => ({
          agreements: state.agreements.filter(agreement => agreement.id !== id),
          lastUpdated: new Date()
        }))
      },

      // Clear error
      clearError: () => {
        set({ error: null })
      },

      // Refresh agreements (re-fetch current data)
      refreshAgreements: async () => {
        const state = get()
        
        // If we have agreements, try to refresh based on the first agreement's producer
        if (state.agreements.length > 0) {
          const firstAgreement = state.agreements[0]
          if (firstAgreement.producer_address) {
            await get().fetchAgreementsByProducer(firstAgreement.producer_address)
          }
        } else {
          // If no agreements, don't fetch anything - let the component handle it
          console.log('No agreements to refresh')
        }
      },

      refreshProducerAgreements: async (producerAddress: string) => {
        await get().fetchAgreementsByProducer(producerAddress)
      }
    }),
    {
      name: 'agreements-store',
    }
  )
)

// Selectors for common use cases - simplified to avoid loops
export const useAgreements = () => {
  const agreements = useAgreementsStore(state => state.agreements)
  const loading = useAgreementsStore(state => state.loading)
  const error = useAgreementsStore(state => state.error)
  const lastUpdated = useAgreementsStore(state => state.lastUpdated)
  
  return { agreements, loading, error, lastUpdated }
}

export const useAgreementsActions = () => {
  const fetchAgreements = useAgreementsStore(state => state.fetchAgreements)
  const fetchAgreementsByProducer = useAgreementsStore(state => state.fetchAgreementsByProducer)
  const createAgreement = useAgreementsStore(state => state.createAgreement)
  const addAgreement = useAgreementsStore(state => state.addAgreement)
  const updateAgreement = useAgreementsStore(state => state.updateAgreement)
  const removeAgreement = useAgreementsStore(state => state.removeAgreement)
  const clearError = useAgreementsStore(state => state.clearError)
  const refreshAgreements = useAgreementsStore(state => state.refreshAgreements)
  const refreshProducerAgreements = useAgreementsStore(state => state.refreshProducerAgreements)
  
  return {
    fetchAgreements,
    fetchAgreementsByProducer,
    createAgreement,
    addAgreement,
    updateAgreement,
    removeAgreement,
    clearError,
    refreshAgreements,
    refreshProducerAgreements
  }
}

// Hook for getting a specific agreement
export const useAgreement = (id: number) => useAgreementsStore(state => 
  state.agreements.find(agreement => agreement.id === id)
)