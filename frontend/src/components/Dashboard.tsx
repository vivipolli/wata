import { useState, useEffect } from 'react'
import { FaWater, FaFileContract, FaDollarSign, FaChartLine, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { useAgreements, useReadings, usePayments, useOracle } from '../hooks'
import { formatNumber } from '../utils'
import type { DashboardProps } from '../types'
import type { IconType } from 'react-icons'
import PaymentHistory from './PaymentHistory'

interface StatCardProps {
  title: string
  value: string | number
  icon: IconType
  color: string
  subtitle?: string
}

interface Stats {
  activeContracts: number
  pendingPayments: number
  lastTurbidity: number
  complianceRate: number
  averageScore: number
  validationRate: number
}

const StatCard = ({ title, value, icon: Icon, color, subtitle }: StatCardProps) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
              {subtitle && (
                <div className="ml-2 text-sm text-gray-500">
                  {subtitle}
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
)

export default function Dashboard({}: DashboardProps) {
  const { agreements, loading: agreementsLoading } = useAgreements()
  const { readings, loading: readingsLoading, simulateReading } = useReadings()
  const { getPaymentStats } = usePayments()
  const { stats: oracleStats } = useOracle()
  
  const [stats, setStats] = useState<Stats>({
    activeContracts: 0,
    pendingPayments: 0,
    lastTurbidity: 0,
    complianceRate: 0,
    averageScore: 0,
    validationRate: 0
  })
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    calculateStats()
  }, [agreements, readings])

  const calculateStats = async (): Promise<void> => {
    const activeContracts = (agreements || []).filter(a => a.is_active).length
    
    const recentReadings = readings?.slice(0, 10) || []
    const lastTurbidity = recentReadings.length > 0 ? recentReadings[0].turbidity_ntu : 0
    
    const compliantReadings = recentReadings.filter(r => r.turbidity_ntu <= 10)
    const complianceRate = recentReadings.length > 0 
      ? (compliantReadings.length / recentReadings.length) * 100 
      : 0

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

    // Calculate average score from oracle stats
    const averageScore = oracleStats ? parseFloat(oracleStats.successRate) : 0
    
    // Calculate validation rate (successful validations vs total attempts)
    const validationRate = oracleStats && oracleStats.recentValidations > 0
      ? (oracleStats.recentSubmissions / oracleStats.recentValidations) * 100
      : 0

    setStats({
      activeContracts,
      pendingPayments,
      lastTurbidity,
      complianceRate,
      averageScore,
      validationRate
    })
  }

  const handleSimulateReading = async (): Promise<void> => {
    setLoading(true)
    try {
      const agreementId = agreements[0]?.id || 1
      await simulateReading(agreementId, { lat: -23.5505, lng: -46.6333 })
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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
          <StatCard
            title="Active Contracts"
            value={stats.activeContracts}
            icon={FaFileContract}
            color="text-blue-600"
          />
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            icon={FaDollarSign}
            color="text-green-600"
          />
          <StatCard
            title="Last Turbidity"
            value={`${formatNumber(stats.lastTurbidity, 1)} NTU`}
            icon={FaWater}
            color="text-cyan-600"
            subtitle={stats.lastTurbidity <= 10 ? "Good" : "Poor"}
          />
          <StatCard
            title="Compliance Rate"
            value={`${formatNumber(stats.complianceRate, 1)}%`}
            icon={FaChartLine}
            color="text-purple-600"
          />
          <StatCard
            title="Oracle Score"
            value={`${formatNumber(stats.averageScore, 1)}%`}
            icon={FaCheckCircle}
            color="text-indigo-600"
            subtitle={stats.averageScore >= 70 ? "Good" : "Needs Improvement"}
          />
          <StatCard
            title="Validation Rate"
            value={`${formatNumber(stats.validationRate, 1)}%`}
            icon={stats.validationRate >= 80 ? FaCheckCircle : FaExclamationTriangle}
            color={stats.validationRate >= 80 ? "text-green-600" : "text-orange-600"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Turbidity Readings
              </h3>
              <button
                onClick={handleSimulateReading}
                disabled={loading || agreementsLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Simulating...' : 'Simulate Reading'}
              </button>
            </div>
            <div className="space-y-3">
              {(readings || []).slice(0, 5).map((reading) => (
                <div key={reading.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {reading.producer_name || 'Unknown Producer'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(reading.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      reading.turbidity_ntu <= 10 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {formatNumber(reading.turbidity_ntu, 1)} NTU
                    </span>
                    {reading.is_simulated && (
                      <p className="text-xs text-gray-400 mt-1">Simulated</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Active Agreements
            </h3>
            <div className="space-y-3">
              {(agreements || []).slice(0, 5).map((agreement) => (
                <div key={agreement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {agreement.producer_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {agreement.hectares} hectares • {agreement.base_value} HBAR/ha
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      ID: {agreement.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="mt-8">
        <PaymentHistory />
      </div>
    </div>
  )
}
