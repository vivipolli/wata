import React, { useState, useEffect } from 'react'
import { useWallet } from '../../contexts/WalletContext'

interface HederaWalletSetupProps {
  onSetupComplete?: () => void
}

export const HederaWalletSetup: React.FC<HederaWalletSetupProps> = ({ onSetupComplete }) => {
  const [isSnapAvailable, setIsSnapAvailable] = useState<boolean>(false)
  const [isInstalling, setIsInstalling] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { isHederaWalletSnapAvailable, installHederaWalletSnap } = useWallet()

  useEffect(() => {
    checkSnapAvailability()
  }, [])

  const checkSnapAvailability = async () => {
    try {
      const available = await isHederaWalletSnapAvailable()
      setIsSnapAvailable(available)
      if (available && onSetupComplete) {
        onSetupComplete()
      }
    } catch (err) {
      console.error('Error checking Hedera Wallet Snap availability:', err)
      setError('Failed to check Hedera Wallet Snap availability')
    }
  }

  const handleInstallSnap = async () => {
    try {
      setIsInstalling(true)
      setError(null)
      
      const success = await installHederaWalletSnap()
      
      if (success) {
        setIsSnapAvailable(true)
        if (onSetupComplete) {
          onSetupComplete()
        }
      } else {
        setError('Failed to install Hedera Wallet Snap')
      }
    } catch (err) {
      console.error('Error installing Hedera Wallet Snap:', err)
      setError('Failed to install Hedera Wallet Snap')
    } finally {
      setIsInstalling(false)
    }
  }

  if (isSnapAvailable) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Hedera Wallet Snap Ready
            </h3>
            <p className="text-sm text-green-700 mt-1">
              You can now sign Hedera transactions with your MetaMask wallet.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            Hedera Wallet Snap Required
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            To sign Hedera transactions, you need to install the Hedera Wallet Snap for MetaMask.
            This snap will automatically create a Hedera account and configure it for testnet.
          </p>
          
          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}
          
          <div className="mt-3">
            <button
              onClick={handleInstallSnap}
              disabled={isInstalling}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInstalling ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Installing...
                </>
              ) : (
                'Install Hedera Wallet Snap'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HederaWalletSetup
