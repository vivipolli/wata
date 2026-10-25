import express, { Request, Response } from 'express'
import crypto from 'crypto'
import { HederaService } from '../services/hedera'
import { PrismaDatabase } from '../services/orm/prismaDatabase'
import { AuthMiddleware } from '../middleware/auth'
import { isUniqueViolation } from '../utils/prismaErrors'
import type { ApiResponse, CreateAgreementWithSignatureRequest } from '../types/index'
import type { EscrowService, GovernanceMode } from '../services/escrow'
import { STATION_CODE } from '../score/measurements'

const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/
// Positive integer as a decimal string: uint256 values do not fit a JSON number
const POSITIVE_DECIMAL = /^[1-9][0-9]*$/
const TRANSACTION_ID = /^\d+\.\d+\.\d+@\d+\.\d+$/

interface EscrowTerms {
  periodAmount: string
  scoreThreshold: number
  governanceMode: GovernanceMode
}

// Validates the optional escrow v3 terms of a new agreement. Returns an error message, terms, or null if absent.
function parseEscrowTerms(body: any): { error: string } | { terms: EscrowTerms } | null {
  const { periodAmount, scoreThreshold, governanceMode } = body
  if (periodAmount === undefined && scoreThreshold === undefined && governanceMode === undefined) return null
  if (typeof periodAmount !== 'string' || !POSITIVE_DECIMAL.test(periodAmount)) {
    return { error: 'periodAmount must be a positive integer written as a decimal string' }
  }
  if (!Number.isInteger(scoreThreshold) || scoreThreshold < 1 || scoreThreshold > 100) {
    return { error: 'scoreThreshold must be an integer between 1 and 100' }
  }
  const mode = governanceMode ?? 'AUTO'
  if (mode !== 'AUTO' && mode !== 'HYBRID') {
    return { error: 'governanceMode must be AUTO or HYBRID' }
  }
  if (typeof body.producerAddress !== 'string' || !EVM_ADDRESS.test(body.producerAddress)) {
    return { error: 'producerAddress must be a 0x EVM address to be paid by the escrow contract' }
  }
  return { terms: { periodAmount, scoreThreshold, governanceMode: mode } }
}

interface AgreementData {
  producerName: string
  producerAddress: string
  baseValue: number
  hectares: number
  locationLat?: number
  locationLng?: number
  durationDays?: number
  timestamp: number
}

interface CreateAgreementResponse {
  id: number
  blockchainId?: number | undefined
  transactionId?: string | undefined
  agreementHash: string
  producerName: string
  producerAddress: string
  baseValue: number
  hectares: number
  locationLat?: number | undefined
  locationLng?: number | undefined
  durationDays?: number | undefined
  createdAt: string
  // New fields for user signature flow
  transactionBytes?: string | undefined
  message?: string | undefined
  // Call the escrow admin (threshold) account must sign; then link it with link-onchain
  escrowCall?: {
    function: 'createAgreement'
    args: { producer: string; periodAmount: string; scoreThreshold: number; mode: GovernanceMode }
  }
}

// Body fields that must never be accepted when creating an agreement
const FORBIDDEN_CREATE_FIELDS = ['blockchainId', 'blockchain_id', 'signedTransaction'] as const

export default function agreementRoutes(hederaService: HederaService, database: PrismaDatabase, escrow?: Pick<EscrowService, 'getAgreement'>) {
  const router = express.Router()
  const authMiddleware = new AuthMiddleware(database)

  // Every agreements route requires an authenticated user.
  // Creating an agreement fixes baseValue/hectares (the payout basis), so it is restricted to MANAGER.
  router.use(authMiddleware.authenticate)

  router.post('/', 
    authMiddleware.requireRole('MANAGER'),
    async (req: Request, res: Response) => {
    try {
      // The on-chain ID must come from the contract's own transaction record, never from the
      // client: a caller-supplied ID could bind this agreement to another producer's agreement.
      // Client-signed creation is not implemented, so a signed transaction is rejected too.
      const body = req.body ?? {}
      const forbidden = FORBIDDEN_CREATE_FIELDS.filter(field => Object.prototype.hasOwnProperty.call(body, field))
      if (forbidden.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Field(s) not accepted: ${forbidden.join(', ')}. The on-chain agreement ID is assigned by the contract.`
        } as ApiResponse)
      }

      const {
        producerName,
        producerAddress,
        baseValue,
        hectares,
        locationLat,
        locationLng,
        durationDays
      }: CreateAgreementWithSignatureRequest = body

      if (!producerName || !producerAddress || !baseValue || !hectares) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: producerName, producerAddress, baseValue, hectares'
        } as ApiResponse)
      }

      const parsedTerms = parseEscrowTerms(body)
      if (parsedTerms && 'error' in parsedTerms) {
        return res.status(400).json({ success: false, error: parsedTerms.error } as ApiResponse)
      }
      const terms = parsedTerms && 'terms' in parsedTerms ? parsedTerms.terms : null

      // Monitoring station whose measurements score this agreement (optional at creation)
      const stationCode = body.stationCode
      if (stationCode !== undefined && (typeof stationCode !== 'string' || !STATION_CODE.test(stationCode))) {
        return res.status(400).json({ success: false, error: 'stationCode must be 6-20 upper-case letters or digits' } as ApiResponse)
      }

      // Update user address for producers (always update to match the agreement)
      const user = (req as any).user
      if (user && user.role === 'PRODUCER') {
        await database.updateUserAddress(user.id, producerAddress)
        console.log(`Updated user ${user.id} address to ${producerAddress}`)
      }

      const agreementData: AgreementData = {
        producerName,
        producerAddress,
        baseValue,
        hectares,
        locationLat,
        locationLng,
        durationDays,
        timestamp: Date.now()
      }

      const agreementHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(agreementData))
        .digest('hex')

      const agreementId = await database.createAgreement({
        agreementHash,
        producerName,
        producerAddress,
        baseValue,
        hectares,
        locationLat,
        locationLng,
        durationDays,
        periodAmount: terms?.periodAmount ?? null,
        scoreThreshold: terms?.scoreThreshold ?? null,
        governanceMode: terms?.governanceMode,
        stationCode: stationCode ?? null
      })

      // The server never creates the escrow agreement: createAgreement is restricted to the admin
      // (threshold) account. The manager links the on-chain agreement afterwards with link-onchain.
      const response: ApiResponse<CreateAgreementResponse> = {
        success: true,
        data: {
          id: agreementId,
          escrowCall: terms ? {
            function: 'createAgreement',
            args: {
              producer: producerAddress.toLowerCase(),
              periodAmount: terms.periodAmount,
              scoreThreshold: terms.scoreThreshold,
              mode: terms.governanceMode
            }
          } : undefined,
          agreementHash,
          producerName,
          producerAddress,
          baseValue,
          hectares,
          locationLat,
          locationLng,
          durationDays,
          createdAt: new Date().toISOString()
        }
      }

      res.status(201).json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to create agreement',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Link a local agreement to the escrow agreement created by the admin account. The on-chain
  // state is the proof: producer, amount, threshold and mode must match the local terms exactly.
  router.post('/:id/link-onchain',
    authMiddleware.requireRole('MANAGER'),
    async (req: Request, res: Response) => {
    const fail = (status: number, error: string) => res.status(status).json({ success: false, error } as ApiResponse)
    try {
      const id = parseInt(req.params.id)
      const { onchainAgreementId, transactionId } = req.body ?? {}
      if (isNaN(id) || id < 0) {
        return fail(400, 'Invalid agreement ID')
      }
      if (!Number.isSafeInteger(onchainAgreementId) || onchainAgreementId < 0) {
        return fail(400, 'onchainAgreementId must be a non-negative integer')
      }
      if (transactionId !== undefined && (typeof transactionId !== 'string' || !TRANSACTION_ID.test(transactionId))) {
        return fail(400, 'transactionId must look like 0.0.1234@1700000000.000000001')
      }

      const agreement = await database.getAgreement(id)
      if (!agreement) {
        return fail(404, 'Agreement not found')
      }
      // On-chain IDs start at 0, so only null means "not linked"
      if (agreement.blockchain_id != null) {
        return fail(409, 'Agreement is already linked to an on-chain agreement')
      }
      if (agreement.period_amount == null || agreement.score_threshold == null || !EVM_ADDRESS.test(agreement.producer_address)) {
        return fail(409, 'Agreement has no escrow terms or no EVM producer address to compare with the chain')
      }

      let onchain
      try {
        onchain = await (escrow ?? hederaService.getEscrowService()).getAgreement(onchainAgreementId)
      } catch (error) {
        return res.status(502).json({
          success: false,
          error: 'Could not read the on-chain agreement',
          message: error instanceof Error ? error.message : 'Unknown error'
        } as ApiResponse)
      }

      const mismatches = [
        onchain.producer.toLowerCase() !== agreement.producer_address.toLowerCase() && 'producer',
        onchain.periodAmount !== agreement.period_amount && 'periodAmount',
        onchain.scoreThreshold !== agreement.score_threshold && 'scoreThreshold',
        onchain.mode !== agreement.governance_mode && 'governanceMode',
        !onchain.active && 'active'
      ].filter(Boolean)
      if (mismatches.length > 0) {
        return fail(409, `On-chain agreement ${onchainAgreementId} does not match the local terms: ${mismatches.join(', ')}`)
      }

      try {
        if (!(await database.linkAgreementOnchain(id, onchainAgreementId, transactionId ?? null))) {
          return fail(409, 'Agreement is already linked to an on-chain agreement')
        }
      } catch (error) {
        if (isUniqueViolation(error)) {
          return fail(409, `On-chain agreement ${onchainAgreementId} is already linked to another agreement`)
        }
        throw error
      }

      res.json({ success: true, data: { id, blockchainId: onchainAgreementId, transactionId: transactionId ?? null } } as ApiResponse)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to link agreement',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse)
    }
  })

  router.get('/', 
    authMiddleware.blockProducersFromAllAgreements,
    async (req: Request, res: Response) => {
    try {
      const agreements = await database.getAllAgreements()
      const response: ApiResponse = {
        success: true,
        data: agreements
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch agreements',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  router.get('/producer/:address', async (req: Request, res: Response) => {
    try {
      const producerAddress = req.params.address
      
      if (!producerAddress) {
        const response: ApiResponse = {
          success: false,
          error: 'Producer address is required'
        }
        res.status(400).json(response)
        return
      }

      const agreements = await database.getAgreementsByProducer(producerAddress)
      const response: ApiResponse = {
        success: true,
        data: {
          agreements,
          producerAddress,
          totalAgreements: agreements.length
        }
      }
      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch agreements for producer',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })





  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const agreementId = parseInt(req.params.id)
      const agreement = await database.getAgreement(agreementId)

      if (!agreement) {
        const response: ApiResponse = {
          success: false,
          error: 'Agreement not found'
        }
        res.status(404).json(response)
        return
      }

      const readings = await database.getReadingsByAgreement(agreementId, 10)

      const response: ApiResponse = {
        success: true,
        data: {
          ...agreement,
          recentReadings: readings
        }
      }

      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch agreement',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  router.get('/:id/payments', async (req: Request, res: Response) => {
    try {
      const agreementId = parseInt(req.params.id)
      const payments = await database.getPaymentsByAgreement(agreementId)

      const response: ApiResponse = {
        success: true,
        data: payments
      }

      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch payments',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })


  router.get('/verify/:transactionHash', async (req: Request, res: Response) => {
    try {
      const { transactionHash } = req.params

      if (!transactionHash) {
        return res.status(400).json({
          success: false,
          error: 'Transaction hash is required'
        })
      }

      const verification = await hederaService.verifyTransaction(transactionHash)

      const response: ApiResponse<{
        transactionHash: string
        status: string
        success: boolean
        details?: any
      }> = {
        success: true,
        data: {
          transactionHash,
          status: verification.status,
          success: verification.success,
          details: verification.details
        }
      }

      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to verify transaction',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  return router
}
