import { useState, useEffect } from 'react'
import { FaWater, FaCheckCircle, FaTimesCircle, FaPlay } from 'react-icons/fa'
import { useAgreements, usePayments, useContractOracleStatus } from '../hooks'
import { useAuth } from '../contexts/AuthContext'
import { readingsService } from '../services'
import PrimaryButton from './common/PrimaryButton'
import SecondaryButton from './common/SecondaryButton'
import type { MonitoringProps, Agreement, Reading, ReadingStats } from '../types'

export default function Monitoring({}: MonitoringProps) {
  const { user } = useAuth()
  const { agreements, getAgreementsByProducer } = useAgreements(false)
  const { triggerPaymentCheck } = usePayments()
  
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [agreementReadings, setAgreementReadings] = useState<Reading[]>([])
  const [agreementStats, setAgreementStats] = useState<ReadingStats | null>(null)

  const [userAgreements, setUserAgreements] = useState<any[]>([])
  const [userAgreementsLoading, setUserAgreementsLoading] = useState(false)

  const { status: contractOracleStatus, loading: oracleLoading } = useContractOracleStatus(selectedAgreement?.id || null)

  useEffect(() => {
    const fetchUserAgreements = async () => {
      if (user?.address && getAgreementsByProducer) {
        setUserAgreementsLoading(true)
        try {
          const userAgreementsData = await getAgreementsByProducer(user.address)
          setUserAgreements(userAgreementsData)
          
          if (userAgreementsData.length > 0 && !selectedAgreement) {
            setSelectedAgreement(userAgreementsData[0])
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
  }, [user?.address, getAgreementsByProducer])

  useEffect(() => {
    if (selectedAgreement) {
      fetchAgreementData(selectedAgreement.id)
    }
  }, [selectedAgreement?.id])

  const fetchAgreementData = async (agreementId: number): Promise<void> => {
    setLoading(true)
    try {
      // Fetch readings
      const readingsResponse = await readingsService.getByAgreement(agreementId, 50)
      if (readingsResponse.success && readingsResponse.data) {
        const readings = readingsResponse.data || []
        setAgreementReadings(readings)
      }
      
      // Fetch stats
      const statsResponse = await readingsService.getStats(agreementId, 7)
      if (statsResponse.success && statsResponse.data?.stats) {
        setAgreementStats(statsResponse.data.stats)
      }
    } catch (error) {
      console.error('Error fetching agreement data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTriggerPaymentCheck = async (agreementId: number): Promise<void> => {
    try {
      const result = await triggerPaymentCheck(agreementId)
      
      if (result) {
        alert(result.message)
      }
    } catch (error) {
      console.error('Error triggering payment check:', error)
      alert('Error triggering payment check')
    }
  }

  const handleSimulateReading = async (): Promise<void> => {
    if (!selectedAgreement) return
    
    setLoading(true)
    try {
      const simulationData = {
        agreementId: selectedAgreement.id
      }
      
      await readingsService.simulate(simulationData)
      
      try {
        const readingsResponse = await readingsService.getByAgreement(selectedAgreement.id, 50)
        if (readingsResponse.success && readingsResponse.data) {
          setAgreementReadings(readingsResponse.data)
        }
      } catch (error) {
        console.error('Error fetching updated readings:', error)
      }
      
      const statsResponse = await readingsService.getStats(selectedAgreement.id, 7)
      if (statsResponse.success && statsResponse.data?.stats) {
        setAgreementStats(statsResponse.data.stats)
      }
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
          <h1 className="text-3xl font-bold text-gray-900">Water Quality Monitoring</h1>
          <p className="mt-2 text-gray-600">
            Monitor water quality readings and manage compliance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Select Agreement
              </h3>
              <div className="space-y-3">
                {userAgreementsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading your agreements...</p>
                  </div>
                ) : userAgreements.length > 0 ? (
                  userAgreements.map((agreement) => (
                  <button
                    key={agreement.id}
                    onClick={() => setSelectedAgreement(agreement)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedAgreement?.id === agreement.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {agreement.producer_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {agreement.hectares} hectares • {agreement.base_value} HBAR/ha
                    </div>
                  </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No agreements found for your account</p>
                    <p className="text-sm mt-1">Create an agreement to start monitoring</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedAgreement ? (
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedAgreement.producer_name}
                    </h3>
                    <div className="flex space-x-2">
                          <PrimaryButton
                            onClick={handleSimulateReading}
                            size="sm"
                            disabled={loading}
                          >
                            <FaWater className="inline h-4 w-4 mr-1" />
                            {loading ? 'Simulating...' : 'Simulate Reading'}
                          </PrimaryButton>
                      <SecondaryButton
                        onClick={() => handleTriggerPaymentCheck(selectedAgreement.id)}
                        size="sm"
                      >
                        <FaPlay className="inline h-4 w-4 mr-1" />
                        Check Payment
                      </SecondaryButton>
                    </div>
                  </div>

                  {agreementStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {agreementStats.totalReadings}
                        </div>
                        <div className="text-sm text-gray-500">Total Readings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {agreementStats.averageTurbidity.toFixed(1)} NTU
                        </div>
                        <div className="text-sm text-gray-500">Avg Turbidity</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {agreementStats.complianceRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">Compliance</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {agreementStats.days}
                        </div>
                        <div className="text-sm text-gray-500">Days</div>
                      </div>
                    </div>
                  )}

                  {/* Oracle Status */}
                  {contractOracleStatus && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Oracle Status</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">
                            {contractOracleStatus.oracleStatus.totalBatches}
                          </div>
                          <div className="text-sm text-gray-500">Total Batches</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-orange-600">
                            {contractOracleStatus.oracleStatus.pendingBatches}
                          </div>
                          <div className="text-sm text-gray-500">Pending</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">
                            {contractOracleStatus.oracleStatus.submittedBatches}
                          </div>
                          <div className="text-sm text-gray-500">Submitted</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">
                            {(contractOracleStatus.oracleStatus.averageScore * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-500">Avg Score</div>
                        </div>
                      </div>
                      
                      {contractOracleStatus.oracleStatus.recentBatches.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Recent Batches</h5>
                          <div className="space-y-2">
                            {contractOracleStatus.oracleStatus.recentBatches.slice(0, 3).map((batch: any) => (
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
                  )}
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Recent Readings
                  </h4>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading readings...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Turbidity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {agreementReadings.map((reading) => (
                            <tr key={reading.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(reading.timestamp).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {reading.turbidity_ntu.toFixed(1)} NTU
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {reading.turbidity_ntu <= 10 ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <FaCheckCircle className="h-3 w-3 mr-1" />
                                    Compliant
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <FaTimesCircle className="h-3 w-3 mr-1" />
                                    Non-compliant
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {reading.is_simulated ? 'Simulated' : 'Real'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-12 text-center">
                <FaWater className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select an Agreement
                </h3>
                <p className="text-gray-500">
                  Choose an agreement from the list to view monitoring data
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
