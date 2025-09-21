/**
 * Services Index
 * Centralized export of all API services
 */

import agreementsService from './agreements.js'
import readingsService from './readings.js'
import paymentsService from './payments.js'
import healthService from './health.js'
import apiClient from './api.js'

// Export individual services
export {
  agreementsService,
  readingsService,
  paymentsService,
  healthService,
  apiClient
}

// Export default object with all services
export default {
  agreements: agreementsService,
  readings: readingsService,
  payments: paymentsService,
  health: healthService,
  api: apiClient
}
