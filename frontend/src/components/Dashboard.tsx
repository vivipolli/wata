import { useState, useEffect } from 'react'
import { useAgreements, usePayments, useProducerOracleStatus, useOracle } from '../hooks'
import { useAuth } from '../contexts/AuthContext'
import { useReadingsStore, useReadings, useReadingsLoading } from '../stores'
import { readingsService } from '../services'
import { 
  calculateDashboardStats, 
  calculateProducerStats, 
  collectUserReadings,
  processOracleWithFeedback
} from '../utils/helpers'
import { 
  StatsGrid, 
  ProducerOverview, 
  RecentReadings, 
  OracleStatus, 
  QuickActions 
} from './dashboard'
import PageLayout from './layout/PageLayout'
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
  const { processBatch } = useOracle()
  
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
      await simulateReading(agreementId)
      
      try {
        const response = await readingsService.getByAgreement(agreementId, 10)
        if (response.success && response.data) {
          setUserReadings(response.data)
        }
      } catch (error) {
        console.error('Error fetching updated readings:', error)
      }
    } catch (error) {
      console.error('Error simulating reading:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessOracle = async (): Promise<void> => {
    setLoading(true)
    try {
      const agreementId = userAgreements[0]?.id || 1
      
      await processOracleWithFeedback(
        processBatch,
        agreementId,
        async () => {
          // Atualizar dados após processamento
          try {
            const response = await readingsService.getByAgreement(agreementId, 10)
            if (response.success && response.data) {
              setUserReadings(response.data)
            }
          } catch (error) {
            console.error('Error fetching updated readings:', error)
          }
        }
      )
    } catch (error) {
      console.error('Error processing oracle:', error)
    } finally {
      setLoading(false)
    }
  }



  return (
    <PageLayout 
      title="Dashboard" 
      subtitle="Monitor water quality and manage PES agreements"
    >
      <StatsGrid stats={stats} />

        {/* Producer Overview */}
        {producerStats && <ProducerOverview producerStats={producerStats} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentReadings 
            readings={userReadings}
            loading={loading}
            userReadingsLoading={userReadingsLoading}
            onSimulateReading={handleSimulateReading}
            onProcessOracle={handleProcessOracle}
          />
          
          {producerOracleStatus && <OracleStatus producerOracleStatus={producerOracleStatus} />}
          
          <QuickActions />
        </div>
    </PageLayout>
  )
}
