import React, { useState, useEffect } from 'react'
import { FaAward, FaLink, FaCheckCircle, FaClock } from 'react-icons/fa'
import nftService from '../../services/nft'
import TokenAssociationModal from './TokenAssociationModal'
import NFTDetailsModal from './NFTDetailsModal'

interface PaymentDetail {
  id: number
  nftTokenId?: string
  nftSerial?: number
  nftTransactionId?: string
  nftMetadataUri?: string
  producerNftTransferred?: boolean
  producerNftTransferTx?: string
  amount: number
  score?: number
  agreementId: number
}

interface NFTCertificateButtonProps {
  payment: PaymentDetail
  userAddress: string | null
  onSuccess?: () => void
}

type NFTStatus = 'none' | 'pending' | 'ready' | 'received'

const NFTCertificateButton: React.FC<NFTCertificateButtonProps> = ({
  payment,
  userAddress,
  onSuccess
}) => {
  const [status, setStatus] = useState<NFTStatus>('none')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [showAssociationModal, setShowAssociationModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkNFTStatus()
  }, [payment, userAddress])

  const checkNFTStatus = async () => {
    if (!payment.nftTokenId) {
      setStatus('none')
      setChecking(false)
      return
    }

    if (payment.producerNftTransferred) {
      setStatus('received')
      setChecking(false)
      return
    }

    if (!userAddress) {
      setStatus('pending')
      setChecking(false)
      return
    }

    setChecking(true)
    try {
      const isAssociated = await nftService.checkTokenAssociation(
        userAddress,
        payment.nftTokenId
      )
      setStatus(isAssociated ? 'ready' : 'pending')
    } catch (error) {
      console.error('Error checking NFT status:', error)
      setStatus('pending')
    } finally {
      setChecking(false)
    }
  }

  const handleAssociationComplete = async () => {
    setShowAssociationModal(false)
    await checkNFTStatus()
  }

  const handleClaimNFT = async () => {
    if (!payment.nftSerial || !userAddress) return

    setLoading(true)
    setError(null)

    try {
      const result = await nftService.claimNFT(payment.nftSerial, userAddress)
      
      if (result.success) {
        setStatus('received')
        if (onSuccess) onSuccess()
      } else {
        setError(result.error ?? 'Failed to claim NFT')
      }
    } catch (error: any) {
      setError(error.message ?? 'Failed to claim NFT')
    } finally {
      setLoading(false)
    }
  }

  const handleViewCertificate = () => {
    setShowDetailsModal(true)
  }

  if (checking) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <span>Checking certificate...</span>
      </div>
    )
  }

  if (status === 'none') {
    return (
      <div className="text-sm text-gray-500 italic">
        Certificate will be generated shortly
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        {status === 'received' ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" />
            NFT Received
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
            <FaClock className="mr-1" />
            NFT Available
          </span>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
          {error}
        </div>
      )}

      <div className="flex space-x-2">
        {status === 'received' && (
          <>
            <button
              onClick={handleViewCertificate}
              className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              <FaAward className="mr-2" />
              View Certificate
            </button>
            {payment.nftTokenId && payment.nftSerial && (
              <a
                href={nftService.getHederaNFTUrl(payment.nftTokenId, payment.nftSerial)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
              >
                <FaLink className="mr-2" />
                Hedera Explorer
              </a>
            )}
          </>
        )}

        {status === 'pending' && (
          <button
            onClick={() => setShowAssociationModal(true)}
            className="inline-flex items-center px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            <FaLink className="mr-2" />
            Step 1: Associate Token
          </button>
        )}

        {status === 'ready' && (
          <button
            onClick={handleClaimNFT}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Claiming...
              </>
            ) : (
              <>
                <FaAward className="mr-2" />
                Receive Certificate Now
              </>
            )}
          </button>
        )}
      </div>

      {payment.nftTokenId && (
        <>
          <TokenAssociationModal
            isOpen={showAssociationModal}
            onClose={() => setShowAssociationModal(false)}
            tokenId={payment.nftTokenId}
            userAddress={userAddress ?? ''}
            onSuccess={handleAssociationComplete}
          />

          <NFTDetailsModal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            payment={payment}
          />
        </>
      )}
    </div>
  )
}

export default NFTCertificateButton

