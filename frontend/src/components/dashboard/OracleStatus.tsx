import React from 'react'
import { FaCheckCircle, FaExclamationTriangle, FaChartLine } from 'react-icons/fa'
import { formatNumber } from '../../utils'
import type { ProducerOracleStatus } from '../../services/oracle'

interface OracleStatusProps {
  producerOracleStatus: ProducerOracleStatus
}

const OracleStatus: React.FC<OracleStatusProps> = ({ producerOracleStatus }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Oracle Status</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <FaCheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-900">Total Batches</p>
                <p className="text-2xl font-bold text-gray-900">{producerOracleStatus.summary.totalBatches}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <FaExclamationTriangle className="h-5 w-5 text-orange-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-900">Pending Batches</p>
                <p className="text-2xl font-bold text-gray-900">{producerOracleStatus.summary.pendingBatches}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <FaChartLine className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-900">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(producerOracleStatus.summary.averageScore * 100, 1)}%</p>
              </div>
            </div>
          </div>
        </div>
        
        {producerOracleStatus.contracts.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Contract Status</h4>
            <div className="space-y-3">
              {producerOracleStatus.contracts.map((contract) => (
                <div key={contract.agreementId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">{contract.producerName}</h5>
                      <p className="text-sm text-gray-500">Contract #{contract.agreementId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {contract.oracleStatus.totalBatches} batches
                      </p>
                      <p className="text-xs text-gray-500">
                        {contract.oracleStatus.pendingBatches} pending
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Score: {formatNumber(contract.oracleStatus.averageScore * 100, 1)}%
                    </span>
                    <span className="text-xs text-gray-500">
                      Last: {contract.oracleStatus.lastActivity ? 
                        new Date(contract.oracleStatus.lastActivity).toLocaleDateString() : 
                        'Never'
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OracleStatus
