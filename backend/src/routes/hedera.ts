import { Router } from 'express'
import type { HederaService } from '../services/hedera'
import type { PrismaDatabase } from '../services/orm/prismaDatabase'
import { AuthMiddleware } from '../middleware/auth'
import { hcsService } from '../services/hcs'
import { hfsService } from '../services/hfs'

/**
 * Hedera utility routes.
 *
 * Every route requires authentication. Routes that spend operator HBAR (HCS/HFS writes)
 * are restricted to MANAGER. The former POST /transfer endpoint, which moved HBAR from
 * the operator account to any caller-supplied address, has been removed.
 *
 * The HederaService instance is injected already initialised by server.ts; re-initialising
 * it per request created a new Client on every call.
 */
export default function hederaRoutes(hederaService: HederaService, database: PrismaDatabase) {
  const router = Router()
  const authMiddleware = new AuthMiddleware(database)

  router.use(authMiddleware.authenticate)

  // Get account balance
  router.get('/balance/:accountId', async (req, res) => {
    try {
      const { accountId } = req.params
      const balance = await hederaService.getAccountBalance(accountId)
    
      res.json({
        success: true,
        accountId,
        balance
      })
    } catch (error) {
      console.error('Error getting account balance:', error)
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get balance'
      })
    }
  })

  // Get account info
  router.get('/account/:accountId', async (req, res) => {
    try {
      const { accountId } = req.params
      const accountInfo = await hederaService.getAccountInfo(accountId)
    
      res.json({
        success: true,
        data: accountInfo
      })
    } catch (error) {
      console.error('Error getting account info:', error)
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get account info'
      })
    }
  })

  // Get transaction info
  router.get('/transaction/:transactionId', async (req, res) => {
    try {
      const { transactionId } = req.params
      // This would require implementing transaction query in HederaService
      // For now, return basic info
      res.json({
        success: true,
        transactionId,
        explorerUrl: `https://hashscan.io/testnet/transaction/${transactionId}`
      })
    } catch (error) {
      console.error('Error getting transaction info:', error)
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get transaction info'
      })
    }
  })

  // HCS endpoints
  router.get('/hcs/topic', async (req, res) => {
    try {
      const topicId = await hcsService.getTopicId()
    
      res.json({
        success: true,
        topicId,
        explorerUrl: topicId ? `https://hashscan.io/testnet/topic/${topicId}` : null
      })
    } catch (error) {
      console.error('Error getting HCS topic:', error)
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get HCS topic'
      })
    }
  })

  router.post('/hcs/publish', authMiddleware.requireRole('MANAGER'), async (req, res) => {
    try {
      const auditRecord = req.body
    
      if (!auditRecord.agreementId || !auditRecord.auditHash) {
        return res.status(400).json({
          success: false,
          error: 'agreementId and auditHash are required'
        })
      }

      const transactionId = await hcsService.publishAuditRecord(auditRecord)
    
      res.json({
        success: true,
        transactionId,
        explorerUrl: await hcsService.getHederaExplorerUrl(transactionId)
      })
    } catch (error) {
      console.error('Error publishing to HCS:', error)
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish to HCS'
      })
    }
  })

  // HFS endpoints
  router.post('/hfs/report', authMiddleware.requireRole('MANAGER'), async (req, res) => {
    try {
      const auditReport = req.body
    
      if (!auditReport.agreementId || !auditReport.auditHash) {
        return res.status(400).json({
          success: false,
          error: 'agreementId and auditHash are required'
        })
      }

      const fileId = await hfsService.createAuditReport(auditReport)
    
      res.json({
        success: true,
        fileId,
        explorerUrl: await hfsService.getHederaExplorerUrl(fileId)
      })
    } catch (error) {
      console.error('Error creating HFS report:', error)
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create HFS report'
      })
    }
  })

  router.post('/hfs/append/:fileId', authMiddleware.requireRole('MANAGER'), async (req, res) => {
    try {
      const { fileId } = req.params
      const additionalData = req.body
    
      await hfsService.appendToReport(fileId, additionalData)
    
      res.json({
        success: true,
        fileId,
        explorerUrl: await hfsService.getHederaExplorerUrl(fileId)
      })
    } catch (error) {
      console.error('Error appending to HFS file:', error)
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to append to HFS file'
      })
    }
  })

  return router
}
