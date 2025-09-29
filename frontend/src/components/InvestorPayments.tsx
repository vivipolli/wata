import React, { useState, useEffect } from 'react'
import { FaWallet, FaCheckCircle, FaClock, FaExclamationTriangle, FaFileContract, FaArrowUp, FaUsers, FaChartLine, FaHandHoldingUsd } from 'react-icons/fa'
import { useAccount } from 'wagmi'
import { usePayments, useAgreements } from '../hooks'
import { formatDate, formatHBAR, getStatusIconClass, getStatusColorClasses } from '../utils'
import HashDisplay from './HashDisplay'
import BlockchainRecords from './BlockchainRecords'
import PageLayout from './layout/PageLayout'

interface InvestorPaymentStats {
  totalInvested: number
  totalReturns: number
  activeInvestments: number
  completedInvestments: number
  averageROI: number
  lastInvestmentDate?: string
  totalAgreements: number
  activeAgreements: number
  pendingReturns: number
}

interface InvestmentDetail {
  id: number
  agreementId: number
  amount: number
  status: string
  score?: number
  auditHash?: string
  processedAt?: string
  createdAt: string
  producerAddress: string
  agreementDetails?: {
    producerName: string
    hectares: number
    baseValue: number
    location?: string
  }
  investmentType: 'initial' | 'additional'
  expectedReturn?: number
  actualReturn?: number
}

const InvestorPayments: React.FC = () => {
  const { address } = useAccount()
  const { payments, loading: paymentsLoading, getPaymentStats } = usePayments()
  const { agreements, loading: agreementsLoading } = useAgreements()
  const [stats, setStats] = useState<InvestorPaymentStats | null>(null)
  const [investmentDetails, setInvestmentDetails] = useState<InvestmentDetail[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Use the actual connected wallet address
  const investorAddress = address 

  useEffect(() => {
    if (payments && agreements) {
      calculateStats()
      processInvestmentDetails()
    }
  }, [payments, agreements])

  const calculateStats = async () => {
    if (!payments || !agreements) return

    // Filter agreements where this investor is involved
    // Note: For now, we'll show all agreements as investor can invest in any
    const investorAgreements = agreements.filter(agreement => 
      agreement.producer_address !== investorAddress
    )

    // Filter payments related to investor's agreements
    const investorPayments = payments.filter(payment => 
      investorAgreements.some(agreement => agreement.id === payment.agreement_id)
    )

    const completedPayments = investorPayments.filter(payment => payment.status === 'completed')
    const pendingPayments = investorPayments.filter(payment => payment.status === 'pending')
    
    const totalInvested = investorAgreements.reduce((sum, agreement) => sum + (agreement.base_value * agreement.hectares), 0)
    const totalReturns = completedPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const pendingReturns = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0)
    
    const averageROI = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0

    const lastInvestment = investorAgreements
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

    setStats({
      totalInvested,
      totalReturns,
      activeInvestments: investorAgreements.filter(a => a.is_active).length,
      completedInvestments: completedPayments.length,
      averageROI,
      lastInvestmentDate: lastInvestment?.created_at,
      totalAgreements: investorAgreements.length,
      activeAgreements: investorAgreements.filter(a => a.is_active).length,
      pendingReturns
    })
  }

  const processInvestmentDetails = () => {
    if (!payments || !agreements) return

    // Get agreements where this investor is involved
    // Note: For now, we'll show all agreements as investor can invest in any
    const investorAgreements = agreements.filter(agreement => 
      agreement.producer_address !== investorAddress
    )

    // Get payments related to investor's agreements
    const investorPayments = payments.filter(payment => 
      investorAgreements.some(agreement => agreement.id === payment.agreement_id)
    )

    const details: InvestmentDetail[] = investorPayments.map(payment => {
      const agreement = agreements.find(a => a.id === payment.agreement_id)
      return {
        id: payment.id,
        agreementId: payment.agreement_id,
        amount: payment.amount,
        status: payment.status,
        score: undefined, // Not available in Payment interface
        auditHash: undefined, // Not available in Payment interface
        processedAt: payment.processed_at,
        createdAt: payment.created_at,
        producerAddress: agreement?.producer_address || 'Unknown',
        agreementDetails: agreement ? {
          producerName: agreement.producer_name,
          hectares: agreement.hectares,
          baseValue: agreement.base_value,
          location: agreement.location_lat && agreement.location_lng 
            ? `${agreement.location_lat.toFixed(4)}, ${agreement.location_lng.toFixed(4)}`
            : 'Not specified'
        } : undefined,
        investmentType: 'initial', // Default for now
        expectedReturn: agreement ? agreement.base_value * agreement.hectares : undefined,
        actualReturn: payment.status === 'completed' ? payment.amount : undefined
      }
    })

    setInvestmentDetails(details)
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

  const filteredInvestments = selectedStatus === 'all' 
    ? investmentDetails 
    : investmentDetails.filter(investment => investment.status === selectedStatus)

  if (paymentsLoading || agreementsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading investment data...</span>
        </div>
      </div>
    )
  }

  return (
    <PageLayout 
      title="Investment Portfolio" 
      subtitle="Track your PES investments and returns"
    >
      <div className="space-y-6">

      {/* Investment Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FaHandHoldingUsd className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Invested</h3>
                <p className="text-2xl font-bold text-gray-900">{formatHBAR(stats.totalInvested)}</p>
                <p className="text-sm text-gray-600">
                  {stats.lastInvestmentDate ? `Last: ${formatDate(stats.lastInvestmentDate)}` : 'No investments yet'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FaArrowUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Returns</h3>
                <p className="text-2xl font-bold text-green-600">{formatHBAR(stats.totalReturns)}</p>
                <p className="text-sm text-gray-600">From completed payments</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FaClock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Pending Returns</h3>
                <p className="text-2xl font-bold text-yellow-600">{formatHBAR(stats.pendingReturns)}</p>
                <p className="text-sm text-gray-600">Awaiting processing</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FaChartLine className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Average ROI</h3>
                <p className="text-2xl font-bold text-purple-600">{stats.averageROI.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Return on investment</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Overview */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Portfolio Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Active Investments</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeInvestments}</p>
              </div>
              <FaUsers className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Total Agreements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAgreements}</p>
              </div>
              <FaFileContract className="h-8 w-8 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Completed Returns</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completedInvestments}</p>
              </div>
              <FaCheckCircle className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>
      )}

      {/* Investment History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Investment History</h2>
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
          {filteredInvestments.length === 0 ? (
            <div className="text-center py-12">
              <FaWallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Investments Found</h3>
              <p className="text-gray-500">Start investing in PES agreements to see your returns here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvestments
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(investment.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-lg">{formatHBAR(investment.amount)}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColorClasses(investment.status)}`}>
                            {investment.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Agreement #{investment.agreementId}
                          {investment.agreementDetails && (
                            <span> • {investment.agreementDetails.producerName}</span>
                          )}
                        </div>
                        {investment.agreementDetails && (
                          <div className="text-xs text-gray-400 mt-1">
                            {investment.agreementDetails.hectares} hectares • {investment.agreementDetails.location}
                          </div>
                        )}
                        {investment.score && (
                          <div className="text-xs text-gray-400 mt-1">
                            Score: {investment.score.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {investment.processedAt ? formatDate(investment.processedAt) : 'Pending'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Created: {formatDate(investment.createdAt)}
                      </p>
                      {investment.expectedReturn && investment.actualReturn && (
                        <div className="text-xs text-gray-400 mt-1">
                          ROI: {((investment.actualReturn / investment.expectedReturn) * 100).toFixed(1)}%
                        </div>
                      )}
                      {investment.auditHash && (
                        <div className="mt-2">
                          <HashDisplay 
                            hash={investment.auditHash}
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
        userType="investor" 
        userAddress={investorAddress} 
      />
      </div>
    </PageLayout>
  )
}

export default InvestorPayments
