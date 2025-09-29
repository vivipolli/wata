import React, { useState, useEffect } from 'react'
import { useAgreements, usePayments } from '../hooks'
import HashDisplay from './HashDisplay'
import { hederaService } from '../services/hedera'
import BlockchainRecords from './BlockchainRecords'
import { formatDate, formatHBAR, getStatusColor } from '../utils'
import PageLayout from './layout/PageLayout'

interface InvestorStats {
  totalInvested: number
  totalPaidOut: number
  activeInvestments: number
  averageImpact: number
  totalHectares: number
  roi: number
}

interface InvestmentAgreement {
  id: number
  producerName: string
  hectares: number
  baseValue: number
  isActive: boolean
  lastScore?: number
  totalInvested?: number
  totalPaid?: number
  governanceMode?: string
  investorAddress?: string
}

interface ImpactMetrics {
  totalHectaresProtected: number
  averageWaterQuality: number
  producersSupported: number
  paymentsExecuted: number
  environmentalScore: number
}

const InvestorDashboard: React.FC = () => {
  const { agreements, loading: agreementsLoading } = useAgreements()
  const { payments, loading: paymentsLoading } = usePayments()
  const [stats, setStats] = useState<InvestorStats | null>(null)
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetrics | null>(null)
  const [investmentAgreements, setInvestmentAgreements] = useState<InvestmentAgreement[]>([])
  const [selectedAgreement, setSelectedAgreement] = useState<number | null>(null)
  const [investmentAmount, setInvestmentAmount] = useState<string>('')

  // Mock investor address - in real app, this would come from authentication

  useEffect(() => {
    if (agreements && payments) {
      calculateStats()
      calculateImpactMetrics()
      filterInvestmentAgreements()
    }
  }, [agreements, payments])

  const calculateStats = () => {
    if (!agreements || !payments) return

    // For now, show all agreements as potential investments
    const investmentAgreements = agreements

    const totalInvested = 0 // Mock value - would need to track actual investments
    const totalPaidOut = payments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0)

    const activeInvestments = investmentAgreements.filter(agreement => agreement.is_active).length

    const scores = [] // Mock - would need to get from readings
    const averageImpact = 0 // Mock value

    const totalHectares = investmentAgreements.reduce((sum, agreement) => sum + agreement.hectares, 0)

    const roi = 0 // Mock value

    setStats({
      totalInvested,
      totalPaidOut,
      activeInvestments,
      averageImpact,
      totalHectares,
      roi
    })
  }

  const calculateImpactMetrics = () => {
    if (!agreements || !payments) return

    const investmentAgreements = agreements

    const totalHectaresProtected = investmentAgreements.reduce((sum, agreement) => sum + agreement.hectares, 0)
    
    const scores: number[] = [] // Mock - would need to get from readings

    const averageWaterQuality = 0 // Mock value

    const producersSupported = new Set(investmentAgreements.map(agreement => agreement.producer_address)).size

    const paymentsExecuted = payments.filter(payment => payment.status === 'completed').length

    const environmentalScore = Math.min(100, (averageWaterQuality * 0.7) + (producersSupported * 5) + (paymentsExecuted * 2))

    setImpactMetrics({
      totalHectaresProtected,
      averageWaterQuality,
      producersSupported,
      paymentsExecuted,
      environmentalScore
    })
  }

  const filterInvestmentAgreements = () => {
    if (!agreements) return

    const investmentAgreements = agreements
      .map(agreement => ({
        id: agreement.id,
        producerName: agreement.producer_name,
        hectares: agreement.hectares,
        baseValue: agreement.base_value,
        isActive: agreement.is_active,
        lastScore: undefined, // Mock - would need to get from readings
        totalInvested: 0, // Mock - would need to track investments
        totalPaid: 0, // Mock - would need to track payments
        governanceMode: 'AUTO', // Mock value
        investorAddress: undefined // Mock - would need to track investor
      }))

    setInvestmentAgreements(investmentAgreements)
  }

  const handleInvestment = async (agreementId: number) => {
    const amount = parseFloat(investmentAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid investment amount')
      return
    }

    try {
      const result = await hederaService.transferHBAR('0xMockAddress', amount)
      if (result.success) {
        alert(`Investment of ${amount} HBAR successful! Transaction: ${result.transactionHash}`)
        setInvestmentAmount('')
        // Refresh data
        window.location.reload()
      } else {
        alert(`Investment failed: ${result.error}`)
      }
    } catch (error) {
      alert(`Investment error: ${error}`)
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

  const getROIColor = (roi: number): string => {
    if (roi > 0) return 'text-green-600'
    if (roi === 0) return 'text-gray-600'
    return 'text-red-600'
  }

  // Using utility functions from utils/helpers.ts

  const getAgreementPayments = (agreementId: number) => {
    return payments.filter(payment => payment.agreement_id === agreementId)
  }

  if (agreementsLoading || paymentsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading investor dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <PageLayout 
      title="Investor Dashboard" 
      subtitle="Track your environmental impact investments"
    >
      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Invested</h3>
            <p className="text-2xl font-bold text-blue-600">{formatHBAR(stats.totalInvested)}</p>
            <p className="text-sm text-gray-600">{stats.activeInvestments} active investments</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Paid Out</h3>
            <p className="text-2xl font-bold text-green-600">{formatHBAR(stats.totalPaidOut)}</p>
            <p className="text-sm text-gray-600">To producers</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">ROI</h3>
            <p className={`text-2xl font-bold ${getROIColor(stats.roi)}`}>
              {stats.roi.toFixed(2)}%
            </p>
            <p className="text-sm text-gray-600">Return on investment</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Average Impact</h3>
            <p className={`text-2xl font-bold ${getScoreColor(stats.averageImpact)}`}>
              {stats.averageImpact.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">{stats.totalHectares} hectares protected</p>
          </div>
        </div>
      )}

      {/* Impact Metrics */}
      {impactMetrics && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Environmental Impact</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{impactMetrics.totalHectaresProtected}</p>
                <p className="text-sm text-gray-600">Hectares Protected</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{impactMetrics.averageWaterQuality.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Avg Water Quality</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{impactMetrics.producersSupported}</p>
                <p className="text-sm text-gray-600">Producers Supported</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{impactMetrics.paymentsExecuted}</p>
                <p className="text-sm text-gray-600">Payments Executed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{impactMetrics.environmentalScore.toFixed(0)}</p>
                <p className="text-sm text-gray-600">Environmental Score</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Investment Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Agreements */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Investment Opportunities</h2>
          </div>
          <div className="p-6">
            {agreements.filter(agreement => agreement.is_active).length === 0 ? (
              <p className="text-gray-500 text-center py-8">No available investment opportunities</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {agreements
                  .filter(agreement => agreement.is_active)
                  .map((agreement) => (
                    <div key={agreement.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{agreement.producer_name}</h3>
                          <p className="text-sm text-gray-500">
                            {agreement.hectares} ha • {formatHBAR(agreement.base_value)}/ha
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Available
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="HBAR amount"
                          value={investmentAmount}
                          onChange={(e) => setInvestmentAmount(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleInvestment(agreement.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          Invest
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Your Investments */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Investments</h2>
          </div>
          <div className="p-6">
            {investmentAgreements.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No investments yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {investmentAgreements.map((agreement) => (
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
                          {agreement.hectares} ha • {formatHBAR(agreement.baseValue)}/ha
                        </p>
                        <p className="text-xs text-gray-400">
                          Invested: {formatHBAR(agreement.totalInvested || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        {agreement.lastScore !== undefined && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreBadge(agreement.lastScore)}`}>
                            {agreement.lastScore.toFixed(1)}%
                          </span>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Paid: {formatHBAR(agreement.totalPaid || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Payment History</h2>
        </div>
        <div className="p-6">
          {payments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No payments executed yet</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {payments
                .filter(payment => payment.status === 'completed')
                .sort((a, b) => new Date(b.processed_at || '').getTime() - new Date(a.processed_at || '').getTime())
                .slice(0, 10)
                .map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{formatHBAR(payment.amount)}</span>
                        <span className="text-sm text-gray-500">Agreement #{payment.agreement_id}</span>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          N/A
                        </span>
                      </div>
                      {/* Audit hash would be available in real implementation */}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {payment.processed_at ? formatDate(payment.processed_at) : 'Pending'}
                      </p>
                      <p className="text-xs text-green-600 font-medium">Completed</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Blockchain Records Section */}
      <div className="mt-6">
        <BlockchainRecords 
          userType="investor" 
          userAddress="0xMockInvestorAddress" 
        />
      </div>
    </PageLayout>
  )
}

export default InvestorDashboard
