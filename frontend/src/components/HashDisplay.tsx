import React, { useState } from 'react'
import { FaCopy, FaExternalLinkAlt, FaCheck } from 'react-icons/fa'

interface HashDisplayProps {
  hash: string
  label?: string
  type?: 'audit' | 'transaction' | 'agreement'
  showFull?: boolean
  className?: string
}

const HashDisplay: React.FC<HashDisplayProps> = ({ 
  hash, 
  label = 'Hash', 
  type = 'audit',
  showFull = false,
  className = ''
}) => {
  const [copied, setCopied] = useState(false)
  const [showFullHash, setShowFullHash] = useState(showFull)

  const hashString = typeof hash === 'string' ? hash : String(hash || '')
  
  // If hash is empty or too short, show a placeholder
  if (!hashString || hashString.length < 8) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-gray-500">
            No hash available
          </code>
        </div>
      </div>
    )
  }
  
  const displayHash = showFullHash ? hashString : `${hashString.substring(0, 8)}...${hashString.substring(hashString.length - 8)}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(hashString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy hash:', err)
    }
  }

  const getExplorerUrl = () => {
    const baseUrl = 'https://hashscan.io/testnet'
    
    switch (type) {
      case 'transaction':
        // Check if it's a Hedera Transaction ID (contains @) or Ethereum hash (starts with 0x)
        if (hashString.includes('@')) {
          // Hedera Transaction ID format: accountId@validStart.nonce
          return `${baseUrl}/transaction/${hashString}`
        } else if (hashString.startsWith('0x')) {
          // Ethereum hash format
          return `${baseUrl}/transaction/${hashString}`
        } else {
          // Fallback for other formats
          return `${baseUrl}/transaction/${hashString}`
        }
      case 'agreement':
        return `${baseUrl}/contract/${hashString}`
      case 'audit':
      default:
        return `${baseUrl}/transaction/${hashString}`
    }
  }

  const openExplorer = () => {
    window.open(getExplorerUrl(), '_blank')
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex-1 min-w-0">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="flex items-center space-x-2">
          <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-gray-800 break-all">
            {displayHash}
          </code>
          {!showFullHash && (
            <button
              onClick={() => setShowFullHash(true)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Show full
            </button>
          )}
        </div>
      </div>
      
      <div className="flex space-x-1">
        <button
          onClick={copyToClipboard}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          title="Copy hash"
        >
          {copied ? (
            <FaCheck className="h-4 w-4 text-green-500" />
          ) : (
            <FaCopy className="h-4 w-4" />
          )}
        </button>
        
        <button
          onClick={openExplorer}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          title="View on Hedera Explorer"
        >
          <FaExternalLinkAlt className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default HashDisplay
