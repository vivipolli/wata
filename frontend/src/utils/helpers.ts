/**
 * Utility Helper Functions
 */

import { WATER_QUALITY, PAYMENT_STATUS, AGREEMENT_STATUS } from './constants'
import type { WaterQualityStatus, PaymentStatus } from '../types'

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
