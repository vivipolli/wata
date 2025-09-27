import React from 'react'
import { useWallet } from '../../contexts/WalletContext'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { formatAddress, formatBalance } from '../../utils/formatters'
import LoadingSpinner from '../common/LoadingSpinner'
import PrimaryButton from '../common/PrimaryButton'

const WalletConnectButton: React.FC = () => {
  const { wallet, connectWallet, disconnectWallet, isLoading } = useWallet()
  const { isConnected, address } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (isLoading || isPending) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed flex items-center space-x-2 text-sm font-medium"
      >
        <LoadingSpinner size="sm" />
        <span>Connecting...</span>
      </button>
    )
  }

  if (isConnected || wallet?.isConnected) {
    return (
      <div className="flex items-center space-x-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">
            {wallet?.balanceInHBAR ? formatBalance(wallet.balanceInHBAR) : '0.00'} HBAR
          </p>
          <p className="text-xs text-gray-500">
            {wallet?.address ? formatAddress(wallet.address) : address ? formatAddress(address) : 'Unknown'}
          </p>
        </div>
        <button
          onClick={disconnectWallet}
          className="px-3 py-1 text-xs font-medium bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors border border-red-200"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <PrimaryButton
      onClick={connectWallet}
      size="sm"
    >
      <span>Connect MetaMask</span>
    </PrimaryButton>
  )
}

export default WalletConnectButton
