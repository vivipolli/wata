import React, { useState } from 'react'
import { useAgreements, useProducerOracleStatus } from '../hooks'
import { useAuth } from '../contexts/AuthContext'
import { formatDate } from '@/utils/formatters'

const Audit: React.FC = () => {
  const { user } = useAuth()
  const { getAgreementsByProducer } = useAgreements(false)
  const [selectedAgreement, setSelectedAgreement] = useState<number | null>(null)
  const [userAgreements, setUserAgreements] = useState<any[]>([])
  const [userAgreementsLoading, setUserAgreementsLoading] = useState(false)
  
  const { status: producerOracleStatus, loading: producerOracleLoading } = useProducerOracleStatus(user?.address || null)

  // Fetch user-specific agreements
  React.useEffect(() => {
    const fetchUserAgreements = async () => {
      if (user?.address && getAgreementsByProducer) {
        setUserAgreementsLoading(true)
        try {
          const userAgreementsData = await getAgreementsByProducer(user.address)
          setUserAgreements(userAgreementsData)
          
          // Auto-select first agreement if none selected
          if (userAgreementsData.length > 0 && !selectedAgreement) {
            setSelectedAgreement(userAgreementsData[0].id)
          }
        } catch (error) {
          console.error('Error fetching user agreements:', error)
          setUserAgreements([])
        } finally {
          setUserAgreementsLoading(false)
        }
      }
    }

    fetchUserAgreements()
  }, [user?.address, getAgreementsByProducer, selectedAgreement])



  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Oracle Audit</h1>
        <div className="text-sm text-gray-500">
          View your agreement oracle status and activity
        </div>
      </div>

      {/* User Oracle Statistics */}
      {producerOracleStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Your Contracts</h3>
            <p className="text-2xl font-bold text-gray-900">{producerOracleStatus.contracts.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Batches</h3>
            <p className="text-2xl font-bold text-gray-900">
              {producerOracleStatus.contracts.reduce((sum, contract) => sum + contract.oracleStatus.totalBatches, 0)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending Batches</h3>
            <p className="text-2xl font-bold text-orange-600">
              {producerOracleStatus.contracts.reduce((sum, contract) => sum + contract.oracleStatus.pendingBatches, 0)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Average Score</h3>
            <p className="text-2xl font-bold text-blue-600">
              {producerOracleStatus.contracts.length > 0 
                ? (producerOracleStatus.contracts.reduce((sum, contract) => sum + contract.oracleStatus.averageScore, 0) / producerOracleStatus.contracts.length * 100).toFixed(1)
                : 0
              }%
            </p>
          </div>
        </div>
      )}

      {/* User Agreement Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Agreement Selection */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Agreements</h2>
          </div>
          <div className="p-6">
            {userAgreementsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-500">Loading your agreements...</p>
              </div>
            ) : userAgreements.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No agreements found</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {userAgreements.map((agreement) => (
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
                        <h3 className="font-medium text-gray-900">{agreement.producer_name}</h3>
                        <p className="text-sm text-gray-500">
                          {agreement.hectares} ha • {agreement.base_value} HBAR/ha
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Contract #{agreement.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Status</p>
                        <p className={`text-sm font-medium ${
                          agreement.is_active ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {agreement.is_active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Agreement Details */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Agreement Details
              {selectedAgreement && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (Contract #{selectedAgreement})
                </span>
              )}
            </h2>
          </div>
          <div className="p-6">
            {!selectedAgreement ? (
              <p className="text-gray-500 text-center py-8">Select an agreement to view details</p>
            ) : (
              (() => {
                const selectedContract = producerOracleStatus?.contracts.find(
                  contract => contract.agreementId === selectedAgreement
                )
                
                if (!selectedContract) {
                  return <p className="text-gray-500 text-center py-8">Agreement details not found</p>
                }

                return (
                  <div className="space-y-4">
                    {/* Contract Overview */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Producer</p>
                        <p className="font-medium text-gray-900">{selectedContract.producerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Batches</p>
                        <p className="font-medium text-gray-900">{selectedContract.oracleStatus.totalBatches}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Pending Batches</p>
                        <p className="font-medium text-orange-600">{selectedContract.oracleStatus.pendingBatches}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Average Score</p>
                        <p className="font-medium text-blue-600">{(selectedContract.oracleStatus.averageScore * 100).toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Recent Batches */}
                    {selectedContract.oracleStatus.recentBatches && selectedContract.oracleStatus.recentBatches.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Batches</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {selectedContract.oracleStatus.recentBatches.map((batch) => (
                            <div key={batch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-900">Batch #{batch.id}</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  batch.status === 'submitted' ? 'bg-green-100 text-green-800' :
                                  batch.status === 'validated' ? 'bg-blue-100 text-blue-800' :
                                  'bg-orange-100 text-orange-800'
                                }`}>
                                  {batch.status}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{(batch.score * 100).toFixed(1)}%</p>
                                <p className="text-xs text-gray-500">
                                  {batch.createdAt ? formatDate(batch.createdAt) : 'No date'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()
            )}
          </div>
        </div>
      </div>

      {/* User-Specific Oracle Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Oracle Activity</h2>
        </div>
        <div className="p-6">
          {producerOracleLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading your oracle activity...</p>
            </div>
          ) : producerOracleStatus && producerOracleStatus.contracts.length > 0 ? (
            <div className="space-y-4">
              {producerOracleStatus.contracts.map((contract) => (
                <div key={contract.agreementId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{contract.producerName}</h3>
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
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Total Batches</p>
                      <p className="text-lg font-semibold text-gray-900">{contract.oracleStatus.totalBatches}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Pending</p>
                      <p className="text-lg font-semibold text-orange-600">{contract.oracleStatus.pendingBatches}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Average Score</p>
                      <p className="text-lg font-semibold text-blue-600">{(contract.oracleStatus.averageScore * 100).toFixed(1)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Last Activity</p>
                      <p className="text-sm text-gray-600">
                        {contract.oracleStatus.lastActivity ? 
                          new Date(contract.oracleStatus.lastActivity).toLocaleDateString() : 
                          'Never'
                        }
                      </p>
                    </div>
                  </div>

                  {contract.oracleStatus.recentBatches && contract.oracleStatus.recentBatches.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Batches</h4>
                      <div className="space-y-2">
                        {contract.oracleStatus.recentBatches.slice(0, 3).map((batch) => (
                          <div key={batch.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Batch #{batch.id}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                batch.status === 'submitted' ? 'bg-green-100 text-green-800' :
                                batch.status === 'validated' ? 'bg-blue-100 text-blue-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {batch.status}
                              </span>
                              <span className="text-gray-500">{(batch.score * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No oracle activity found for your agreements</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Audit
