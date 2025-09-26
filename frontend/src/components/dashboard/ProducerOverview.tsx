import React from 'react'
import { formatDate, formatHBAR, getScoreColor } from '../../utils'

interface ProducerStats {
  totalAgreements: number
  activeAgreements: number
  totalReceived: number
  averageScore: number
  lastPaymentDate?: string
  totalHectares: number
}

interface ProducerOverviewProps {
  producerStats: ProducerStats
}

const ProducerOverview: React.FC<ProducerOverviewProps> = ({ producerStats }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Your PES Agreement</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500">Agreement Status</h3>
            <p className={`text-2xl font-bold ${producerStats.activeAgreements > 0 ? 'text-green-600' : 'text-gray-400'}`}>
              {producerStats.activeAgreements > 0 ? 'Active' : 'No Active Agreement'}
            </p>
            <p className="text-sm text-gray-600">
              {producerStats.totalHectares} hectares monitored
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500">Total Received</h3>
            <p className="text-2xl font-bold text-blue-600">{formatHBAR(producerStats.totalReceived)}</p>
            <p className="text-sm text-gray-600">
              {producerStats.lastPaymentDate ? `Last: ${formatDate(producerStats.lastPaymentDate)}` : 'No payments yet'}
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500">Quality Performance</h3>
            <p className={`text-2xl font-bold ${getScoreColor(producerStats.averageScore)}`}>
              {producerStats.averageScore.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Average score</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProducerOverview
