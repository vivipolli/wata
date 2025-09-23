/**
 * Services Index
 * Centralized export of all API services
 */

import agreementsService from './agreements'
import readingsService from './readings'
import paymentsService from './payments'
import healthService from './health'
import { oracleService } from './oracle'
import apiClient from './api'

// Export individual services
export {
  agreementsService,
  readingsService,
  paymentsService,
  healthService,
  oracleService,
  apiClient
}

// Export default object with all services
export default {
  agreements: agreementsService,
  readings: readingsService,
  payments: paymentsService,
  health: healthService,
  oracle: oracleService,
  api: apiClient
}
