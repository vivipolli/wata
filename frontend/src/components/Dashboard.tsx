import { useState, useEffect } from 'react'
import { useAgreements, usePayments, useProducerOracleStatus } from '../hooks'
import { useAuth } from '../contexts/AuthContext'
import { useReadingsStore, useReadings, useReadingsLoading } from '../stores'
import { readingsService } from '../services'
import { 
  calculateDashboardStats, 
  calculateProducerStats, 
  collectUserReadings 
} from '../utils/helpers'
import { 
  StatsGrid, 
  ProducerOverview, 
  RecentReadings, 
  OracleStatus, 
  QuickActions 
} from './dashboard'
import type { DashboardProps } from '../types'

interface Stats {
  activeContracts: number
  pendingPayments: number
  lastTurbidity: number
  complianceRate: number
  averageScore: number
  validationRate: number
}

interface ProducerStats {
  totalAgreements: number
  activeAgreements: number
  totalReceived: number
  averageScore: number
  lastPaymentDate?: string
  totalHectares: number
}

export default function Dashboard({}: DashboardProps) {
  const { user } = useAuth()
  const { agreements, loading: agreementsLoading, getAgreementsByProducer } = useAgreements(false) // Don't auto-fetch
  const { simulateReading, startAutoRefresh, stopAutoRefresh } = useReadingsStore()
  const readings = useReadings()
  const readingsLoading = useReadingsLoading()
  const { payments, getPaymentStats } = usePayments()
  
  // Use the new hierarchical hook for oracle status
  const { status: producerOracleStatus, loading: oracleLoading } = useProducerOracleStatus(user?.address || null)
  
  const [stats, setStats] = useState<Stats>({
    activeContracts: 0,
    pendingPayments: 0,
    lastTurbidity: 0,
    complianceRate: 0,
    averageScore: 0,
    validationRate: 0
  })
  const [producerStats, setProducerStats] = useState<ProducerStats | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  // State for user-specific data
  const [userAgreements, setUserAgreements] = useState<any[]>([])
  const [userAgreementsLoading, setUserAgreementsLoading] = useState(false)
  const [userReadings, setUserReadings] = useState<any[]>([])
  const [userReadingsLoading, setUserReadingsLoading] = useState(false)

  // Use authenticated user's address
  const producerAddress = user?.address

  // Fetch user-specific agreements
  useEffect(() => {
    const fetchUserAgreements = async () => {
      if (user?.address && getAgreementsByProducer) {
        setUserAgreementsLoading(true)
        try {
          const userAgreementsData = await getAgreementsByProducer(user.address)
          setUserAgreements(userAgreementsData)
        } catch (error) {
          console.error('Error fetching user agreements:', error)
          setUserAgreements([])
        } finally {
          setUserAgreementsLoading(false)
        }
      }
    }

    fetchUserAgreements()
  }, [user?.address, getAgreementsByProducer])

  // Fetch user-specific readings from their agreements
  useEffect(() => {
    const fetchUserReadings = async () => {
      if (userAgreements.length > 0) {
        setUserReadingsLoading(true)
        try {
          const uniqueReadings = await collectUserReadings(
            userAgreements, 
            readingsService, 
            useReadingsStore.getState().fetchAgreementReadings
          )
          setUserReadings(uniqueReadings)
        } catch (error) {
          console.error('Error fetching user readings:', error)
          setUserReadings([])
        } finally {
          setUserReadingsLoading(false)
        }
      } else {
        setUserReadings([])
      }
    }

    fetchUserReadings()
  }, [userAgreements])

  useEffect(() => {
    calculateStats()
    if (userAgreements && payments) {
      calculateProducerStatsLocal()
    }
  }, [userAgreements, readings, payments, producerOracleStatus])

  // Start auto-refresh for recent readings
  useEffect(() => {
    if (userAgreements.length > 0) {
      startAutoRefresh(undefined, 30000)
    }
    
    return () => {
      stopAutoRefresh()
    }
  }, [userAgreements.length])

  const calculateStats = async (): Promise<void> => {
    // Get payment stats
    let pendingPayments = 0
    try {
      const paymentStats = await getPaymentStats()
      if (paymentStats) {
        pendingPayments = paymentStats.pendingPayments || 0
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error)
    }

    // Use utility function to calculate stats
    const calculatedStats = calculateDashboardStats(
      userAgreements,
      userReadings,
      producerOracleStatus,
      pendingPayments
    )

    setStats(calculatedStats)
  }

  const calculateProducerStatsLocal = () => {
    // Use utility function to calculate producer stats
    const calculatedProducerStats = calculateProducerStats(userAgreements, payments)
    if (calculatedProducerStats) {
      setProducerStats(calculatedProducerStats)
    }
  }


  const handleSimulateReading = async (): Promise<void> => {
    setLoading(true)
    try {
      const agreementId = userAgreements[0]?.id || 1
      await simulateReading(agreementId, { lat: -23.5505, lng: -46.6333 })
      // Auto-refresh will handle updating the readings
    } catch (error) {
      console.error('Error simulating reading:', error)
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor water quality and manage PES agreements
          </p>
        </div>

        <StatsGrid stats={stats} />

        {/* Producer Overview */}
        {producerStats && <ProducerOverview producerStats={producerStats} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentReadings 
            readings={userReadings}
            loading={loading}
            userReadingsLoading={userReadingsLoading}
            onSimulateReading={handleSimulateReading}
          />
          
          {producerOracleStatus && <OracleStatus producerOracleStatus={producerOracleStatus} />}
          
          <QuickActions />
        </div>
      </div>

    </div>
  )
}
