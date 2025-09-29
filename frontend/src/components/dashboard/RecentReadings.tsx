import React from 'react'
import { FaWater, FaPlay } from 'react-icons/fa'
import { formatNumber } from '../../utils'
import PrimaryButton from '../common/PrimaryButton'

interface Reading {
  id: number
  agreement_id: number
  producer_name?: string
  timestamp: string
  turbidity_ntu: number
  is_simulated: boolean
}

interface RecentReadingsProps {
  readings: Reading[]
  loading: boolean
  userReadingsLoading: boolean
  onSimulateReading: () => void
  onProcessOracle?: () => void
}

const RecentReadings: React.FC<RecentReadingsProps> = ({ 
  readings, 
  loading, 
  userReadingsLoading, 
  onSimulateReading,
  onProcessOracle
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h3 className="text-lg font-medium text-gray-900">
          Recent Turbidity Readings
        </h3>
        <div className="flex space-x-2">
          <PrimaryButton
            onClick={onSimulateReading}
            disabled={loading || userReadingsLoading}
            size="sm"
          >
            <FaWater className="inline h-4 w-4 mr-1" />
            {loading || userReadingsLoading ? 'Simulating...' : 'Simulate Reading'}
          </PrimaryButton>
          {onProcessOracle && (
            <PrimaryButton
              onClick={onProcessOracle}
              disabled={loading || userReadingsLoading}
              size="sm"
            >
              <FaPlay className="inline h-4 w-4 mr-1" />
              {loading || userReadingsLoading ? 'Processing...' : 'Process Oracle'}
            </PrimaryButton>
          )}
        </div>
      </div>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {(readings || []).slice(0, 5).map((reading) => (
          <div key={reading.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Contract #{reading.agreement_id}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(reading.timestamp).toLocaleString()}
              </p>
              {reading.is_simulated && (
                <p className="text-xs text-blue-500 mt-1">Simulated</p>
              )}
            </div>
            <div className="flex-shrink-0 ml-3">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                reading.turbidity_ntu <= 10 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {formatNumber(reading.turbidity_ntu, 1)} NTU
              </span>
            </div>
          </div>
        ))}
        {(!readings || readings.length === 0) && !userReadingsLoading && (
          <div className="text-center py-8 text-gray-500">
            <FaWater className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No readings available for your agreements</p>
          </div>
        )}
        {userReadingsLoading && (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Loading your readings...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentReadings
