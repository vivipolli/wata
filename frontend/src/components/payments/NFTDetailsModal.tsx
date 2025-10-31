import React from 'react'
import { FaTimes, FaExternalLinkAlt, FaAward, FaCalendar, FaHashtag, FaCoins } from 'react-icons/fa'
import nftService from '../../services/nft'

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
  created_at?: string
}

interface NFTDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  payment: PaymentDetail
}

const NFTDetailsModal: React.FC<NFTDetailsModalProps> = ({
  isOpen,
  onClose,
  payment
}) => {
  if (!isOpen) return null

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAmount = (amount: number) => {
    return (amount / 100000000).toFixed(2)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">NFT Certificate Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 text-center">
            <FaAward className="text-6xl text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Environmental Certificate
            </h3>
            <p className="text-gray-600">
              Water Quality Verification - Producer Certificate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <FaHashtag className="text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">Token ID</span>
              </div>
              <p className="font-mono text-sm text-gray-900 break-all">
                {payment.nftTokenId}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <FaHashtag className="text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">Serial Number</span>
              </div>
              <p className="font-mono text-sm text-gray-900">
                {payment.nftSerial}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <FaCoins className="text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">Payment Amount</span>
              </div>
              <p className="font-semibold text-gray-900">
                {formatAmount(payment.amount)} HBAR
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <FaAward className="text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">Quality Score</span>
              </div>
              <p className="font-semibold text-gray-900">
                {payment.score !== undefined ? `${payment.score}/100` : 'N/A'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <FaHashtag className="text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">Agreement ID</span>
              </div>
              <p className="font-mono text-sm text-gray-900">
                #{payment.agreementId}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <FaCalendar className="text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">Issued Date</span>
              </div>
              <p className="text-sm text-gray-900">
                {formatDate(payment.created_at)}
              </p>
            </div>
          </div>

          {payment.nftTransactionId && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <FaHashtag className="text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">Mint Transaction</span>
              </div>
              <p className="font-mono text-xs text-gray-900 break-all">
                {payment.nftTransactionId}
              </p>
            </div>
          )}

          {payment.producerNftTransferTx && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center mb-2">
                <FaHashtag className="text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">Transfer Transaction</span>
              </div>
              <p className="font-mono text-xs text-green-900 break-all">
                {payment.producerNftTransferTx}
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              This NFT certificate represents verified water quality data and payment completion. 
              It is stored permanently on the Hedera network and can be verified by anyone.
            </p>
          </div>
        </div>

        <div className="flex justify-between p-6 border-t bg-gray-50">
          {payment.nftMetadataUri && (
            <a
              href={nftService.getMetadataUrl(payment.nftMetadataUri)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm text-purple-700 bg-purple-100 rounded hover:bg-purple-200 transition"
            >
              <FaExternalLinkAlt className="mr-2" />
              View Metadata (IPFS)
            </a>
          )}
          
          {payment.nftTokenId && payment.nftSerial && (
            <a
              href={nftService.getHederaNFTUrl(payment.nftTokenId, payment.nftSerial)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition"
            >
              <FaExternalLinkAlt className="mr-2" />
              View on HashScan
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default NFTDetailsModal

