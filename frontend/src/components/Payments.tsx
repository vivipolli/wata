import React, { useState, useEffect } from 'react'
import { FaDollarSign, FaWallet, FaHistory, FaCheckCircle, FaClock, FaExclamationTriangle, FaFileContract, FaLink, FaDatabase } from 'react-icons/fa'
import { useAccount } from 'wagmi'
import { usePayments, useAgreements } from '../hooks'
import { formatNumber, formatDate, formatHBAR, getStatusIconClass, getStatusColorClasses } from '../utils'
import HashDisplay from './HashDisplay'
import BlockchainRecords from './BlockchainRecords'
import PageLayout from './layout/PageLayout'

interface PaymentStats {
  totalReceived: number
  pendingPayments: number
  completedPayments: number
  averagePayment: number
  lastPaymentDate?: string
  totalAgreements: number
  activeAgreements: number
}

interface PaymentDetail {
  id: number
  amount: number
  status: string
  agreementId: number
  score?: number
  auditHash?: string
  processedAt?: string
  createdAt: string
  producerAddress: string
  agreementDetails?: {
    producerName: string
    hectares: number
    baseValue: number
  }
}

const Payments: React.FC = () => {
  const { address } = useAccount()
  const { payments, loading: paymentsLoading, getPaymentStats, fetchAgreementPayments } = usePayments()
  const { agreements, loading: agreementsLoading } = useAgreements()
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetail[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedAgreementId, setSelectedAgreementId] = useState<number | null>(null)
  const [agreementsData, setAgreementsData] = useState<any[]>([])
  const [paymentsData, setPaymentsData] = useState<any[]>([])

  // Use the actual connected wallet address
  const producerAddress = address 

  // Load data directly for testing
  useEffect(() => {
    const loadData = async () => {
      if (!producerAddress) return
      
      try {
        // Load agreements
        const agreementsResponse = await fetch(`http://localhost:3001/api/agreements/producer/${producerAddress}`)
        const agreementsData = await agreementsResponse.json()
        
        if (agreementsData.success && agreementsData.data.agreements) {
          setAgreementsData(agreementsData.data.agreements)
          // Set default to latest agreement
          if (agreementsData.data.agreements.length > 0 && !selectedAgreementId) {
            const latest = agreementsData.data.agreements.reduce((latest: any, current: any) => 
              current.id > latest.id ? current : latest
            )
            setSelectedAgreementId(latest.id)
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    
    loadData()
  }, [producerAddress, selectedAgreementId])

  // Load payments when agreement is selected
  useEffect(() => {
    const loadPayments = async () => {
      if (selectedAgreementId) {
        try {
          const response = await fetch(`http://localhost:3001/api/payments/agreement/${selectedAgreementId}`)
          const data = await response.json()
          if (data.success && data.data) {
            // Update payments state directly
            setPaymentsData(data.data)
          }
        } catch (error) {
          console.error('Error loading payments:', error)
        }
      }
    }
    
    loadPayments()
  }, [selectedAgreementId])

  useEffect(() => {
    if (payments && agreements) {
      calculateStats()
      processPaymentDetails()
    }
  }, [payments, agreements])

  const calculateStats = async () => {
    if (!payments || !agreements) return

    const producerAgreements = agreements.filter(agreement => 
      agreement.producer_address === producerAddress
    )

    const completedPayments = payments.filter(payment => payment.status === 'completed')
    const pendingPayments = payments.filter(payment => payment.status === 'pending')
    
    const totalReceived = completedPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const averagePayment = completedPayments.length > 0 
      ? totalReceived / completedPayments.length 
      : 0

    const lastPayment = completedPayments
      .sort((a, b) => new Date(b.processed_at || '').getTime() - new Date(a.processed_at || '').getTime())[0]

    setStats({
      totalReceived,
      pendingPayments: pendingPayments.length,
      completedPayments: completedPayments.length,
      averagePayment,
      lastPaymentDate: lastPayment?.processed_at,
      totalAgreements: producerAgreements.length,
      activeAgreements: producerAgreements.filter(a => a.is_active).length
    })
  }

  const processPaymentDetails = () => {
    if (!payments || !agreements) return

    const details: PaymentDetail[] = payments.map(payment => {
      const agreement = agreements.find(a => a.id === payment.agreement_id)
      return {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        agreementId: payment.agreement_id,
        score: payment.score,
        auditHash: payment.audit_hash,
        processedAt: payment.processed_at,
        createdAt: payment.created_at,
        producerAddress: producerAddress || 'Unknown', // Use mock address
        agreementDetails: agreement ? {
          producerName: agreement.producer_name,
          hectares: agreement.hectares,
          baseValue: agreement.base_value
        } : undefined
      }
    })

    setPaymentDetails(details)
  }

  const getStatusIcon = (status: string) => {
    const iconClass = getStatusIconClass(status)
    switch (status) {
      case 'completed':
        return <FaCheckCircle className={iconClass} />
      case 'pending':
        return <FaClock className={iconClass} />
      case 'failed':
        return <FaExclamationTriangle className={iconClass} />
      default:
        return <FaClock className={iconClass} />
    }
  }

  // Using utility functions from utils/helpers.ts

  const filteredPayments = selectedStatus === 'all' 
    ? paymentDetails 
    : paymentDetails.filter(payment => payment.status === selectedStatus)

  if (paymentsLoading || agreementsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading payments...</span>
        </div>
      </div>
    )
  }

  return (
    <PageLayout 
      title="Payments & Finance" 
      subtitle="Manage your PES payments and financial overview"
    >
      <div className="space-y-6">

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FaDollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Received</h3>
                <p className="text-2xl font-bold text-gray-900">{formatHBAR(stats.totalReceived)}</p>
                <p className="text-sm text-gray-600">
                  {stats.lastPaymentDate ? `Last: ${formatDate(stats.lastPaymentDate)}` : 'No payments yet'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FaClock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Pending Payments</h3>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                <p className="text-sm text-gray-600">Awaiting processing</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FaCheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Completed Payments</h3>
                <p className="text-2xl font-bold text-green-600">{stats.completedPayments}</p>
                <p className="text-sm text-gray-600">Successfully processed</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FaWallet className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Average Payment</h3>
                <p className="text-2xl font-bold text-blue-600">{formatHBAR(stats.averagePayment)}</p>
                <p className="text-sm text-gray-600">Per transaction</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agreement Overview */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Agreement Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Total Agreements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAgreements}</p>
              </div>
              <FaFileContract className="h-8 w-8 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Active Agreements</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeAgreements}</p>
              </div>
              <FaCheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>
      )}

      {/* Agreement Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Select Agreement</h2>
        <div className="flex items-center space-x-4">
          <label htmlFor="agreement-select" className="text-sm font-medium text-gray-700">
            Agreement:
          </label>
          <select
            id="agreement-select"
            value={selectedAgreementId || ''}
            onChange={(e) => setSelectedAgreementId(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an agreement...</option>
            {agreementsData?.map((agreement) => (
              <option key={agreement.id} value={agreement.id}>
                Agreement #{agreement.id} - {agreement.producer_name} ({agreement.hectares} hectares)
              </option>
            ))}
          </select>
          {selectedAgreementId && (
            <div className="text-sm text-gray-600">
              Showing payments for Agreement #{selectedAgreementId}
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Payment History</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedStatus === 'all' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedStatus('completed')}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedStatus === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setSelectedStatus('pending')}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedStatus === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                Pending
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {paymentsData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No payments found</p>
          ) : (
            <div className="space-y-4">
              {paymentsData
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(payment.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-lg">{formatHBAR(payment.amount)}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColorClasses(payment.status)}`}>
                            {payment.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Agreement #{payment.agreement_id}
                        </div>
                        {payment.score && (
                          <div className="text-xs text-gray-400 mt-1">
                            Score: {(payment.score * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {payment.processed_at ? formatDate(payment.processed_at) : 'Pending'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Created: {formatDate(payment.created_at)}
                      </p>
                      {payment.audit_hash && (
                        <div className="mt-2 space-y-1">
                          <HashDisplay 
                            hash={payment.audit_hash}
                            label="Audit Hash"
                            type="audit"
                            className="text-xs"
                          />
                          <div className="flex items-center text-xs text-gray-400">
                            <FaDatabase className="mr-1" />
                            <span>Stored on Hedera HFS</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Blockchain Records Section */}
      <BlockchainRecords 
        userType="producer" 
        userAddress={producerAddress} 
      />

      {/* Payment Blockchain Details */}
      {paymentsData.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <FaLink className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Blockchain Records</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Payment transactions and audit data stored on Hedera DLT
            </p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {paymentsData
                .filter(payment => payment.audit_hash)
                .map((payment) => (
                  <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-lg">{formatHBAR(payment.amount)}</span>
                        <span className="text-sm text-gray-500">Agreement #{payment.agreement_id}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColorClasses(payment.status)}`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Audit Information</h4>
                        <div className="space-y-2">
                          {payment.audit_hash && (
                            <HashDisplay 
                              hash={payment.audit_hash}
                              label="Audit Hash"
                              type="audit"
                              className="text-sm"
                            />
                          )}
                          {payment.score && (
                            <div className="text-sm">
                              <span className="text-gray-600">Quality Score: </span>
                              <span className="font-medium text-green-600">
                                {(payment.score * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Blockchain Storage</h4>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <FaDatabase className="mr-2" />
                            <span>Hedera File Service (HFS)</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FaLink className="mr-2" />
                            <span>Hedera Consensus Service (HCS)</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Immutable audit trail
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </PageLayout>
  )
}

export default Payments
