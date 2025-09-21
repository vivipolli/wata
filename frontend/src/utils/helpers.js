/**
 * Utility Helper Functions
 */

import { WATER_QUALITY, PAYMENT_STATUS, AGREEMENT_STATUS } from './constants.js'

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
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
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatNumber = (number, decimals = 2) => {
  return Number(number).toFixed(decimals)
}

/**
 * Format currency (HBAR)
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'HBAR') => {
  return `${formatNumber(amount)} ${currency}`
}

/**
 * Get water quality status based on turbidity
 * @param {number} turbidity - Turbidity value in NTU
 * @returns {Object} Water quality status object
 */
export const getWaterQualityStatus = (turbidity) => {
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
 * @param {number} turbidity - Turbidity value in NTU
 * @param {number} threshold - Compliance threshold
 * @returns {boolean} True if compliant
 */
export const isCompliant = (turbidity, threshold = WATER_QUALITY.TURBIDITY_THRESHOLD) => {
  return turbidity <= threshold
}

/**
 * Get status color for UI
 * @param {string} status - Status string
 * @returns {string} CSS color class
 */
export const getStatusColor = (status) => {
  const colorMap = {
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
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

/**
 * Generate random ID
 * @param {number} length - Length of ID
 * @returns {string} Random ID string
 */
export const generateId = (length = 8) => {
  return Math.random().toString(36).substr(2, length)
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate wallet address format
 * @param {string} address - Wallet address to validate
 * @returns {boolean} True if valid address
 */
export const isValidWalletAddress = (address) => {
  // Basic validation for Hedera addresses (0.0.123456 format)
  const hederaRegex = /^0\.0\.\d{1,10}$/
  // Basic validation for Ethereum-style addresses (0x... format)
  const ethereumRegex = /^0x[a-fA-F0-9]{40}$/
  
  return hederaRegex.test(address) || ethereumRegex.test(address)
}

/**
 * Calculate average from array of numbers
 * @param {number[]} numbers - Array of numbers
 * @returns {number} Average value
 */
export const calculateAverage = (numbers) => {
  if (!numbers || numbers.length === 0) return 0
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
}

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0
  return (value / total) * 100
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 50) => {
  if (!text || text.length <= length) return text
  return text.substr(0, length) + '...'
}

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (value) => {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}
