import express, { Request, Response } from 'express'
import { HederaService } from '../services/hedera'
import { PrismaDatabase } from '../services/orm/prismaDatabase'
import { AuthMiddleware } from '../middleware/auth'
import { CertificateService, CertificateError, type CertificateErrorCode } from '../services/certificate'
import { pinnerFromEnv } from '../services/ipfs'
import type { ApiResponse } from '../types/index'

type CertificatePort = Pick<CertificateService, 'prepare' | 'confirm'>

const ENTITY_ID = /^\d+\.\d+\.\d+$/
const ERROR_STATUS: Record<CertificateErrorCode, number> = {
  NOT_FOUND: 404,
  NOT_RELEASED: 409,
  ALREADY_EXISTS: 409,
  INVALID_STATE: 409,
  LEDGER_MISMATCH: 409,
  INVALID_CID: 502,
  METADATA_TOO_LONG: 422
}

// Builds the certificate service from the environment; a missing setting fails the request clearly
function serviceFromEnv(hederaService: HederaService, database: PrismaDatabase): CertificatePort {
  const tokenId = process.env.NFT_TOKEN_ID
  const imageUri = process.env.CERT_IMAGE_URI
  const imageType = process.env.CERT_IMAGE_TYPE
  if (!tokenId || !ENTITY_ID.test(tokenId)) throw new Error('NFT_TOKEN_ID must be set to the certificate token id (0.0.x)')
  if (!imageUri || !imageUri.startsWith('ipfs://')) throw new Error('CERT_IMAGE_URI must be an ipfs:// URI (HIP-412 requires an image)')
  if (!imageType || !imageType.startsWith('image/')) throw new Error('CERT_IMAGE_TYPE must be the image mime type, e.g. image/png')
  return new CertificateService(database, hederaService, pinnerFromEnv(), { tokenId, imageUri, imageType })
}

export default function certificateRoutes(hederaService: HederaService, database: PrismaDatabase, deps: { service?: CertificatePort } = {}) {
  const router = express.Router()
  const authMiddleware = new AuthMiddleware(database)
  const requireManager = authMiddleware.requireRole('MANAGER')
  router.use(authMiddleware.authenticate)

  const getService = () => deps.service ?? serviceFromEnv(hederaService, database)

  const handle = (action: (service: CertificatePort, id: number) => Promise<unknown>, successStatus: number) =>
    async (req: Request, res: Response) => {
      const id = parseInt(req.params.id)
      if (isNaN(id) || id < 0) {
        return res.status(400).json({ success: false, error: 'Invalid ID' } as ApiResponse)
      }
      try {
        const data = await action(getService(), id)
        res.status(successStatus).json({ success: true, data } as ApiResponse)
      } catch (error) {
        if (error instanceof CertificateError) {
          return res.status(ERROR_STATUS[error.code]).json({ success: false, error: error.message, data: { code: error.code } } as ApiResponse)
        }
        console.error('Certificate operation failed:', error)
        res.status(500).json({
          success: false,
          error: 'Certificate operation failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        } as ApiResponse)
      }
    }

  // Pin the metadata of a released payment and schedule its mint for the supply key (2-of-3) to sign
  router.post('/payment/:id/prepare', requireManager, handle((service, paymentId) => service.prepare(paymentId), 201))

  // Record the mint once the ledger shows the schedule executed with this certificate's metadata
  router.post('/:id/confirm', requireManager, handle((service, certificateId) => service.confirm(certificateId), 200))

  router.get('/payment/:id', async (req: Request, res: Response) => {
    const paymentId = parseInt(req.params.id)
    if (isNaN(paymentId) || paymentId < 0) {
      return res.status(400).json({ success: false, error: 'Invalid ID' } as ApiResponse)
    }
    try {
      const certificate = await database.getCertificateByPayment(paymentId)
      if (!certificate) return res.status(404).json({ success: false, error: 'Certificate not found' } as ApiResponse)
      res.json({ success: true, data: certificate } as ApiResponse)
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch certificate', message: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse)
    }
  })

  return router
}
