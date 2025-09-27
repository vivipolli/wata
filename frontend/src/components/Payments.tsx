import React, { useState, useEffect } from 'react'
import { FaDollarSign, FaWallet, FaHistory, FaCheckCircle, FaClock, FaExclamationTriangle, FaFileContract } from 'react-icons/fa'
import { useAccount } from 'wagmi'
import { usePayments, useAgreements } from '../hooks'
import { formatNumber, formatDate, formatHBAR, getStatusColor } from '../utils'
import HashDisplay from './HashDisplay'
import BlockchainRecords from './BlockchainRecords'

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
  const { payments, loading: paymentsLoading, getPaymentStats } = usePayments()
  const { agreements, loading: agreementsLoading } = useAgreements()
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetail[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Use the actual connected wallet address
  const producerAddress = address 

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
        score: undefined, // Not available in Payment interface
        auditHash: undefined, // Not available in Payment interface
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
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-600" />
      case 'pending':
        return <FaClock className="text-yellow-600" />
      case 'failed':
        return <FaExclamationTriangle className="text-red-600" />
      default:
        return <FaClock className="text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments & Finance</h1>
        <p className="text-gray-600">Manage your PES payments and financial overview</p>
      </div>

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
          {filteredPayments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No payments found</p>
          ) : (
            <div className="space-y-4">
              {filteredPayments
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(payment.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-lg">{formatHBAR(payment.amount)}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                            {payment.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Agreement #{payment.agreementId}
                          {payment.agreementDetails && (
                            <span> • {payment.agreementDetails.producerName}</span>
                          )}
                        </div>
                        {payment.score && (
                          <div className="text-xs text-gray-400 mt-1">
                            Score: {payment.score.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {payment.processedAt ? formatDate(payment.processedAt) : 'Pending'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Created: {formatDate(payment.createdAt)}
                      </p>
                      {payment.auditHash && (
                        <div className="mt-2">
                          <HashDisplay 
                            hash={payment.auditHash}
                            label="Audit"
                            type="audit"
                            className="text-xs"
                          />
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
    </div>
  )
}

export default Payments
