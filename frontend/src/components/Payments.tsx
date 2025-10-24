import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  FaDollarSign,
  FaWallet,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaFileContract,
  FaLink,
  FaDatabase
} from 'react-icons/fa'
import { useAccount } from 'wagmi'
import {
  formatNumber,
  formatDate,
  formatHBAR,
  getStatusIconClass,
  getStatusColorClasses,
  getHederaExplorerUrl,
  getHederaFileUrl
} from '../utils'
import HashDisplay from './HashDisplay'
import PageLayout from './layout/PageLayout'
import apiClient from '../services/api'
import { blockchainRecordsService, type BlockchainRecord } from '../services/blockchainRecords'

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

const mapPaymentDetail = (payment: any, fallbackProducerAddress?: string): PaymentDetail => {
  const amount = typeof payment.amount === 'number' ? payment.amount : Number(payment.amount ?? 0)
  const score = typeof payment.score === 'number' ? payment.score : Number(payment.score ?? NaN)

  return {
    id: payment.id,
    amount: Number.isNaN(amount) ? 0 : amount,
    status: payment.status ?? 'pending',
    agreementId: payment.agreement_id ?? payment.agreementId ?? 0,
    score: Number.isNaN(score) ? undefined : score,
    auditHash: payment.audit_hash ?? payment.auditHash ?? undefined,
    processedAt: payment.processed_at ?? payment.processedAt ?? undefined,
    createdAt: payment.created_at ?? payment.createdAt ?? new Date().toISOString(),
    producerAddress: payment.producer_address ?? payment.producerAddress ?? fallbackProducerAddress ?? 'Unknown',
    agreementDetails: payment.agreement
      ? {
          producerName: payment.agreement.producer_name,
          hectares: payment.agreement.hectares,
          baseValue: payment.agreement.base_value
        }
      : undefined
  }
}

const Payments: React.FC = () => {
  const { address } = useAccount()
  const producerAddress = address ?? null

  const [producerAgreements, setProducerAgreements] = useState<any[]>([])
  const [agreementsLoading, setAgreementsLoading] = useState<boolean>(false)
  const [agreementsError, setAgreementsError] = useState<string | null>(null)

  const [producerPayments, setProducerPayments] = useState<PaymentDetail[]>([])
  const [producerPaymentsLoading, setProducerPaymentsLoading] = useState<boolean>(false)
  const [producerPaymentsError, setProducerPaymentsError] = useState<string | null>(null)

  const [agreementPayments, setAgreementPayments] = useState<PaymentDetail[]>([])
  const [agreementPaymentsLoading, setAgreementPaymentsLoading] = useState<boolean>(false)
  const [agreementPaymentsError, setAgreementPaymentsError] = useState<string | null>(null)

  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedAgreementId, setSelectedAgreementId] = useState<number | null>(null)

  const [blockchainRecords, setBlockchainRecords] = useState<BlockchainRecord[]>([])
  const [blockchainLoading, setBlockchainLoading] = useState<boolean>(false)
  const [blockchainError, setBlockchainError] = useState<string | null>(null)

  const isInitialLoading = agreementsLoading || producerPaymentsLoading

  const fetchProducerData = useCallback(async () => {
    if (!producerAddress) return

    setAgreementsLoading(true)
    setProducerPaymentsLoading(true)
    setAgreementsError(null)
    setProducerPaymentsError(null)

    try {
      const [agreementsResponse, paymentsResponse] = await Promise.all([
        apiClient.get(`/agreements/producer/${producerAddress}`),
        apiClient.get(`/payments/user-payments/${producerAddress}`)
      ])

      const agreementsPayload = agreementsResponse.data?.data?.agreements ?? agreementsResponse.data?.data ?? []
      setProducerAgreements(Array.isArray(agreementsPayload) ? agreementsPayload : [])

      setSelectedAgreementId((prev) => {
        if (prev != null || agreementsPayload.length === 0) return prev
        const latest = agreementsPayload.reduce((currentLatest: any, agreement: any) => {
          if (!currentLatest) return agreement
          return agreement.id > currentLatest.id ? agreement : currentLatest
        }, agreementsPayload[0])
        return latest?.id ?? null
      })

      const paymentsPayload = paymentsResponse.data?.data?.payments ?? paymentsResponse.data?.data ?? paymentsResponse.data ?? []
      const mappedPayments = Array.isArray(paymentsPayload)
        ? paymentsPayload.map((payment: any) => mapPaymentDetail(payment, producerAddress ?? undefined))
        : []
      setProducerPayments(mappedPayments)
    } catch (error) {
      console.error('Error loading producer data:', error)
      setAgreementsError('Failed to load agreements')
      setProducerPaymentsError('Failed to load payments data')
    } finally {
      setAgreementsLoading(false)
      setProducerPaymentsLoading(false)
    }
  }, [producerAddress])

  const fetchAgreementPayments = useCallback(async (agreementId: number) => {
    setAgreementPaymentsLoading(true)
    setAgreementPaymentsError(null)

    try {
      const response = await apiClient.get(`/payments/agreement/${agreementId}`)
      const payload = response.data?.data ?? []
      const mapped = Array.isArray(payload)
        ? payload.map((payment: any) => mapPaymentDetail(payment, producerAddress ?? undefined))
        : []
      setAgreementPayments(mapped)
    } catch (error) {
      console.error('Error loading agreement payments:', error)
      setAgreementPaymentsError('Failed to load agreement payments')
      setAgreementPayments([])
    } finally {
      setAgreementPaymentsLoading(false)
    }
  }, [producerAddress])

  const fetchBlockchainRecords = useCallback(async () => {
    if (!producerAddress) return

    setBlockchainLoading(true)
    setBlockchainError(null)

    try {
      const response = await blockchainRecordsService.getUserRecords('producer', producerAddress)
      if (response.success && response.data?.records) {
        setBlockchainRecords(response.data.records)
      } else if (response.error) {
        setBlockchainError(response.error)
      }
    } catch (error) {
      console.error('Error loading blockchain records:', error)
      setBlockchainError('Failed to load blockchain records')
    } finally {
      setBlockchainLoading(false)
    }
  }, [producerAddress])

  useEffect(() => {
    if (!producerAddress) return
    fetchProducerData()
  }, [producerAddress, fetchProducerData])

  useEffect(() => {
    if (!selectedAgreementId) {
      setAgreementPayments([])
      return
    }
    fetchAgreementPayments(selectedAgreementId)
  }, [selectedAgreementId, fetchAgreementPayments])

  useEffect(() => {
    if (!producerAddress) return
    fetchBlockchainRecords()
  }, [producerAddress, fetchBlockchainRecords])

  const stats = useMemo<PaymentStats>(() => {
    const completed = producerPayments.filter((payment) => payment.status === 'completed')
    const pending = producerPayments.filter((payment) => payment.status === 'pending')

    const totalReceived = completed.reduce((sum, payment) => sum + payment.amount, 0)
    const averagePayment = completed.length > 0 ? totalReceived / completed.length : 0

    const lastPayment = completed
      .slice()
      .sort((a, b) => new Date(b.processedAt ?? '').getTime() - new Date(a.processedAt ?? '').getTime())[0]

    return {
      totalReceived,
      pendingPayments: pending.length,
      completedPayments: completed.length,
      averagePayment,
      lastPaymentDate: lastPayment?.processedAt,
      totalAgreements: producerAgreements.length,
      activeAgreements: producerAgreements.filter((agreement: any) => agreement.is_active).length
    }
  }, [producerPayments, producerAgreements])

  const filteredPayments = useMemo(() => {
    if (selectedStatus === 'all') return agreementPayments
    return agreementPayments.filter((payment) => payment.status === selectedStatus)
  }, [agreementPayments, selectedStatus])

  const blockchainSummary = useMemo(() => {
    if (blockchainRecords.length === 0) return null

    const completed = blockchainRecords.filter((record) => record.status === 'completed')
    const pending = blockchainRecords.filter((record) => record.status === 'pending')
    const totalCompletedAmount = completed.reduce((sum, record) => sum + (record.amount ?? 0), 0)
    const averageScore = completed.length > 0
      ? completed.reduce((sum, record) => sum + (record.score ?? 0), 0) / completed.length
      : 0
    const hcsCount = blockchainRecords.filter((record) => Boolean(record.hcsTransactionId)).length
    const hfsCount = blockchainRecords.filter((record) => Boolean(record.hfsFileId)).length

    return {
      completedCount: completed.length,
      pendingCount: pending.length,
      totalCompletedAmount,
      averageScore,
      hcsCount,
      hfsCount
    }
  }, [blockchainRecords])

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

  const formatScore = (score?: number) => {
    if (score == null) return null
    return `${formatNumber(score * 100, 1)}%`
  }

  if (!producerAddress) {
    return (
      <PageLayout title="Payments & Finance" subtitle="Connect your wallet to manage payments">
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <p className="text-gray-600">Please connect your wallet to view payment details.</p>
        </div>
      </PageLayout>
    )
  }

  if (isInitialLoading) {
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
      subtitle="Monitor PES disbursements and on-chain audit records"
    >
      <div className="space-y-6">
        {(agreementsError || producerPaymentsError) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>{agreementsError || producerPaymentsError}</p>
          </div>
        )}

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
                <p className="text-sm text-gray-600">Awaiting validation</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FaCheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Completed Payments</h3>
                <p className="text-2xl font-bold text-green-600">{stats.completedPayments}</p>
                <p className="text-sm text-gray-600">Disbursed successfully</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FaWallet className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Average Payment</h3>
                <p className="text-2xl font-bold text-blue-600">{formatHBAR(stats.averagePayment)}</p>
                <p className="text-sm text-gray-600">Per completed batch</p>
              </div>
            </div>
          </div>
        </div>

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

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Select Agreement</h2>
          <div className="flex items-center space-x-4">
            <label htmlFor="agreement-select" className="text-sm font-medium text-gray-700">
              Agreement:
            </label>
            <select
              id="agreement-select"
              value={selectedAgreementId ?? ''}
              onChange={(event) => {
                const value = event.target.value
                setSelectedAgreementId(value ? parseInt(value, 10) : null)
              }}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an agreement...</option>
              {producerAgreements.map((agreement: any) => (
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
          {agreementPaymentsError && (
            <p className="mt-3 text-sm text-red-600">{agreementPaymentsError}</p>
          )}
        </div>

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
            {agreementPaymentsLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading payments...</span>
              </div>
            ) : filteredPayments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No payments found for this status.</p>
            ) : (
              <div className="space-y-4">
                {filteredPayments
                  .slice()
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
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
                            Agreement #{payment.agreementId}
                          </div>
                          {payment.score != null && (
                            <div className="text-xs text-gray-400 mt-1">Score: {formatScore(payment.score)}</div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {payment.processedAt ? formatDate(payment.processedAt) : 'Pending approval'}
                        </p>
                        <p className="text-xs text-gray-400">Created: {formatDate(payment.createdAt)}</p>
                        {payment.auditHash && (
                          <div className="mt-2 space-y-1">
                            <HashDisplay
                              hash={payment.auditHash}
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

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <FaLink className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Blockchain Records</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Validated payment batches published to Hedera Consensus Service (HCS) and Hedera File Service (HFS)
            </p>
          </div>

          <div className="p-6 space-y-6">
            {blockchainSummary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">Verified Payments</p>
                  <p className="text-2l font-semibold text-blue-900">{blockchainSummary.completedCount}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">On-chain Volume</p>
                  <p className="text-2l font-semibold text-green-900">{formatHBAR(blockchainSummary.totalCompletedAmount)}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-700">Avg. Batch Score</p>
                  <p className="text-2l font-semibold text-purple-900">{formatNumber(blockchainSummary.averageScore * 100, 1)}%</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700">HCS / HFS Records</p>
                  <p className="text-2l font-semibold text-yellow-900">
                    {blockchainSummary.hcsCount} / {blockchainSummary.hfsCount}
                  </p>
                </div>
              </div>
            )}

            {blockchainLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading blockchain records...</span>
              </div>
            ) : blockchainError ? (
              <div className="text-center text-red-600">{blockchainError}</div>
            ) : blockchainRecords.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No blockchain records found yet. Payments appear here after batch validation and audit publication.
              </div>
            ) : (
              <div className="space-y-4">
                {blockchainRecords.map((record) => (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-medium text-lg">{formatHBAR(record.amount ?? 0)}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColorClasses(record.status)}`}>
                            {record.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Agreement #{record.agreementId} · {formatDate(record.processedAt ?? record.createdAt)}
                        </p>
                        {record.score != null && (
                          <p className="text-sm text-gray-500">
                            Quality Score: <span className="font-medium text-green-600">{formatScore(record.score)}</span>
                          </p>
                        )}
                        {record.agreement?.producer_name && (
                          <p className="text-sm text-gray-500">
                            Producer: {record.agreement.producer_name}
                          </p>
                        )}
                      </div>

                      <div className="text-right space-y-2">
                        {record.hcsTransactionId && (
                          <a
                            href={getHederaExplorerUrl(record.hcsTransactionId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                          >
                            HCS Message
                            <FaLink className="h-3 w-3 ml-2" />
                          </a>
                        )}
                        {record.hfsFileId && (
                          <a
                            href={getHederaFileUrl(record.hfsFileId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                          >
                            HFS Report
                            <FaDatabase className="h-3 w-3 ml-2" />
                          </a>
                        )}
                      </div>
                    </div>

                    {record.auditHash && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <HashDisplay
                          hash={record.auditHash}
                          label="Audit Hash"
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
      </div>
    </PageLayout>
  )
}

export default Payments
