import React, { useState, useEffect } from 'react'
import { useAgreements, usePayments } from '../hooks'
import WalletWidget from './WalletWidget'
import HashDisplay from './HashDisplay'
import { hederaService } from '../services/hedera'

interface ProducerStats {
  totalAgreements: number
  activeAgreements: number
  totalReceived: number
  averageScore: number
  lastPaymentDate?: string
  totalHectares: number
}

interface ProducerAgreement {
  id: number
  producerName: string
  hectares: number
  baseValue: number
  isActive: boolean
  lastScore?: number
  lastAuditHash?: string
  lastUpdateTimestamp?: string
  totalPaid?: number
  governanceMode?: string
}

const ProducerDashboard: React.FC = () => {
  const { agreements, loading: agreementsLoading } = useAgreements()
  const { payments, loading: paymentsLoading } = usePayments()
  const [stats, setStats] = useState<ProducerStats | null>(null)
  const [producerAgreements, setProducerAgreements] = useState<ProducerAgreement[]>([])
  const [selectedAgreement, setSelectedAgreement] = useState<number | null>(null)

  // Mock producer address - in real app, this would come from authentication
  const producerAddress = "0.0.5904577"

  useEffect(() => {
    if (agreements && payments) {
      calculateStats()
      filterProducerAgreements()
    }
  }, [agreements, payments])

  const calculateStats = () => {
    if (!agreements || !payments) return

    const producerAgreements = agreements.filter(agreement => 
      agreement.producerAddress === producerAddress
    )

    const activeAgreements = producerAgreements.filter(agreement => agreement.isActive)
    
    const totalReceived = payments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0)

    const scores = producerAgreements
      .map(agreement => agreement.lastScore)
      .filter(score => score !== undefined && score > 0)

    const averageScore = scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 0

    const lastPayment = payments
      .filter(payment => payment.status === 'completed')
      .sort((a, b) => new Date(b.processedAt || '').getTime() - new Date(a.processedAt || '').getTime())[0]

    const totalHectares = producerAgreements.reduce((sum, agreement) => sum + agreement.hectares, 0)

    setStats({
      totalAgreements: producerAgreements.length,
      activeAgreements: activeAgreements.length,
      totalReceived,
      averageScore,
      lastPaymentDate: lastPayment?.processedAt,
      totalHectares
    })
  }

  const filterProducerAgreements = () => {
    if (!agreements) return

    const producerAgreements = agreements
      .filter(agreement => agreement.producerAddress === producerAddress)
      .map(agreement => ({
        id: agreement.id,
        producerName: agreement.producerName,
        hectares: agreement.hectares,
        baseValue: agreement.baseValue,
        isActive: agreement.isActive,
        lastScore: agreement.lastScore,
        lastAuditHash: agreement.lastAuditHash,
        lastUpdateTimestamp: agreement.lastUpdateTimestamp,
        totalPaid: agreement.totalPaid,
        governanceMode: agreement.governanceMode
      }))

    setProducerAgreements(producerAgreements)
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

  const formatHBAR = (amount: number): string => {
    return `${amount.toFixed(4)} HBAR`
  }

  const getAgreementPayments = (agreementId: number) => {
    return payments.filter(payment => payment.agreementId === agreementId)
  }

  if (agreementsLoading || paymentsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading producer dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Producer Dashboard</h1>
          <p className="text-gray-600">Monitor your water quality agreements and payments</p>
        </div>
        <WalletWidget accountId={producerAddress} />
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Agreements</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalAgreements}</p>
            <p className="text-sm text-gray-600">{stats.totalHectares} hectares</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Agreements</h3>
            <p className="text-2xl font-bold text-green-600">{stats.activeAgreements}</p>
            <p className="text-sm text-gray-600">Currently monitored</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Received</h3>
            <p className="text-2xl font-bold text-blue-600">{formatHBAR(stats.totalReceived)}</p>
            <p className="text-sm text-gray-600">
              {stats.lastPaymentDate ? `Last: ${formatDate(stats.lastPaymentDate)}` : 'No payments yet'}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Average Score</h3>
            <p className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
              {stats.averageScore.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Quality performance</p>
          </div>
        </div>
      )}

      {/* Agreements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agreement List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Agreements</h2>
          </div>
          <div className="p-6">
            {producerAgreements.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No agreements found</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {producerAgreements.map((agreement) => (
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
                        <h3 className="font-medium text-gray-900">Agreement #{agreement.id}</h3>
                        <p className="text-sm text-gray-500">
                          {agreement.hectares} ha • {formatHBAR(agreement.baseValue)}/ha
                        </p>
                        <p className="text-xs text-gray-400">
                          Mode: {agreement.governanceMode || 'AUTO'}
                        </p>
                      </div>
                      <div className="text-right">
                        {agreement.lastScore !== undefined && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreBadge(agreement.lastScore)}`}>
                            {agreement.lastScore.toFixed(1)}%
                          </span>
                        )}
                        <p className={`text-xs mt-1 ${agreement.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {agreement.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                    {agreement.lastAuditHash && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <HashDisplay 
                          hash={agreement.lastAuditHash}
                          label="Last Audit"
                          type="audit"
                          className="text-xs"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Agreement Details */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Agreement Details
              {selectedAgreement && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (#{selectedAgreement})
                </span>
              )}
            </h2>
          </div>
          <div className="p-6">
            {!selectedAgreement ? (
              <p className="text-gray-500 text-center py-8">Select an agreement to view details</p>
            ) : (
              (() => {
                const agreement = producerAgreements.find(a => a.id === selectedAgreement)
                const agreementPayments = getAgreementPayments(selectedAgreement)
                
                if (!agreement) return <p className="text-gray-500 text-center py-8">Agreement not found</p>
                
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Hectares</p>
                        <p className="font-medium">{agreement.hectares} ha</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Base Value</p>
                        <p className="font-medium">{formatHBAR(agreement.baseValue)}/ha</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Score</p>
                        <p className={`font-medium ${getScoreColor(agreement.lastScore || 0)}`}>
                          {agreement.lastScore ? `${agreement.lastScore.toFixed(1)}%` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Paid</p>
                        <p className="font-medium">{formatHBAR(agreement.totalPaid || 0)}</p>
                      </div>
                    </div>
                    
                    {agreement.lastAuditHash && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Last Audit Hash</p>
                        <HashDisplay 
                          hash={agreement.lastAuditHash}
                          label="Audit Hash"
                          type="audit"
                          className="text-sm"
                        />
                      </div>
                    )}
                    
                    {agreement.lastUpdateTimestamp && (
                      <div>
                        <p className="text-sm text-gray-500">Last Update</p>
                        <p className="text-sm">{formatDate(agreement.lastUpdateTimestamp)}</p>
                      </div>
                    )}
                    
                    {agreementPayments.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Recent Payments</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {agreementPayments.slice(0, 3).map((payment) => (
                            <div key={payment.id} className="flex justify-between items-center text-sm">
                              <span>{formatHBAR(payment.amount)}</span>
                              <span className="text-gray-500">
                                {payment.processedAt ? formatDate(payment.processedAt) : 'Pending'}
                              </span>
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

      {/* Recent Payments */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Payments</h2>
        </div>
        <div className="p-6">
          {payments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No payments received yet</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {payments
                .filter(payment => payment.status === 'completed')
                .sort((a, b) => new Date(b.processedAt || '').getTime() - new Date(a.processedAt || '').getTime())
                .slice(0, 10)
                .map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{formatHBAR(payment.amount)}</span>
                        <span className="text-sm text-gray-500">Agreement #{payment.agreementId}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          payment.score && payment.score >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {payment.score ? `${payment.score.toFixed(1)}%` : 'N/A'}
                        </span>
                      </div>
                      {payment.auditHash && (
                        <HashDisplay 
                          hash={payment.auditHash}
                          label="Audit"
                          type="audit"
                          className="text-xs mt-1"
                        />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {payment.processedAt ? formatDate(payment.processedAt) : 'Pending'}
                      </p>
                      <p className="text-xs text-green-600 font-medium">Completed</p>
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

export default ProducerDashboard
