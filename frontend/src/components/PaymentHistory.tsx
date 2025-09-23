import React, { useState, useEffect } from 'react'
import { FaDollarSign, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa'
import HashDisplay from './HashDisplay'
import { paymentsService } from '../services'

interface Payment {
  id: number
  agreement_id: number
  amount: number
  transaction_hash?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  processed_at?: string
  audit_hash?: string
  score?: number
}

interface PaymentHistoryProps {
  agreementId?: number
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ agreementId }) => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPayments()
  }, [agreementId])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (agreementId) {
        const data = await paymentsService.getAgreementPayments(agreementId)
        setPayments(data)
      } else {
        const data = await paymentsService.getPaymentHistory()
        setPayments(data)
      }
    } catch (err) {
      setError('Failed to fetch payments')
      console.error('Error fetching payments:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
      case 'processing':
        return <FaClock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <FaExclamationTriangle className="h-4 w-4 text-red-500" />
      default:
        return <FaDollarSign className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString()
  }

  const formatAmount = (amount: number): string => {
    return `${amount.toLocaleString()} HBAR`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Payment History</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Payment History</h2>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Payment History</h2>
        {agreementId && (
          <p className="text-sm text-gray-500 mt-1">Agreement #{agreementId}</p>
        )}
      </div>
      <div className="p-6">
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <FaDollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No payments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Payment #{payment.id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Agreement #{payment.agreement_id}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="text-sm font-medium">{formatAmount(payment.amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                      {payment.score && (
                        <div>
                          <p className="text-xs text-gray-500">Score</p>
                          <p className="text-sm font-medium">{payment.score.toFixed(1)}%</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="text-sm">{formatDate(payment.created_at)}</p>
                      </div>
                    </div>

                    {/* Hash displays */}
                    <div className="mt-4 space-y-2">
                      {payment.audit_hash && (
                        <HashDisplay 
                          hash={payment.audit_hash}
                          label="Audit Hash"
                          type="audit"
                          className="text-xs"
                        />
                      )}
                      {payment.transaction_hash && (
                        <HashDisplay 
                          hash={payment.transaction_hash}
                          label="Transaction Hash"
                          type="transaction"
                          className="text-xs"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentHistory
