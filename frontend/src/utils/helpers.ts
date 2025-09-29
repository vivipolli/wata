/**
 * Utility Helper Functions
 */

import { WATER_QUALITY, PAYMENT_STATUS, AGREEMENT_STATUS } from './constants'
import type { WaterQualityStatus, PaymentStatus } from '../types'

/**
 * Process oracle batch and show result
 */
export const processOracleWithFeedback = async (
  processBatch: (agreementId: number) => Promise<any>,
  agreementId: number,
  onSuccess?: () => void
): Promise<void> => {
  try {
    const result = await processBatch(agreementId)
    
    if (result.score >= 0.7) {
      const percentage = (result.score * 100).toFixed(1)
      alert(`✅ Oracle processed successfully!\nScore: ${percentage}%\nPayment will be approved automatically!`)
    } else {
      const percentage = (result.score * 100).toFixed(1)
      alert(`❌ Oracle processed!\nScore: ${percentage}%\nScore < 70%, payment rejected`)
    }
    
    if (onSuccess) {
      await onSuccess()
    }
  } catch (error) {
    console.error('Error processing oracle:', error)
    alert('Error processing oracle')
    throw error
  }
}

/**
 * Format date to readable string
 */
export const formatDate = (
  date: string | Date, 
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  
  return new Date(date).toLocaleString('en-US', { ...defaultOptions, ...options })
}

/**
 * Format number with specified decimal places
 */
export const formatNumber = (number: number, decimals: number = 2): string => {
  return Number(number).toFixed(decimals)
}

/**
 * Format currency (HBAR)
 */
export const formatCurrency = (amount: number, currency: string = 'HBAR'): string => {
  return `${formatNumber(amount)} ${currency}`
}

/**
 * Get water quality status based on turbidity
 */
export const getWaterQualityStatus = (turbidity: number): WaterQualityStatus => {
  if (turbidity <= WATER_QUALITY.EXCELLENT.max) {
    return WATER_QUALITY.EXCELLENT
  } else if (turbidity <= WATER_QUALITY.GOOD.max) {
    return WATER_QUALITY.GOOD
  } else if (turbidity <= WATER_QUALITY.FAIR.max) {
    return WATER_QUALITY.FAIR
  } else {
    return WATER_QUALITY.POOR
  }
}

/**
 * Check if water quality is compliant
 */
export const isCompliant = (
  turbidity: number, 
  threshold: number = WATER_QUALITY.TURBIDITY_THRESHOLD
): boolean => {
  return turbidity <= threshold
}

/**
 * Get status color for UI
 */
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    [PAYMENT_STATUS.PENDING]: 'yellow',
    [PAYMENT_STATUS.PROCESSING]: 'blue',
    [PAYMENT_STATUS.COMPLETED]: 'green',
    [PAYMENT_STATUS.FAILED]: 'red',
    [PAYMENT_STATUS.CANCELLED]: 'gray',
    [AGREEMENT_STATUS.ACTIVE]: 'green',
    [AGREEMENT_STATUS.INACTIVE]: 'gray',
    [AGREEMENT_STATUS.EXPIRED]: 'red',
    [AGREEMENT_STATUS.SUSPENDED]: 'yellow'
  }
  
  return colorMap[status] || 'gray'
}

/**
 * Debounce function to limit function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T, 
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

/**
 * Generate random ID
 */
export const generateId = (length: number = 8): string => {
  return Math.random().toString(36).substr(2, length)
}

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate wallet address format
 */
export const isValidWalletAddress = (address: string): boolean => {
  // Basic validation for Hedera addresses (0.0.123456 format)
  const hederaRegex = /^0\.0\.\d{1,10}$/
  // Basic validation for Ethereum-style addresses (0x... format)
  const ethereumRegex = /^0x[a-fA-F0-9]{40}$/
  
  return hederaRegex.test(address) || ethereumRegex.test(address)
}

/**
 * Calculate average from array of numbers
 */
export const calculateAverage = (numbers: number[]): number => {
  if (!numbers || numbers.length === 0) return 0
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
}

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0
  return (value / total) * 100
}

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, length: number = 50): string => {
  if (!text || text.length <= length) return text
  return text.substr(0, length) + '...'
}

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export const isEmpty = (value: any): boolean => {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Dashboard Statistics Utilities
 */

/**
 * Calculate dashboard statistics from user data
 */
export const calculateDashboardStats = (
  userAgreements: any[],
  userReadings: any[],
  producerOracleStatus: any,
  pendingPayments: number
) => {
  const activeContracts = (userAgreements || []).filter((a: any) => a.is_active).length
  
  const recentReadings = userReadings?.slice(0, 10) || []
  const lastTurbidity = recentReadings.length > 0 ? recentReadings[0].turbidity_ntu : 0
  
  const compliantReadings = recentReadings.filter((r: any) => r.turbidity_ntu <= 10)
  const complianceRate = recentReadings.length > 0 
    ? (compliantReadings.length / recentReadings.length) * 100 
    : 0

  // Calculate average score from user's oracle status
  const averageScore = producerOracleStatus?.summary?.averageScore || 0
  
  // Calculate validation rate from user's oracle status
  const totalBatches = producerOracleStatus?.summary?.totalBatches || 0
  const pendingBatches = producerOracleStatus?.summary?.pendingBatches || 0
  const validationRate = totalBatches > 0 
    ? ((totalBatches - pendingBatches) / totalBatches) * 100 
    : 0

  return {
    activeContracts,
    pendingPayments,
    lastTurbidity,
    complianceRate,
    averageScore,
    validationRate
  }
}

/**
 * Calculate producer statistics from user data
 */
export const calculateProducerStats = (userAgreements: any[], payments: any[]) => {
  if (!userAgreements || !payments) return null

  const activeAgreements = userAgreements.filter((agreement: any) => agreement.is_active)
  
  const totalReceived = payments
    .filter((payment: any) => payment.status === 'completed')
    .reduce((sum: number, payment: any) => sum + payment.amount, 0)

  const scores: number[] = [] // No last_score property in Agreement interface

  const averageScore = scores.length > 0 
    ? scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length 
    : 0

  const lastPayment = payments
    .filter((payment: any) => payment.status === 'completed')
    .sort((a: any, b: any) => new Date(b.processed_at || '').getTime() - new Date(a.processed_at || '').getTime())[0]

  const totalHectares = userAgreements.reduce((sum: number, agreement: any) => sum + agreement.hectares, 0)

  return {
    totalAgreements: userAgreements.length,
    activeAgreements: activeAgreements.length,
    totalReceived,
    averageScore,
    lastPaymentDate: lastPayment?.processed_at,
    totalHectares
  }
}

/**
 * Get score color based on value
 */
export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

/**
 * Format HBAR amount
 */
export const formatHBAR = (amount: number): string => {
  return `${amount.toFixed(4)} HBAR`
}

/**
 * Collect and deduplicate readings from multiple agreements
 */
export const collectUserReadings = async (
  userAgreements: any[],
  readingsService: any,
  fetchAgreementReadings: any
): Promise<any[]> => {
  if (userAgreements.length === 0) return []

  const allReadings: any[] = []
  
  // Fetch readings for each user agreement
  for (const agreement of userAgreements) {
    try {
      // Only call the service directly to avoid duplicate calls
      const response = await readingsService.getByAgreement(agreement.id, 10)
      if (response.success && response.data) {
        const agreementReadings = response.data.readings || response.data || []
        allReadings.push(...agreementReadings)
      }
    } catch (error) {
      console.error(`Error fetching readings for agreement ${agreement.id}:`, error)
    }
  }
  
  // Sort by timestamp (most recent first) and remove duplicates
  const uniqueReadings = allReadings.reduce((unique: any[], reading: any) => {
    if (!unique.find((r: any) => r.id === reading.id)) {
      unique.push(reading)
    }
    return unique
  }, [])
  
  uniqueReadings.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return uniqueReadings
}

/**
 * Blockchain Records Utilities
 */

/**
 * Get Hedera explorer URL for transaction
 */
export const getHederaExplorerUrl = (transactionId: string): string => {
  return `https://hashscan.io/testnet/transaction/${transactionId}`
}

/**
 * Get Hedera explorer URL for file
 */
export const getHederaFileUrl = (fileId: string): string => {
  return `https://hashscan.io/testnet/file/${fileId}`
}

/**
 * Get validation status based on score
 */
export const getValidationStatus = (score: number): { status: string; color: string } => {
  if (score >= 90) return { status: 'Excellent', color: 'text-green-600' }
  if (score >= 80) return { status: 'Good', color: 'text-blue-600' }
  if (score >= 70) return { status: 'Fair', color: 'text-yellow-600' }
  return { status: 'Poor', color: 'text-red-600' }
}

/**
 * Get status icon for blockchain records
 */
export const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'completed':
      return '✅'
    case 'pending':
      return '⏳'
    case 'failed':
      return '❌'
    default:
      return '❓'
  }
}

/**
 * Get status color classes for UI components (consolidated)
 */
export const getStatusColorClasses = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Get status icon component class for UI
 */
export const getStatusIconClass = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'text-green-600'
    case 'pending':
      return 'text-yellow-600'
    case 'failed':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}
