import express, { Request, Response } from 'express'
import crypto from 'crypto'
import { HederaService } from '../services/hedera'
import { Database } from '../database'
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

export default function agreementRoutes(hederaService: HederaService, database: Database) {
  const router = express.Router()
  const authMiddleware = new AuthMiddleware(database)

  router.post('/', async (req: Request, res: Response) => {
    try {
      const {
        producerName,
        producerAddress,
        baseValue,
        hectares,
        locationLat,
        locationLng,
        durationDays,
        signedTransaction
      }: CreateAgreementWithSignatureRequest = req.body

      if (!producerName || !producerAddress || !baseValue || !hectares) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: producerName, producerAddress, baseValue, hectares'
        } as ApiResponse)
      }

      if (signedTransaction || req.body.blockchainId) {
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

        const blockchainId = req.body.blockchainId
        if (blockchainId) {
          await database.updateAgreementBlockchainId(agreementId, blockchainId)
        }

        const response: ApiResponse<CreateAgreementResponse> = {
          success: true,
          data: {
            id: agreementId,
            blockchainId: blockchainId,
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

        return res.status(201).json(response)
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

      const result = await hederaService.createAgreementWithSystem(
        agreementHash,
        producerAddress,
        baseValue,
        hectares
      )

      await database.updateAgreementBlockchainId(agreementId, result.agreementId)

      const response: ApiResponse<CreateAgreementResponse> = {
        success: true,
        data: {
          id: agreementId,
          blockchainId: result.agreementId,
          transactionId: result.transactionId,
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
    authMiddleware.authenticate,
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

  router.post('/create-agreement', async (req: Request, res: Response) => {
    try {
      const { agreementHash, producerAddress, baseValue, hectares, producerName, locationLat, locationLng, durationDays } = req.body

      if (!agreementHash || !producerAddress || !baseValue || !hectares) {
        return res.status(400).json({
          success: false,
          error: 'Agreement hash, producer address, base value, and hectares are required'
        })
      }

      const finalAgreementId = await database.createAgreement({
        agreementHash,
        producerName: producerName || 'Unknown Producer',
        producerAddress,
        baseValue,
        hectares,
        locationLat,
        locationLng,
        durationDays
      })

      const result = await hederaService.createAgreementWithSystem(
        agreementHash,
        producerAddress,
        baseValue,
        hectares
      )

      await database.updateAgreementBlockchainId(finalAgreementId, result.agreementId)

      const response: ApiResponse<{
        agreementId: number
        transactionId: string
        success: boolean
      }> = {
        success: true,
        data: {
          agreementId: result.agreementId,
          transactionId: result.transactionId,
          success: true
        }
      }

      res.json(response)
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to create agreement',
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
