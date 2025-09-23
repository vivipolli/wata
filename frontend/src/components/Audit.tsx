import React, { useState } from 'react'
import { useOracle, useAgreements, useAgreementBatches } from '../hooks'
import type { BatchInfo, OracleLog } from '../services/oracle'
import HashDisplay from './HashDisplay'

const Audit: React.FC = () => {
  const { stats, logs, loading: oracleLoading, error, processBatch, processAllBatches, refresh } = useOracle()
  const { agreements } = useAgreements()
  const [selectedAgreement, setSelectedAgreement] = useState<number | null>(null)
  const [processing, setProcessing] = useState(false)
  const { batches, loading: batchesLoading, refresh: refreshBatches } = useAgreementBatches(selectedAgreement)

  const handleProcessBatch = async (agreementId: number) => {
    try {
      setProcessing(true)
      await processBatch(agreementId)
      refresh()
      refreshBatches()
    } catch (error) {
      console.error('Error processing batch:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleProcessAll = async () => {
    try {
      setProcessing(true)
      await processAllBatches()
      refresh()
      refreshBatches()
    } catch (error) {
      console.error('Error processing all batches:', error)
    } finally {
      setProcessing(false)
    }
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number): string => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString()
  }

  const formatHash = (hash: string): string => {
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={refresh}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Oracle Audit Dashboard</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleProcessAll}
            disabled={processing || oracleLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? 'Processing...' : 'Process All'}
          </button>
          <button
            onClick={refresh}
            disabled={oracleLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {oracleLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Oracle Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending Batches</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingBatches}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Recent Validations</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.recentValidations}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Recent Submissions</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.recentSubmissions}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
            <p className="text-2xl font-bold text-green-600">{stats.successRate}%</p>
          </div>
        </div>
      )}

      {/* Agreement Selection and Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agreement Selection */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Agreements</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {agreements.map((agreement) => (
                <div
                  key={agreement.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAgreement === agreement.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedAgreement(agreement.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{agreement.producerName}</h3>
                      <p className="text-sm text-gray-500">
                        {agreement.hectares} ha • {agreement.baseValue} HBAR/ha
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleProcessBatch(agreement.id)
                      }}
                      disabled={processing}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 transition-colors"
                    >
                      Process
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Batches for Selected Agreement */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Validation Batches
              {selectedAgreement && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (Agreement #{selectedAgreement})
                </span>
              )}
            </h2>
          </div>
          <div className="p-6">
            {!selectedAgreement ? (
              <p className="text-gray-500 text-center py-8">Select an agreement to view batches</p>
            ) : batchesLoading ? (
              <p className="text-gray-500 text-center py-8">Loading batches...</p>
            ) : batches.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No batches found</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {batches.map((batch: BatchInfo) => (
                  <div key={batch.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreBadge(batch.score)}`}>
                        Score: {batch.score.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(batch.created_at)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Readings</p>
                        <p className="font-medium">{batch.readings_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Avg Turbidity</p>
                        <p className="font-medium">{batch.average_turbidity.toFixed(2)} NTU</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Outliers</p>
                        <p className="font-medium">{batch.outliers_detected}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status</p>
                        <p className={`font-medium capitalize ${
                          batch.validation_status === 'submitted' ? 'text-green-600' :
                          batch.validation_status === 'validated' ? 'text-blue-600' :
                          'text-gray-600'
                        }`}>
                          {batch.validation_status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 space-y-2">
                      <HashDisplay 
                        hash={batch.audit_hash}
                        label="Audit Hash"
                        type="audit"
                        className="text-xs"
                      />
                      {batch.transaction_hash && (
                        <HashDisplay 
                          hash={batch.transaction_hash}
                          label="Transaction Hash"
                          type="transaction"
                          className="text-xs"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Oracle Activity Logs */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Oracle Activity</h2>
        </div>
        <div className="p-6">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No activity logs found</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.map((log: OracleLog) => (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          log.action === 'batch_validated' ? 'bg-blue-100 text-blue-800' :
                          log.action === 'batch_submitted' ? 'bg-green-100 text-green-800' :
                          log.action === 'payment_processed' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.action.replace('_', ' ')}
                        </span>
                        {log.agreement_id && (
                          <span className="text-xs text-gray-500">Agreement #{log.agreement_id}</span>
                        )}
                      </div>
                      {log.details && (
                        <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                      )}
                        {log.transaction_hash && (
                          <div className="mt-1">
                            <HashDisplay 
                              hash={log.transaction_hash}
                              label="Transaction"
                              type="transaction"
                              className="text-xs"
                            />
                          </div>
                        )}
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(log.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Audit
