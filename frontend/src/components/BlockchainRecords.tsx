import React, { useState, useEffect } from 'react'
import { FaExternalLinkAlt, FaShieldAlt, FaFileAlt, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { blockchainRecordsService, type BlockchainRecord } from '../services/blockchainRecords'
import { 
  formatDate, 
  formatHBAR, 
  getHederaExplorerUrl, 
  getHederaFileUrl, 
  getValidationStatus,
  getStatusColorClasses
} from '../utils'

interface BlockchainRecordsProps {
  userType: 'producer' | 'investor'
  userAddress?: string
}

const BlockchainRecords: React.FC<BlockchainRecordsProps> = ({ userType, userAddress }) => {
  const [records, setRecords] = useState<BlockchainRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<BlockchainRecord | null>(null)

  useEffect(() => {
    fetchBlockchainRecords()
  }, [userAddress])

  const fetchBlockchainRecords = async () => {
    if (!userAddress) {
      setError('User address is required')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await blockchainRecordsService.getUserRecords(userType, userAddress)
      
      if (response.success && response.data) {
        setRecords(response.data.records)
      } else {
        setError(response.error || 'Failed to fetch blockchain records')
      }
    } catch (err) {
      setError('Failed to fetch blockchain records')
      console.error('Error fetching blockchain records:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" />
      case 'pending':
        return <FaClock className="text-yellow-500" />
      case 'failed':
        return <FaExclamationTriangle className="text-red-500" />
      default:
        return <FaClock className="text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading blockchain records...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <FaExclamationTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaShieldAlt className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900">Blockchain Records</h2>
          </div>
          <div className="text-sm text-gray-500">
            Transparent & Immutable Audit Trail
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {records.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaShieldAlt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No blockchain records found</p>
            <p className="text-sm">Records will appear here after payments are processed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => {
              const validationStatus = getValidationStatus(record.score)
              
              return (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(record.status)}
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-lg">{formatHBAR(record.amount)}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColorClasses(record.status)}`}>
                            {record.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Agreement #{record.agreementId}</p>
                          <p className="text-gray-500">Score: <span className={validationStatus.color}>{record.score.toFixed(1)}% ({validationStatus.status})</span></p>
                          <p className="text-gray-500">Date: {formatDate(record.timestamp)}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-500">Producer: {record.producerAddress}</p>
                          {record.investorAddress && (
                            <p className="text-gray-500">Investor: {record.investorAddress}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Audit Hash */}
                      <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                        <span className="text-gray-500">Audit Hash: </span>
                        <span className="font-mono text-gray-700">{record.auditHash}</span>
                      </div>
                    </div>
                    
                    {/* Blockchain Links */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {record.hcsTransactionId && (
                        <a
                          href={getHederaExplorerUrl(record.hcsTransactionId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                        >
                          <FaShieldAlt className="h-3 w-3 mr-1" />
                          HCS Record
                          <FaExternalLinkAlt className="h-2 w-2 ml-1" />
                        </a>
                      )}
                      
                      {record.hfsFileId && (
                        <a
                          href={getHederaFileUrl(record.hfsFileId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                        >
                          <FaFileAlt className="h-3 w-3 mr-1" />
                          HFS Report
                          <FaExternalLinkAlt className="h-2 w-2 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {/* Validation Status */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">Validation Status:</span>
                        <span className={`font-medium ${validationStatus.color}`}>
                          {validationStatus.status}
                        </span>
                      </div>
                      <div className="text-gray-500">
                        {record.status === 'completed' ? 'Verified on Blockchain' : 'Pending Verification'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {/* Summary */}
        {records.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {records.filter(r => r.status === 'completed').length}
                </p>
                <p className="text-gray-500">Verified Payments</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {records.filter(r => r.hcsTransactionId).length}
                </p>
                <p className="text-gray-500">HCS Records</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {records.filter(r => r.hfsFileId).length}
                </p>
                <p className="text-gray-500">HFS Reports</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlockchainRecords
