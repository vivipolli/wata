import { useEffect, useState } from 'react'
import { FaPlus, FaTimes, FaWallet, FaCheckCircle } from 'react-icons/fa'
import { useAgreementsActions } from '../stores/agreementsStore'
import { useAuth } from '../contexts/AuthContext'
import { hederaService } from '../services/hedera'
import { agreementsService } from '../services/agreements'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import crypto from 'crypto-js'
import type { ContractFormData } from '../types'

interface AgreementFormProps {
  onSuccess: () => void
  onCancel?: () => void
  showCancel?: boolean
}

export default function AgreementForm({ onSuccess, onCancel, showCancel = false }: AgreementFormProps): React.JSX.Element {
  const { user, updateUserAddress } = useAuth()
  const { createAgreement, addAgreement } = useAgreementsActions()
  const [formData, setFormData] = useState<ContractFormData>({
    producerName: '',
    producerAddress: '',
    baseValue: '',
    hectares: '',
    locationLat: '',
    locationLng: '',
    durationDays: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isSigning, setIsSigning] = useState<boolean>(false)
  const [signingStep, setSigningStep] = useState<string>('')
  
  // MetaMask connection
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [walletError, setWalletError] = useState<string | null>(null)

  const handleConnectMetaMask = async () => {
    const metaMaskConnector = connectors.find(connector => connector.name === 'MetaMask')
    if (!metaMaskConnector) {
      setWalletError('MetaMask not found')
      return
    }

    setWalletError(null)
    try {
      await connect({ connector: metaMaskConnector })
    } catch (error: any) {
      setWalletError(error.message || 'Failed to connect MetaMask')
    }
  }

  const handleDisconnectMetaMask = () => {
    disconnect()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  // Auto-fill producer address when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      setFormData(prev => ({
        ...prev,
        producerAddress: address
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        producerAddress: ''
      }))
    }
  }, [isConnected, address])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.producerName.trim()) {
      newErrors.producerName = 'Producer name is required'
    }
    
    if (!formData.producerAddress.trim()) {
      newErrors.producerAddress = 'Producer address is required'
    } else if (!formData.producerAddress.startsWith('0.0.') && !formData.producerAddress.startsWith('0x')) {
      newErrors.producerAddress = 'Invalid address format (must be Hedera 0.0.x or Ethereum 0x format)'
    }
    
    if (!formData.baseValue || parseInt(formData.baseValue) <= 0) {
      newErrors.baseValue = 'Base value must be greater than 0'
    }
    
    if (!formData.hectares || parseInt(formData.hectares) <= 0) {
      newErrors.hectares = 'Area must be greater than 0'
    }
    
    if (formData.locationLat && (parseFloat(formData.locationLat) < -90 || parseFloat(formData.locationLat) > 90)) {
      newErrors.locationLat = 'Latitude must be between -90 and 90'
    }
    
    if (formData.locationLng && (parseFloat(formData.locationLng) < -180 || parseFloat(formData.locationLng) > 180)) {
      newErrors.locationLng = 'Longitude must be between -180 and 180'
    }
    
    if (formData.durationDays && parseInt(formData.durationDays) <= 0) {
      newErrors.durationDays = 'Duration must be greater than 0'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setErrors({})
    setIsSigning(false)
    setSigningStep('')

    if (!validateForm()) {
      return
    }

    try {
      setIsSigning(true)
      setSigningStep('Preparing transaction data...')

      const agreementData = {
        producerName: formData.producerName,
        producerAddress: formData.producerAddress,
        baseValue: parseInt(formData.baseValue),
        hectares: parseInt(formData.hectares),
        durationDays: parseInt(formData.durationDays),
        locationLat: parseFloat(formData.locationLat) || undefined,
        locationLng: parseFloat(formData.locationLng) || undefined
      }

      // Create agreement hash
      const agreementHash = crypto.SHA256(JSON.stringify({
        ...agreementData,
        timestamp: Date.now()
      })).toString()

      setSigningStep('Creating agreement on Hedera...')

      // Create agreement using system credentials (no user signature required)
      const result = await hederaService.createAgreement(
        agreementHash,
        agreementData.producerAddress,
        agreementData.baseValue,
        agreementData.hectares,
        agreementData.producerName,
        agreementData.locationLat,
        agreementData.locationLng,
        agreementData.durationDays
      )

      if (result.success) {
        setSigningStep('Verifying transaction on blockchain...')
        
        // Verify transaction on blockchain
        if (result.transactionId) {
          try {
            const verification = await agreementsService.verifyTransaction(result.transactionId)
            if (verification.success && verification.data?.success) {
              setSigningStep('Transaction confirmed on blockchain!')
              
              // Update user address if it's different
              if (user && user.address !== agreementData.producerAddress) {
                try {
                  await updateUserAddress(agreementData.producerAddress)
                } catch (error) {
                  console.error('Error updating user address:', error)
                }
              }
              
              if (result.agreement) {
                addAgreement(result.agreement)
              }
              
              onSuccess()
            } else {
              setSigningStep('Transaction failed verification on blockchain')
              setError('Transaction was not confirmed on the blockchain')
            }
          } catch (verifyError) {
            console.error('Error verifying transaction:', verifyError)
            setSigningStep('Transaction created but verification failed')
            setError('Transaction created but could not verify on blockchain')
            
            // Still add to store even if verification fails
            if (result.agreement) {
              addAgreement(result.agreement)
            }
            onSuccess()
          }
        } else {
          setSigningStep('Transaction confirmed!')
          
          // Update user address if it's different
          if (user && user.address !== agreementData.producerAddress) {
            try {
              await updateUserAddress(agreementData.producerAddress)
            } catch (error) {
              console.error('Error updating user address:', error)
            }
          }
          
          if (result.agreement) {
            addAgreement(result.agreement)
          }
          
          onSuccess()
        }
        
        // Reset form
        setFormData({
          producerName: '',
          producerAddress: '',
          baseValue: '',
          hectares: '',
          locationLat: '',
          locationLng: '',
          durationDays: ''
        })
      } else {
        throw new Error(result.error || 'Transaction failed')
      }
    } catch (error) {
      console.error('Error creating agreement:', error)
      setErrors({ submit: 'Failed to create agreement. Please try again.' })
    } finally {
      setIsSigning(false)
      setSigningStep('')
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* MetaMask Connection */}
      <div className="px-6 py-4 border-b border-gray-200">
        {isConnected && address ? (
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <FaWallet className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h4 className="text-lg font-semibold text-gray-900">MetaMask Connected</h4>
                <p className="text-sm text-gray-600">
                  <span className="text-green-600 flex items-center">
                    <FaCheckCircle className="mr-1" /> 
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={handleDisconnectMetaMask}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <FaWallet className="h-6 w-6 text-gray-600 mr-3" />
              <div>
                <h4 className="text-lg font-semibold text-gray-900">MetaMask Wallet</h4>
                <p className="text-sm text-gray-600">
                  <span className="text-red-600 flex items-center">
                    <FaTimes className="mr-1" /> Not connected
                  </span>
                </p>
                {walletError && (
                  <p className="text-sm text-red-500 mt-1">{walletError}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleConnectMetaMask}
              disabled={isPending}
              className="px-4 py-2 bg-[#94b9ff] text-white rounded-md hover:bg-[#7ba3ff] focus:outline-none focus:ring-2 focus:ring-[#94b9ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Create Agreement</h3>
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {(errors.submit || error) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <FaTimes className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{errors.submit || error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="producerName" className="block text-sm font-medium text-gray-700">
              Producer Name *
            </label>
            <input
              type="text"
              name="producerName"
              id="producerName"
              required
              value={formData.producerName}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border-2 px-4 py-3 text-base transition-colors ${
                errors.producerName 
                  ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400' 
                  : 'border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300'
              }`}
              placeholder="Enter producer name"
            />
            {errors.producerName && (
              <p className="mt-1 text-sm text-red-600">{errors.producerName}</p>
            )}
          </div>

          <div>
            <label htmlFor="producerAddress" className="block text-sm font-medium text-gray-700">
              Producer Address *
            </label>
            <input
              type="text"
              name="producerAddress"
              id="producerAddress"
              required
              value={formData.producerAddress}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border-2 px-4 py-3 text-base transition-colors ${
                errors.producerAddress 
                  ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400' 
                  : 'border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300'
              }`}
              placeholder="0x1234... or 0.0.1234567"
            />
            {errors.producerAddress && (
              <p className="mt-1 text-sm text-red-600">{errors.producerAddress}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="baseValue" className="block text-sm font-medium text-gray-700">
              Base Value (HBAR per hectare) *
            </label>
            <input
              type="number"
              name="baseValue"
              id="baseValue"
              required
              min="1"
              value={formData.baseValue}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border-2 px-4 py-3 text-base transition-colors ${
                errors.baseValue 
                  ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400' 
                  : 'border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300'
              }`}
              placeholder="100"
            />
            {errors.baseValue && (
              <p className="mt-1 text-sm text-red-600">{errors.baseValue}</p>
            )}
          </div>

          <div>
            <label htmlFor="hectares" className="block text-sm font-medium text-gray-700">
              Area (hectares) *
            </label>
            <input
              type="number"
              name="hectares"
              id="hectares"
              required
              min="1"
              value={formData.hectares}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border-2 px-4 py-3 text-base transition-colors ${
                errors.hectares 
                  ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400' 
                  : 'border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300'
              }`}
              placeholder="50"
            />
            {errors.hectares && (
              <p className="mt-1 text-sm text-red-600">{errors.hectares}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="locationLat" className="block text-sm font-medium text-gray-700">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              name="locationLat"
              id="locationLat"
              value={formData.locationLat}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border-2 px-4 py-3 text-base transition-colors ${
                errors.locationLat 
                  ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400' 
                  : 'border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300'
              }`}
              placeholder="-23.5505"
            />
            {errors.locationLat && (
              <p className="mt-1 text-sm text-red-600">{errors.locationLat}</p>
            )}
          </div>

          <div>
            <label htmlFor="locationLng" className="block text-sm font-medium text-gray-700">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              name="locationLng"
              id="locationLng"
              value={formData.locationLng}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border-2 px-4 py-3 text-base transition-colors ${
                errors.locationLng 
                  ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400' 
                  : 'border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300'
              }`}
              placeholder="-46.6333"
            />
            {errors.locationLng && (
              <p className="mt-1 text-sm text-red-600">{errors.locationLng}</p>
            )}
          </div>

          <div>
            <label htmlFor="durationDays" className="block text-sm font-medium text-gray-700">
              Duration (days)
            </label>
            <input
              type="number"
              name="durationDays"
              id="durationDays"
              min="1"
              value={formData.durationDays}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border-2 px-4 py-3 text-base transition-colors ${
                errors.durationDays 
                  ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400' 
                  : 'border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300'
              }`}
              placeholder="365"
            />
            {errors.durationDays && (
              <p className="mt-1 text-sm text-red-600">{errors.durationDays}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSigning}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#94b9ff] hover:bg-[#7ba3ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#94b9ff] disabled:opacity-50 transition-colors"
          >
            {isSigning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {signingStep || 'Creating...'}
              </>
            ) : (
              <>
                <FaPlus className="h-4 w-4 mr-2" />
                Create Agreement
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
