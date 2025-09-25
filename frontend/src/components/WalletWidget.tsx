import React, { useState, useEffect } from 'react'
import { hederaService } from '../services/hedera'

interface WalletWidgetProps {
  accountId?: string
  className?: string
}

interface WalletInfo {
  accountId: string
  balance: string
  balanceInHBAR: number
  isConnected: boolean
}

const WalletWidget: React.FC<WalletWidgetProps> = ({ accountId, className = '' }) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (accountId) {
      loadWalletInfo(accountId)
    }
  }, [accountId])

  const loadWalletInfo = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const balance = await hederaService.getAccountBalance(id)
      const balanceInHBAR = parseFloat(balance)
      
      setWalletInfo({
        accountId: id,
        balance,
        balanceInHBAR,
        isConnected: true
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet info')
      setWalletInfo({
        accountId: id,
        balance: '0',
        balanceInHBAR: 0,
        isConnected: false
      })
    } finally {
      setLoading(false)
    }
  }

  const formatBalance = (balance: number): string => {
    if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(2)}M HBAR`
    } else if (balance >= 1000) {
      return `${(balance / 1000).toFixed(2)}K HBAR`
    } else {
      return `${balance.toFixed(4)} HBAR`
    }
  }

  const getBalanceColor = (balance: number): string => {
    if (balance >= 1000) return 'text-green-600'
    if (balance >= 100) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (!accountId) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Wallet not connected</p>
            <p className="text-xs text-gray-400">Connect your Hedera wallet to view balance</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Loading wallet...</p>
            <p className="text-xs text-gray-500">{accountId}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-red-800">Wallet Error</p>
            <p className="text-xs text-red-600">{error}</p>
            <button
              onClick={() => loadWalletInfo(accountId)}
              className="mt-1 text-xs text-red-700 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">HBAR Wallet</p>
            <p className="text-xs text-gray-500 font-mono">{accountId}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${getBalanceColor(walletInfo?.balanceInHBAR || 0)}`}>
            {formatBalance(walletInfo?.balanceInHBAR || 0)}
          </p>
          <p className="text-xs text-gray-500">
            {walletInfo?.isConnected ? 'Connected' : 'Disconnected'}
          </p>
        </div>
      </div>
      
      {walletInfo && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Raw Balance:</span>
            <span className="font-mono">{walletInfo.balance} tinybars</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default WalletWidget
