import express, { Request, Response } from 'express'
import { HederaService } from '../services/hedera'
import type { PrismaDatabase } from '../services/orm/prismaDatabase'
import { AuthMiddleware } from '../middleware/auth'
import type { HederaConsensusService } from '../services/hcs'
import { isUniqueViolation } from '../utils/prismaErrors'
import type { TriggerCheckRequest, ApiResponse } from '../types/index'
import type { EscrowService, EscrowPeriod, ReleaseResult } from '../services/escrow'

type EscrowPort = Pick<EscrowService, 'getPeriod' | 'getAgreement' | 'release' | 'findRelease'>

// A transaction unknown to the ledger this long after its valid start can no longer reach consensus:
// the SDK's valid duration (120 s) plus a margin for Mirror Node lag.
const UNKNOWN_TX_GRACE_SECONDS = 180
// A processing payment without a transaction id this old was never sent (the id is stored first).
const NO_TX_GRACE_SECONDS = 300
const SDK_TRANSACTION_ID = /^\d+\.\d+\.\d+@(\d+)\.\d+$/
type AuditPublisher = Pick<HederaConsensusService, 'publishAuditRecord'>

interface PaymentDeps {
  escrow?: EscrowPort
  // Publishes each release to HCS as an immutable audit record; defaults to the HCS service
  audit?: AuditPublisher
}

// Local context of a payment, used for its audit record
interface ReleaseContext {
  paymentId: number
  agreementId: number
  batchId: number | null
  auditHash: string | null
  score: number | null
}

interface PaymentCheckResult {
  success: boolean
  message: string
  paymentId: number
  outcome: ReleaseResult['outcome']
  // Decimal string in the contract's native unit
  amount: string
  transactionId: string
  transactionHash: string
  hcsTransactionId?: string
}

interface PaymentStats {
  pendingPayments: number
  // Decimal string: amounts are summed exactly
  totalPendingAmount: string
}

export default function paymentRoutes(hederaService: HederaService, database: PrismaDatabase, deps: PaymentDeps = {}) {
  const { escrow } = deps
  // The HCS service builds its client from the environment on import, so it is loaded on first use
  const getAudit = async (): Promise<AuditPublisher> => deps.audit ?? (await import('../services/hcs')).hcsService
  const router = express.Router()
  const authMiddleware = new AuthMiddleware(database)
  const requireManager = authMiddleware.requireRole('MANAGER')

  // Every payments route requires an authenticated user
  router.use(authMiddleware.authenticate)

  // Resolved per request so a missing ESCROW_CONTRACT_ADDRESS fails the request, not the startup
  const getEscrow = (): EscrowPort => escrow ?? hederaService.getEscrowService()

  const fail = (res: Response, status: number, error: string, data?: unknown) => {
    const response: ApiResponse = { success: false, error, ...(data ? { data } : {}) }
    return res.status(status).json(response)
  }

  /**
   * Explains why an on-chain period cannot be released. Returns null when it is Approved for
   * this audit hash. The chain decides: local scores and statuses are never used for this.
   */
  async function blockReason(port: EscrowPort, onchainAgreementId: number, period: EscrowPeriod, auditHash: string | null) {
    if (auditHash && period.auditHash.toLowerCase() !== auditHash.replace(/^0x/i, '').toLowerCase()) {
      return { status: 409, error: 'The on-chain period holds a different audit hash than the local record' }
    }
    switch (period.state) {
      case 'Approved':
        return null
      case 'PendingApproval':
        return { status: 409, error: 'Period is awaiting approval by the financial manager', data: { approvalDeadline: period.approvalDeadline } }
      case 'Released':
        return { status: 409, error: 'Period was already released on-chain; reconcile the payment from the ledger record' }
      case 'None':
        return { status: 409, error: 'Batch is not registered on-chain for this period' }
      case 'Rejected': {
        const terms = await port.getAgreement(onchainAgreementId)
        return { status: 400, error: `Score ${period.score} is below the on-chain threshold of ${terms.scoreThreshold}` }
      }
      default:
        return { status: 400, error: `Period is ${period.state} on-chain and cannot be released` }
    }
  }

  // Publishes a recorded release to HCS. The release is final on-chain; a failed publication is logged and never undoes it.
  async function publishRelease(context: ReleaseContext, release: ReleaseResult, periodId: number): Promise<string | undefined> {
    try {
      const hcsTransactionId = await (await getAudit()).publishAuditRecord({
        agreementId: String(context.agreementId),
        batchId: context.batchId ?? periodId,
        auditHash: context.auditHash ?? '',
        score: context.score ?? 0,
        timestamp: new Date().toISOString(),
        transactionHash: release.transactionHash,
        producerAddress: release.producer
      })
      await database.attachPaymentHcs(context.paymentId, hcsTransactionId)
      return hcsTransactionId
    } catch (error) {
      console.error(`HCS publication failed for payment ${context.paymentId}:`, error)
      return undefined
    }
  }

  // Executes the release of a claimed payment, records the ledger outcome and publishes it to HCS
  async function executeRelease(res: Response, port: EscrowPort, context: ReleaseContext, onchainAgreementId: number, periodId: number) {
    const { paymentId } = context
    let release: ReleaseResult
    try {
      // The transaction id is stored before sending, so a lost outcome can be reconciled from the ledger
      release = await port.release(onchainAgreementId, periodId, async transactionId => {
        if (!(await database.setPaymentTransactionId(paymentId, transactionId))) {
          throw new Error('Payment is no longer being processed; release not sent')
        }
      })
    } catch (error) {
      await database.markPaymentFailed(paymentId)
      return fail(res, 502, 'Escrow release failed', { paymentId, reason: error instanceof Error ? error.message : 'Unknown error' })
    }
    await database.recordPaymentRelease(paymentId, {
      status: release.outcome === 'released' ? 'completed' : 'deferred',
      transactionId: release.transactionId,
      transactionHash: release.transactionHash,
      onchainState: 'Released'
    })

    const hcsTransactionId = await publishRelease(context, release, periodId)

    const response: ApiResponse<PaymentCheckResult> = {
      success: true,
      data: {
        success: true,
        message: release.outcome === 'released'
          ? `Period ${periodId} released to the producer`
          : `Period ${periodId} released; the payout is held by the contract for the producer to withdraw`,
        paymentId,
        outcome: release.outcome,
        amount: release.amount,
        transactionId: release.transactionId,
        transactionHash: release.transactionHash,
        hcsTransactionId
      }
    }
    return res.json(response)
  }

  // Release the latest validated period of an agreement through the escrow contract
  router.post('/trigger-check/:agreementId', requireManager, async (req: Request, res: Response) => {
    try {
      const agreementId = parseInt(req.params.agreementId)
      if (isNaN(agreementId) || agreementId < 0) {
        return fail(res, 400, 'Invalid agreement ID')
      }

      const agreement = await database.getAgreement(agreementId)
      if (!agreement) {
        return fail(res, 404, 'Agreement not found')
      }

      const batches = await database.getBatchesByAgreement(agreementId, 1)
      if (batches.length === 0) {
        return fail(res, 404, 'No batches found for this agreement')
      }
      const latestBatch = batches[0]

      // On-chain IDs start at 0, so only null means "not on-chain"
      if (agreement.blockchain_id == null) {
        return fail(res, 409, 'Agreement is not linked to an on-chain agreement')
      }
      if (latestBatch.period_id == null) {
        return fail(res, 409, 'Latest batch has not been submitted to the escrow contract')
      }

      // Idempotency: one payment record per validated batch (keyed by audit hash)
      const existingPayments = await database.getPaymentsByAgreement(agreementId)
      const existing = existingPayments.find(p => p.audit_hash === latestBatch.audit_hash)
      if (existing) {
        return fail(res, 409, 'A payment already exists for the latest validated batch', { paymentId: existing.id, status: existing.status })
      }

      const port = getEscrow()
      const period = await port.getPeriod(agreement.blockchain_id, latestBatch.period_id)
      const blocked = await blockReason(port, agreement.blockchain_id, period, latestBatch.audit_hash)
      if (blocked) {
        return fail(res, blocked.status, blocked.error, blocked.data)
      }

      // The amount is the contract's, not a local computation
      const terms = await port.getAgreement(agreement.blockchain_id)

      // Reserve the payment before touching the ledger: the unique (agreement, audit hash) index
      // lets exactly one request through to the release.
      let paymentId: number
      try {
        paymentId = await database.createPayment({
          agreementId,
          batchId: latestBatch.id,
          amount: terms.periodAmount,
          status: 'processing',
          auditHash: latestBatch.audit_hash,
          score: latestBatch.score,
          periodId: latestBatch.period_id,
          onchainState: period.state
        })
      } catch (error) {
        if (isUniqueViolation(error)) {
          return fail(res, 409, 'A payment already exists for the latest validated batch')
        }
        throw error
      }

      const context = { paymentId, agreementId, batchId: latestBatch.id, auditHash: latestBatch.audit_hash, score: latestBatch.score }
      return await executeRelease(res, port, context, agreement.blockchain_id, latestBatch.period_id)
    } catch (error) {
      console.error('Error triggering payment check:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to trigger payment check',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get payment status for an agreement
  router.get('/agreement/:agreementId', async (req: Request, res: Response) => {
    try {
      const agreementId = parseInt(req.params.agreementId)
      const payments = await database.getPaymentsByAgreement(agreementId)

      const response: ApiResponse = {
        success: true,
        data: payments
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching payments:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch payments',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get all pending payments
  router.get('/pending', async (req: Request, res: Response) => {
    try {
      const pendingPayments = await database.getPendingPayments()

      const response: ApiResponse = {
        success: true,
        data: pendingPayments
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching pending payments:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch pending payments',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Retry the release of a pending or failed payment (idempotent: the chain state decides)
  router.post('/process/:paymentId', requireManager, async (req: Request, res: Response) => {
    try {
      const paymentId = parseInt(req.params.paymentId)
      if (isNaN(paymentId) || paymentId < 0) {
        return fail(res, 400, 'Invalid payment ID')
      }

      const payment = await database.getPayment(paymentId)
      if (!payment) {
        return fail(res, 404, 'Payment not found')
      }
      if (payment.status !== 'pending' && payment.status !== 'failed') {
        return fail(res, 409, `Payment is ${payment.status} and cannot be processed`)
      }

      const agreement = await database.getAgreement(payment.agreement_id)
      if (!agreement || agreement.blockchain_id == null || payment.period_id == null) {
        return fail(res, 409, 'Payment is not linked to an on-chain period')
      }

      const port = getEscrow()
      const period = await port.getPeriod(agreement.blockchain_id, payment.period_id)
      const blocked = await blockReason(port, agreement.blockchain_id, period, payment.audit_hash)
      if (blocked) {
        return fail(res, blocked.status, blocked.error, blocked.data)
      }

      // Only the request that moves the payment to 'processing' may release it
      if (!(await database.claimPaymentForRelease(paymentId))) {
        return fail(res, 409, 'Payment is already being processed')
      }

      const context = { paymentId, agreementId: payment.agreement_id, batchId: payment.batch_id, auditHash: payment.audit_hash, score: payment.score }
      return await executeRelease(res, port, context, agreement.blockchain_id, payment.period_id)
    } catch (error) {
      console.error('Error processing payment:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to process payment',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Reconcile payments whose release outcome was lost (crash, timeout) from the ledger record.
  // Nothing is sent: outcomes are read by the stored transaction id and recorded only if they check out.
  router.post('/reconcile', requireManager, async (req: Request, res: Response) => {
    try {
      const port = getEscrow()
      const now = Date.now() / 1000
      const results: Array<{ paymentId: number; action: string; reason?: string }> = []

      for (const payment of await database.getPaymentsToReconcile()) {
        const done = (action: string, reason?: string) => results.push({ paymentId: payment.id, action, ...(reason ? { reason } : {}) })
        const agreement = await database.getAgreement(payment.agreement_id)
        if (!agreement || agreement.blockchain_id == null || payment.period_id == null) {
          done('error', 'Payment is not linked to an on-chain period')
          continue
        }

        const transactionId = payment.transaction_id
        if (!transactionId) {
          // The id is stored before sending, so no id means the release was never sent
          if (payment.status === 'processing' && now - payment.created_at.getTime() / 1000 > NO_TX_GRACE_SECONDS) {
            await database.markPaymentFailed(payment.id, null)
            done('failed')
          } else {
            done('waiting')
          }
          continue
        }

        let lookup
        try {
          lookup = await port.findRelease(transactionId, agreement.blockchain_id, payment.period_id)
        } catch (error) {
          done('error', error instanceof Error ? error.message : 'Unknown error')
          continue
        }

        if (lookup.status === 'released') {
          const fromStatus = payment.status === 'failed' ? 'failed' : 'processing'
          await database.recordPaymentRelease(payment.id, {
            status: lookup.release.outcome === 'released' ? 'completed' : 'deferred',
            transactionId: lookup.release.transactionId,
            transactionHash: lookup.release.transactionHash,
            onchainState: 'Released'
          }, fromStatus, transactionId)
          await publishRelease({
            paymentId: payment.id, agreementId: payment.agreement_id, batchId: payment.batch_id,
            auditHash: payment.audit_hash, score: payment.score
          }, lookup.release, payment.period_id)
          done(lookup.release.outcome === 'released' ? 'completed' : 'deferred')
          continue
        }

        const validStart = Number(SDK_TRANSACTION_ID.exec(transactionId)?.[1] ?? NaN)
        const settled = lookup.status === 'failed' || (Number.isFinite(validStart) && now - validStart > UNKNOWN_TX_GRACE_SECONDS)
        if (!settled) {
          done('waiting')
        } else if (payment.status === 'processing') {
          await database.markPaymentFailed(payment.id, transactionId)
          done('failed')
        } else {
          done('unchanged')
        }
      }

      const response: ApiResponse = { success: true, data: results }
      res.json(response)
    } catch (error) {
      console.error('Error reconciling payments:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to reconcile payments',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get payment history
  router.get('/history', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50
      const status = req.query.status as string | undefined
      
      const payments = await database.getPaymentHistory({ limit, status })

      const response: ApiResponse = {
        success: true,
        data: { payments }
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching payment history:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch payment history',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get payments by user address (for producers)
  router.get('/user-payments/:userAddress', async (req: Request, res: Response) => {
    try {
      const userAddress = req.params.userAddress
      const limit = parseInt(req.query.limit as string) || 50
      const status = req.query.status as string | undefined

      if (!userAddress) {
        const response: ApiResponse = {
          success: false,
          error: 'User address is required'
        }
        return res.status(400).json(response)
      }

      const payments = await database.getPaymentsByProducerAddress({
        producerAddress: userAddress,
        limit,
        status
      })

      const response: ApiResponse = {
        success: true,
        data: { payments }
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching user payments:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch user payments',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get payment statistics
  router.get('/stats', async (req: Request, res: Response) => {
    try {
      const pendingPayments = await database.getPendingPayments()
      
      const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + BigInt(p.amount), 0n).toString()

      const response: ApiResponse<PaymentStats> = {
        success: true,
        data: {
          pendingPayments: pendingPayments.length,
          totalPendingAmount
        }
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching payment stats:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch payment statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Operator-funded investments are disabled. The previous handler signed and paid the
  // investment with the system operator key, so any caller could drain the operator account.
  // Investments must be signed and paid by the investor's own wallet.
  router.post('/contribute/:agreementId', (req: Request, res: Response) => {
    const response: ApiResponse = {
      success: false,
      error: 'Operator-funded investments are disabled. The investor must sign and pay from their own wallet.'
    }
    res.status(410).json(response)
  })

  // Create investment transaction for investor to sign
  router.post('/create-investment-transaction/:agreementId', authMiddleware.requireRole('INVESTOR'), async (req: Request, res: Response) => {
    try {
      const agreementId = parseInt(req.params.agreementId)
      const { amount, investorAddress } = req.body

      if (isNaN(agreementId) || agreementId < 0) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid agreement ID'
        }
        return res.status(400).json(response)
      }

      if (!amount || amount <= 0) {
        const response: ApiResponse = {
          success: false,
          error: 'Investment amount must be greater than 0'
        }
        return res.status(400).json(response)
      }

      if (!investorAddress) {
        const response: ApiResponse = {
          success: false,
          error: 'Investor address is required'
        }
        return res.status(400).json(response)
      }

      // Check if agreement exists and is active
      const agreement = await database.getAgreement(agreementId)
      if (!agreement) {
        const response: ApiResponse = {
          success: false,
          error: 'Agreement not found'
        }
        return res.status(404).json(response)
      }

      if (!agreement.is_active) {
        const response: ApiResponse = {
          success: false,
          error: 'Agreement is not active'
        }
        return res.status(400).json(response)
      }

      // Create investment transaction for investor to sign
      const transactionResult = await hederaService.createInvestmentTransaction(
        agreementId,
        amount,
        investorAddress
      )

      if (transactionResult.success) {
        const response: ApiResponse = {
          success: true,
          data: {
            agreementId,
            amount,
            investorAddress,
            transactionBytes: transactionResult.transactionBytes,
            message: 'Transaction created for investor signature'
          }
        }

        res.json(response)
      } else {
        const response: ApiResponse = {
          success: false,
          error: 'Failed to create investment transaction',
          message: transactionResult.error
        }
        res.status(500).json(response)
      }
    } catch (error) {
      console.error('Error creating investment transaction:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to create investment transaction',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get investments for an agreement
  router.get('/investments/:agreementId', async (req: Request, res: Response) => {
    try {
      const agreementId = parseInt(req.params.agreementId)

      if (isNaN(agreementId) || agreementId < 0) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid agreement ID'
        }
        return res.status(400).json(response)
      }

      const investments = await database.getInvestmentsByAgreement(agreementId)

      const response: ApiResponse = {
        success: true,
        data: investments
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching investments:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch investments',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get investments by user address
  router.get('/user-investments/:userAddress', async (req: Request, res: Response) => {
    try {
      const userAddress = req.params.userAddress

      if (!userAddress) {
        const response: ApiResponse = {
          success: false,
          error: 'User address is required'
        }
        return res.status(400).json(response)
      }

      const investments = await database.getInvestmentsByUser(userAddress)

      const response: ApiResponse = {
        success: true,
        data: investments
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching user investments:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch user investments',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(response)
    }
  })

  // Get blockchain records for a user
  router.get('/blockchain-records', async (req: Request, res: Response) => {
    console.log('Blockchain records endpoint called')
    try {
      const userAddress = req.query.userAddress as string
      const limit = parseInt(req.query.limit as string) || 20

      if (!userAddress) {
        const response: ApiResponse = {
          success: false,
          error: 'userAddress is required'
        }
        res.status(400).json(response)
        return
      }

      const payments = await database.getPaymentsWithBlockchainData({
        producerAddress: userAddress,
        limit
      })

      const response: ApiResponse = {
        success: true,
        data: {
          records: payments,
          total: payments.length,
          userAddress
        }
      }

      res.json(response)
    } catch (error) {
      console.error('Error fetching blockchain records:', error)
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch blockchain records'
      }
      res.status(500).json(response)
    }
  })

  return router
}
