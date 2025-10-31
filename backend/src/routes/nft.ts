import { Router, Request, Response } from 'express'
import { NftService } from '../services/nft'
import { getPrismaClient } from '../services/orm/prismaDatabase'

const router = Router()
const nftService = new NftService()
const prisma = getPrismaClient()

// Initialize NFT service
nftService.initialize().catch(err => {
  console.error('Failed to initialize NFT service in routes:', err.message)
})

router.get('/check-association/:accountId/:tokenId', async (req: Request, res: Response) => {
  try {
    let { accountId, tokenId } = req.params

    if (!accountId || !tokenId) {
      return res.status(400).json({
        success: false,
        error: 'Account ID and Token ID are required'
      })
    }

    // If EVM address is provided, look up Hedera Account ID from database
    if (accountId.startsWith('0x')) {
      const agreement = await prisma.agreements.findFirst({
        where: {
          producer_address: accountId
        },
        select: {
          hedera_account_id: true
        }
      })

      if (!agreement) {
        return res.status(404).json({
          success: false,
          error: 'Producer not found'
        })
      }

      if (!agreement.hedera_account_id) {
        return res.status(400).json({
          success: false,
          error: 'Producer Hedera Account ID not configured. Please set hedera_account_id in agreement.'
        })
      }

      // Use the Hedera Account ID from database
      accountId = agreement.hedera_account_id
    }

    const isAssociated = await nftService.checkTokenAssociation(accountId, tokenId)

    return res.json({
      success: true,
      isAssociated
    })
  } catch (error: any) {
    console.error('Error checking token association:', error)
    return res.status(500).json({
      success: false,
      error: error.message ?? 'Failed to check token association'
    })
  }
})

router.post('/claim/:serialNumber', async (req: Request, res: Response) => {
  try {
    const { serialNumber } = req.params
    let { userAddress } = req.body

    if (!serialNumber || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Serial number and user address are required'
      })
    }

    const serial = parseInt(serialNumber, 10)
    if (isNaN(serial)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid serial number'
      })
    }

    // If EVM address is provided, look up Hedera Account ID from database
    if (userAddress.startsWith('0x')) {
      const agreement = await prisma.agreements.findFirst({
        where: {
          producer_address: userAddress
        },
        select: {
          hedera_account_id: true
        }
      })

      if (!agreement?.hedera_account_id) {
        return res.status(400).json({
          success: false,
          error: 'Producer Hedera Account ID not configured'
        })
      }

      userAddress = agreement.hedera_account_id
    }

    const payment = await prisma.payments.findFirst({
      where: {
        nft_serial: serial,
        producer_nft_transferred: false
      }
    })

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found or already claimed'
      })
    }

    if (!payment.nft_token_id) {
      return res.status(400).json({
        success: false,
        error: 'NFT token ID not found'
      })
    }

    const isAssociated = await nftService.checkTokenAssociation(
      userAddress,
      payment.nft_token_id
    )

    if (!isAssociated) {
      return res.status(400).json({
        success: false,
        error: 'Token not associated. Please associate the token first.'
      })
    }

    const transferResult = await nftService.transferNFT(
      payment.nft_token_id,
      serial,
      userAddress,
      `Claim NFT Certificate #${serial}`
    )

    if (transferResult.success) {
      await prisma.payments.update({
        where: { id: payment.id },
        data: {
          producer_nft_transferred: true,
          producer_nft_transfer_tx: transferResult.transactionId
        }
      })

      return res.json({
        success: true,
        transactionId: transferResult.transactionId,
        message: 'NFT claimed successfully'
      })
    } else {
      return res.status(500).json({
        success: false,
        error: transferResult.error ?? 'Failed to transfer NFT'
      })
    }
  } catch (error: any) {
    console.error('Error claiming NFT:', error)
    return res.status(500).json({
      success: false,
      error: error.message ?? 'Failed to claim NFT'
    })
  }
})

router.get('/pending/:userAddress', async (req: Request, res: Response) => {
  try {
    const { userAddress } = req.params

    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: 'User address is required'
      })
    }

    const agreements = await prisma.agreements.findMany({
      where: {
        producer_address: userAddress
      },
      select: {
        id: true
      }
    })

    const agreementIds = agreements.map((a) => a.id)

    const pendingPayments = await prisma.payments.findMany({
      where: {
        agreement_id: { in: agreementIds },
        nft_serial: { not: null },
        producer_nft_transferred: false
      },
      select: {
        id: true,
        nft_serial: true,
        nft_token_id: true,
        agreement_id: true,
        amount: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    const pendingNFTs = pendingPayments.map((p) => ({
      serialNumber: p.nft_serial,
      tokenId: p.nft_token_id,
      agreementId: p.agreement_id,
      amount: p.amount,
      created_at: p.created_at
    }))

    return res.json({
      success: true,
      data: pendingNFTs
    })
  } catch (error: any) {
    console.error('Error fetching pending NFTs:', error)
    return res.status(500).json({
      success: false,
      error: error.message ?? 'Failed to fetch pending NFTs'
    })
  }
})

export default router

