import { useState, useEffect } from 'react'
import { FaPlus, FaMapMarkerAlt, FaFileContract, FaCalendar, FaDollarSign, FaRuler, FaCheckCircle, FaTimes, FaWallet } from 'react-icons/fa'
import crypto from 'crypto-js'
import { useAgreements } from '../hooks'
import { useAuth } from '../contexts/AuthContext'
import { useWallet } from '../contexts/WalletContext'
import { hederaService } from '../services/hedera'
import { USER_ROLES } from '../utils/constants'
import { formatNumber } from '../utils'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import HederaWalletSetup from './wallet/HederaWalletSetup'
import type { ContractFormData, Agreement } from '../types'

interface ContractRegistrationProps {
  producerAddress?: string
}

export default function ContractRegistration({ producerAddress: propProducerAddress }: ContractRegistrationProps): React.JSX.Element {
  const { user, hasRole } = useAuth()
  const { createAgreement, loading, getAgreementsByProducer } = useAgreements(!propProducerAddress)
  const { isHederaWalletSnapAvailable } = useWallet()
  const [formData, setFormData] = useState<ContractFormData>({
    producerName: '',
    producerAddress: '',
    baseValue: '',
    hectares: '',
    locationLat: '',
    locationLng: '',
    durationDays: ''
  })
  const [success, setSuccess] = useState<boolean>(false)
  const [showForm, setShowForm] = useState<boolean>(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [producerAgreements, setProducerAgreements] = useState<Agreement[]>([])
  const [isSigning, setIsSigning] = useState<boolean>(false)
  const [signingStep, setSigningStep] = useState<string>('')
  const [isHederaSetupComplete, setIsHederaSetupComplete] = useState<boolean>(false)
  
  // MetaMask connection
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [walletError, setWalletError] = useState<string | null>(null)


  useEffect(() => {
    const targetProducerAddress = propProducerAddress || user?.address

    if (targetProducerAddress) {
      getAgreementsByProducer(targetProducerAddress).then(fetchedAgreements => {
        setProducerAgreements(fetchedAgreements)
        setShowForm(fetchedAgreements.length === 0)
      })
      setFormData(prev => ({
        ...prev,
        producerAddress: targetProducerAddress
      }))
    } else {
      setProducerAgreements([])
      setShowForm(true)
    }
  }, [propProducerAddress, user?.address])

  // Check Hedera Wallet Snap availability
  useEffect(() => {
    const checkHederaSetup = async () => {
      try {
        const isAvailable = await isHederaWalletSnapAvailable()
        setIsHederaSetupComplete(isAvailable)
      } catch (error) {
        console.error('Error checking Hedera setup:', error)
      }
    }
    
    checkHederaSetup()
  }, [isHederaWalletSnapAvailable])

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
    setSuccess(false)
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
        setSigningStep('Transaction confirmed!')
        setSuccess(true)
        
        // Agreement is already created in database by backend
        setFormData({
          producerName: '',
          producerAddress: '',
          baseValue: '',
          hectares: '',
          locationLat: '',
          locationLng: '',
          durationDays: ''
        })
        setShowForm(false)
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatHBAR = (amount: number): string => {
    return `${amount.toFixed(4)} HBAR`
  }

  // producerAgreements is now managed by local state

  // Authorization check
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="mt-2 text-gray-600">Please log in to access agreements.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agreement Management</h1>
          <p className="mt-2 text-gray-600">
            Manage your PES (Payment for Ecosystem Services) agreements
          </p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaCheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Agreement Created Successfully!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>The agreement has been registered on the Hedera blockchain.</p>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Existing Agreements */}
        {producerAgreements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Agreements</h2>
            <div className="grid grid-cols-1 gap-6">
              {producerAgreements.map((agreement) => (
                <div key={agreement.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <FaFileContract className="h-6 w-6 text-blue-600 mr-3" />
                        <h3 className="text-lg font-medium text-gray-900">
                          Agreement #{agreement.id}
                        </h3>
                        <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                          agreement.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {agreement.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center">
                          <FaDollarSign className="h-4 w-4 text-green-600 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Base Value</p>
                            <p className="font-medium">{formatHBAR(agreement.base_value)}/ha</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <FaRuler className="h-4 w-4 text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Area</p>
                            <p className="font-medium">{agreement.hectares} hectares</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <FaCalendar className="h-4 w-4 text-purple-600 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Created</p>
                            <p className="font-medium">{formatDate(agreement.created_at)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="h-4 w-4 text-orange-600 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium">
                              {agreement.location_lat && agreement.location_lng 
                                ? `${agreement.location_lat.toFixed(4)}, ${agreement.location_lng.toFixed(4)}`
                                : 'Not specified'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <FaPlus className="h-4 w-4 mr-2" />
                Add New Agreement
              </button>
            </div>
          </div>
        )}

        {/* Form Section */}
        {(showForm || producerAgreements.length === 0) && (
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
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
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
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? 'Connecting...' : 'Connect MetaMask'}
                  </button>
                </div>
              )}
            </div>

            {/* Hedera Wallet Setup */}
            {!isHederaSetupComplete && (
              <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
                <HederaWalletSetup onSetupComplete={() => setIsHederaSetupComplete(true)} />
              </div>
            )}

            {/* Wallet Signature Info */}
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FaFileContract className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">Blockchain Transaction</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    You will be asked to sign this transaction with your wallet to create the agreement on the blockchain.
                    This ensures you have full control over your agreement creation.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {producerAgreements.length > 0 ? 'Add New Agreement' : 'Create Agreement'}
                </h3>
                {producerAgreements.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <FaTimes className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{errors.submit}</p>
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
                    <FaMapMarkerAlt className="inline h-4 w-4 mr-1" />
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
                    <FaMapMarkerAlt className="inline h-4 w-4 mr-1" />
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
                {producerAgreements.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || isSigning}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {isSigning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {signingStep || 'Signing...'}
                    </>
                  ) : loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaPlus className="h-4 w-4 mr-2" />
                      {producerAgreements.length > 0 ? 'Add Agreement' : 'Create Agreement'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

