import { useState, useEffect, useCallback } from 'react'
import { FaFileContract, FaCalendar, FaDollarSign, FaRuler, FaMapMarkerAlt, FaChevronDown, FaChevronUp, FaHandHoldingUsd, FaSync } from 'react-icons/fa'
import { useAgreements, useAgreementsActions } from '../stores/agreementsStore'
import { useAuth } from '../contexts/AuthContext'
import { useAccount } from 'wagmi'
import { investmentService } from '../services/investments'
import { USER_ROLES } from '../utils/constants'
import PrimaryButton from './common/PrimaryButton'

interface AgreementListProps {
  producerAddress?: string
  showAllAgreements?: boolean
}

export default function AgreementList({ producerAddress, showAllAgreements = false }: AgreementListProps): React.JSX.Element {
  const { user, hasRole } = useAuth()
  const { address } = useAccount()
  
  // Zustand store
  const { agreements, loading, error, lastUpdated } = useAgreements()
  const { fetchAgreements, fetchAgreementsByProducer, refreshAgreements } = useAgreementsActions()
  
  // Local state
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [contributingAgreement, setContributingAgreement] = useState<number | null>(null)
  const [contributionAmount, setContributionAmount] = useState<string>('')
  const [showContributionForm, setShowContributionForm] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  // Fetch agreements on mount - using useCallback to prevent loops
  const loadAgreements = useCallback(async () => {
    if (showAllAgreements && hasRole(USER_ROLES.INVESTOR)) {
      await fetchAgreements()
    } else if (producerAddress) {
      await fetchAgreementsByProducer(producerAddress)
    } else if (user?.address) {
      await fetchAgreementsByProducer(user.address)
    }
  }, [showAllAgreements, hasRole, producerAddress, user?.address, fetchAgreements, fetchAgreementsByProducer])

  useEffect(() => {
    loadAgreements()
  }, [loadAgreements])

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatHBAR = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '0.0000 HBAR'
    }
    return `${amount.toFixed(4)} HBAR`
  }

  const toggleExpanded = (agreementId: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(agreementId)) {
        newSet.delete(agreementId)
      } else {
        newSet.add(agreementId)
      }
      return newSet
    })
  }

  const handleContribution = async (agreementId: number) => {
    if (!address) {
      alert('Please connect your wallet to make a contribution')
      return
    }

    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      alert('Please enter a valid contribution amount')
      return
    }

    setContributingAgreement(agreementId)
    try {
      const result = await investmentService.contributeToAgreement(
        agreementId,
        parseFloat(contributionAmount),
        address
      )

      if (result.success && result.data) {
        alert(`Contribution successful! Transaction ID: ${result.data.transactionId}`)
        setShowContributionForm(null)
        setContributionAmount('')
      } else {
        alert(`Contribution failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Error making contribution:', error)
      alert(`Contribution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setContributingAgreement(null)
    }
  }

  const handleShowContributionForm = (agreementId: number) => {
    setShowContributionForm(agreementId)
    setContributionAmount('')
  }

  const handleCancelContribution = () => {
    setShowContributionForm(null)
    setContributionAmount('')
  }

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshAgreements()
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatLastUpdate = (date: Date | null): string => {
    if (!date) return 'Never'
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    
    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else {
      return date.toLocaleTimeString()
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <h3 className="text-lg font-medium">Error loading agreements</h3>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={handleManualRefresh}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <FaSync className="h-4 w-4 mr-2" />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header with refresh button and last update info */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#94b9ff] disabled:opacity-50 transition-colors"
        >
          <FaSync className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {agreements.length === 0 ? (
        <div className="text-center py-8">
          <FaFileContract className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No agreements found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {showAllAgreements 
              ? 'No agreements have been created yet.' 
              : 'You haven\'t created any agreements yet.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {agreements.map((agreement) => {
        const isExpanded = expandedItems.has(agreement.id)
        const isInvestor = hasRole(USER_ROLES.INVESTOR)
        
        return (
          <div key={agreement.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <FaFileContract className="h-6 w-6 text-[#94b9ff] mr-3" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Agreement #{agreement.id}
                    </h3>
                    <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                      agreement.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {agreement.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center">
                      <FaDollarSign className="h-4 w-4 text-[#94b9ff] mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Base Value</p>
                        <p className="font-medium">{formatHBAR(agreement.base_value || 0)}/ha</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaRuler className="h-4 w-4 text-[#94b9ff] mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Area</p>
                        <p className="font-medium">{agreement.hectares || 0} hectares</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaCalendar className="h-4 w-4 text-[#94b9ff] mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="font-medium">{formatDate(agreement.created_at)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="h-4 w-4 text-[#94b9ff] mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">
                          {agreement.location_lat && agreement.location_lng 
                            ? `${(agreement.location_lat || 0).toFixed(4)}, ${(agreement.location_lng || 0).toFixed(4)}`
                            : 'Not specified'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isInvestor && !showContributionForm && (
                    <PrimaryButton
                      onClick={() => handleShowContributionForm(agreement.id)}
                      size="sm"
                    >
                      <FaHandHoldingUsd className="h-4 w-4 mr-2" />
                      Contribute
                    </PrimaryButton>
                  )}
                  
                  <button
                    onClick={() => toggleExpanded(agreement.id)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#94b9ff] transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <FaChevronUp className="h-4 w-4 mr-2" />
                        Less Details
                      </>
                    ) : (
                      <>
                        <FaChevronDown className="h-4 w-4 mr-2" />
                        More Details
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Contribution Form - Separate Line */}
            {isInvestor && showContributionForm === agreement.id && (
              <div className="border-t border-gray-200 bg-blue-50 px-6 py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="w-full sm:w-48">
                    <label htmlFor={`contribution-${agreement.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Contribution Amount (HBAR)
                    </label>
                    <input
                      id={`contribution-${agreement.id}`}
                      type="number"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#94b9ff] focus:border-[#94b9ff]"
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <PrimaryButton
                      onClick={() => handleContribution(agreement.id)}
                      disabled={contributingAgreement === agreement.id}
                      size="sm"
                    >
                      {contributingAgreement === agreement.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Contributing...
                        </>
                      ) : (
                        <>
                          <FaHandHoldingUsd className="h-4 w-4 mr-2" />
                          Confirm
                        </>
                      )}
                    </PrimaryButton>
                    <button
                      onClick={handleCancelContribution}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#94b9ff] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {isExpanded && (
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Agreement Details</h4>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm text-gray-500">Producer Name</dt>
                        <dd className="text-sm font-medium text-gray-900">{agreement.producer_name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Producer Address</dt>
                        <dd className="text-sm font-medium text-gray-900 font-mono">{agreement.producer_address}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Agreement Hash</dt>
                        <dd className="text-sm font-medium text-gray-900 font-mono break-all">{agreement.agreement_hash}</dd>
                      </div>
                      {agreement.duration_days && (
                        <div>
                          <dt className="text-sm text-gray-500">Duration</dt>
                          <dd className="text-sm font-medium text-gray-900">{agreement.duration_days} days</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Blockchain Information</h4>
                    <dl className="space-y-2">
                      {agreement.blockchain_id && (
                        <div>
                          <dt className="text-sm text-gray-500">Blockchain ID</dt>
                          <dd className="text-sm font-medium text-gray-900">{agreement.blockchain_id}</dd>
                        </div>
                      )}
                      {agreement.transaction_id && (
                        <div>
                          <dt className="text-sm text-gray-500">Transaction ID</dt>
                          <dd className="text-sm font-medium text-gray-900 font-mono break-all">{agreement.transaction_id}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-sm text-gray-500">Status</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            agreement.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {agreement.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
        </div>
      )}
    </div>
  )
}
