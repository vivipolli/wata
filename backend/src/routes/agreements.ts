import express, { Request, Response } from 'express'
import crypto from 'crypto'
import { HederaService } from '../services/hedera'
import { PrismaDatabase } from '../services/orm/prismaDatabase'
import { AuthMiddleware } from '../middleware/auth'
import type { ApiResponse, CreateAgreementWithSignatureRequest } from '../types/index'

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
}

// Body fields that must never be accepted when creating an agreement
const FORBIDDEN_CREATE_FIELDS = ['blockchainId', 'blockchain_id', 'signedTransaction'] as const

export default function agreementRoutes(hederaService: HederaService, database: PrismaDatabase) {
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
        durationDays
      })

      // Create the agreement on-chain; the ID is read from the transaction record
      const result = await hederaService.createAgreementWithSystem(
        agreementHash,
        producerAddress,
        baseValue,
        hectares
      )
      const blockchainId = result.agreementId
      const transactionId = result.transactionId
      await database.updateAgreementBlockchainId(agreementId, blockchainId)

      const response: ApiResponse<CreateAgreementResponse> = {
        success: true,
        data: {
          id: agreementId,
          blockchainId: blockchainId,
          transactionId: transactionId,
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
