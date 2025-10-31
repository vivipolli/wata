import React, { useState } from 'react'
import { FaTimes, FaInfoCircle, FaLink } from 'react-icons/fa'
import { TokenAssociateTransaction, TokenId, AccountId } from '@hashgraph/sdk'

interface TokenAssociationModalProps {
  isOpen: boolean
  onClose: () => void
  tokenId: string
  userAddress: string
  onSuccess: () => void
}

const TokenAssociationModal: React.FC<TokenAssociationModalProps> = ({
  isOpen,
  onClose,
  tokenId,
  userAddress,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAssociate = async () => {
    if (!userAddress) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Check if HashPack or other Hedera wallet is available
      if (typeof (window as any).hashconnect !== 'undefined') {
        const transaction = new TokenAssociateTransaction()
          .setAccountId(AccountId.fromString(userAddress))
          .setTokenIds([TokenId.fromString(tokenId)])

        const response = await (window as any).hashconnect?.signAndExecuteTransaction(transaction)
        
        if (response) {
          onSuccess()
          onClose()
        } else {
          setError('Transaction was not executed')
        }
      } else {
        // No Hedera wallet detected - show instructions
        setError(
          'Hedera wallet not detected. Please install HashPack wallet (https://www.hashpack.app/) ' +
          'or use Hedera Portal to associate the token manually.'
        )
        
        // Open HashScan in new tab for manual association
        window.open(`https://hashscan.io/testnet/token/${tokenId}`, '_blank')
        
        // After user manually associates, they can close this modal and try again
        setTimeout(() => {
          setError(
            'After associating the token in HashPack or Hedera Portal, ' +
            'close this dialog and click "Receive Certificate Now"'
          )
          setLoading(false)
        }, 2000)
      }
    } catch (error: any) {
      console.error('Error associating token:', error)
      if (error.message?.includes('User rejected')) {
        setError('Transaction was rejected')
      } else if (error.message?.includes('insufficient')) {
        setError('Insufficient HBAR balance (need ~$0.05 for association)')
      } else {
        setError(error.message ?? 'Failed to associate token')
      }
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Token Association Required</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <FaInfoCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-2">What is Token Association?</p>
                <p>
                  On Hedera, accounts must explicitly associate with a token before they can receive it. 
                  This is a one-time operation per token.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Token ID:</span>
              <span className="font-mono text-gray-900">{tokenId}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Your Account:</span>
              <span className="font-mono text-gray-900">{userAddress}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Estimated Cost:</span>
              <span className="font-medium text-gray-900">~$0.05 USD</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-xs text-yellow-800">
              Make sure you have sufficient HBAR in your wallet to cover the association fee.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded p-4">
            <p className="text-sm font-medium text-purple-900 mb-2">Manual Association Options:</p>
            <div className="space-y-2 text-xs text-purple-800">
              <p>1. <strong>HashPack Wallet</strong> (Recommended): Install HashPack and import your account</p>
              <p>2. <strong>Hedera Portal</strong>: Use portal.hedera.com with your account</p>
              <p>3. <strong>HashScan</strong>: View token details and associate manually</p>
            </div>
            <a
              href={`https://hashscan.io/testnet/token/${tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mt-3 text-sm text-purple-700 hover:text-purple-900 underline"
            >
              Open Token in HashScan →
            </a>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAssociate}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 text-sm text-white bg-purple-600 rounded hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <FaLink className="mr-2" />
                Try Association
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TokenAssociationModal

