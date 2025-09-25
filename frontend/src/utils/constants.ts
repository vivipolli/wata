/**
 * Application Constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
} as const

// Water Quality Standards
export const WATER_QUALITY = {
  TURBIDITY_THRESHOLD: 10, // NTU
  MIN_TURBIDITY: 0,
  MAX_TURBIDITY: 20,
  EXCELLENT: { min: 0, max: 1, label: 'Excellent', color: 'green' },
  GOOD: { min: 1, max: 5, label: 'Good', color: 'blue' },
  FAIR: { min: 5, max: 10, label: 'Fair', color: 'yellow' },
  POOR: { min: 10, max: 20, label: 'Poor', color: 'red' }
} as const

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const

// Agreement Status
export const AGREEMENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  SUSPENDED: 'suspended'
} as const

// UI Constants
export const UI = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  REFRESH_INTERVAL: 30000,
  PAGINATION_LIMIT: 20
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  TIMEOUT: 'Request timed out. Please try again.'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  AGREEMENT_CREATED: 'Agreement created successfully!',
  READING_SUBMITTED: 'Reading submitted successfully!',
  PAYMENT_PROCESSED: 'Payment processed successfully!',
  DATA_UPDATED: 'Data updated successfully!'
} as const

// Score and Governance Constants
export const SCORE_THRESHOLD = 70

export const GOVERNANCE_MODES = {
  AUTO: 'AUTO',
  HYBRID_SIMPLE: 'HYBRID_SIMPLE',
  HYBRID_FULL: 'HYBRID_FULL'
} as const

// User Roles
export const USER_ROLES = {
  PRODUCER: 'PRODUCER',
  INVESTOR: 'INVESTOR',
  // MANAGER: 'MANAGER',
} as const

// Hedera Configuration
export const HEDERA_EXPLORER_URLS = {
  TESTNET: 'https://hashscan.io/testnet',
  MAINNET: 'https://hashscan.io'
} as const

export const DEFAULT_NETWORK = 'testnet'

export const HBAR_DECIMALS = 8 // 1 HBAR = 100,000,000 tinybars
