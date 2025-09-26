import React from 'react'
import { FaDollarSign, FaWater, FaChartLine, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { formatNumber } from '../../utils'
import StatCard from './StatCard'

interface StatsGridProps {
  stats: {
    activeContracts: number
    pendingPayments: number
    lastTurbidity: number
    complianceRate: number
    averageScore: number
    validationRate: number
  }
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
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
  )
}

export default StatsGrid
