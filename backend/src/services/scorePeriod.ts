import crypto from 'crypto'
import { computeScore, type Measurement } from '../score/engine'
import { canonicalJson } from './certificate'
import { PILOT_RULE } from '../score/rules'
import type { ScoreRule } from '../score/rule'
import type { EscrowService } from './escrow'
import type { HederaConsensusService } from './hcs'

export type ScorePeriodErrorCode = 'INVALID_PERIOD' | 'NOT_FOUND' | 'NOT_READY' | 'OVERLAP' | 'LEDGER'

export class ScorePeriodError extends Error {
  constructor(public readonly code: ScorePeriodErrorCode, message: string) {
    super(message)
    this.name = 'ScorePeriodError'
  }
}

interface ScorePeriodDatabase {
  getAgreement(id: number): Promise<any>
  getMeasurements(stationCode: string, from: Date, to: Date): Promise<any[]>
  reserveScoreBatch(data: {
    agreementId: number; auditHash: string; score: number; readingsCount: number
    periodStart: Date; periodEnd: Date; scoreVersion: number; auditDocument: string
  }): Promise<{ batchId: number; resumed: boolean } | { overlap: number }>
  updateBatchStatus(batchId: number, status: string, submittedAt?: Date, periodId?: number): Promise<void>
  createOracleLog(data: { batchId: number; action: string; details?: string; transactionHash?: string }): Promise<number>
  attachBatchLedgerReferences(batchId: number, info: { hcsTransactionId?: string | null }): Promise<void>
}

type AuditPublisher = Pick<HederaConsensusService, 'publishAuditRecord'>

/**
 * Scores an agreement's monitoring station over a period from stored measurements and submits the
 * result to the escrow. The audit document lists every measurement used (with its source record),
 * the rule and the result; its SHA-256 is the on-chain audit hash, so anyone can recompute it.
 */
export class ScorePeriodOracle {
  constructor(
    private readonly database: ScorePeriodDatabase,
    private readonly escrow: () => Pick<EscrowService, 'submitBatch'>,
    private readonly audit: () => Promise<AuditPublisher>,
    private readonly rule: ScoreRule = PILOT_RULE
  ) {}

  async scorePeriod(agreementId: number, from: Date, to: Date) {
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
      throw new ScorePeriodError('INVALID_PERIOD', 'from and to must be valid dates with from <= to')
    }
    const agreement = await this.database.getAgreement(agreementId)
    if (!agreement) throw new ScorePeriodError('NOT_FOUND', 'Agreement not found')
    // On-chain IDs start at 0, so only null means "not linked"
    if (!agreement.station_code || agreement.blockchain_id == null) {
      throw new ScorePeriodError('NOT_READY', 'The agreement needs a monitoring station and an on-chain link')
    }

    const rows = await this.database.getMeasurements(agreement.station_code, from, to)
    const measurements: Measurement[] = rows.map(r => ({
      parameter: r.parameter, value: r.value, unit: r.unit, qualifier: r.qualifier,
      station: r.station_code, sampledAt: new Date(r.sampled_at).toISOString()
    }))
    const result = computeScore(measurements, this.rule)
    if (result.status !== 'scored' || result.score === null || result.onchainScore === null) {
      return { status: 'no_score' as const, report: result }
    }

    // Measurements sorted by source record so the document does not depend on query order
    const used = rows
      .map(r => ({
        ref: `${r.source}:${r.source_ref}`, parameter: r.parameter, value: r.value, unit: r.unit,
        qualifier: r.qualifier, sampledAt: new Date(r.sampled_at).toISOString()
      }))
      .sort((a, b) => (a.ref + a.parameter < b.ref + b.parameter ? -1 : a.ref + a.parameter > b.ref + b.parameter ? 1 : 0))
    const auditDocument = canonicalJson({
      type: 'wata-score-period',
      agreementId,
      onchainAgreementId: agreement.blockchain_id,
      station: agreement.station_code,
      period: { from: from.toISOString(), to: to.toISOString() },
      rule: this.rule,
      measurements: used,
      result
    })
    const auditHash = crypto.createHash('sha256').update(auditDocument).digest('hex')

    const reservation = await this.database.reserveScoreBatch({
      agreementId, auditHash, score: result.score, readingsCount: rows.length,
      periodStart: from, periodEnd: to, scoreVersion: this.rule.version, auditDocument
    })
    if ('overlap' in reservation) {
      throw new ScorePeriodError('OVERLAP', `The period overlaps batch ${reservation.overlap} of this agreement`)
    }
    const batchId = reservation.batchId
    // The batch is the on-chain period
    const periodId = batchId

    let submission
    try {
      submission = await this.escrow().submitBatch({
        agreementId: agreement.blockchain_id, periodId, auditHash, score: result.onchainScore, scoreVersion: this.rule.version
      })
    } catch (error) {
      // The batch stays unsubmitted: the same period (same audit hash) can be retried
      throw new ScorePeriodError('LEDGER', error instanceof Error ? error.message : 'Escrow submission failed')
    }

    await this.database.updateBatchStatus(batchId, 'submitted', new Date(), periodId)
    await this.database.createOracleLog({
      batchId,
      action: 'score_period_submitted',
      details: JSON.stringify({ transactionId: submission.transactionId, periodId, onchainState: submission.state, ruleVersion: this.rule.version }),
      transactionHash: submission.transactionHash ?? undefined
    })

    let hcsTransactionId: string | undefined
    try {
      hcsTransactionId = await (await this.audit()).publishAuditRecord({
        agreementId: String(agreementId),
        batchId,
        auditHash,
        score: result.score,
        timestamp: new Date().toISOString(),
        transactionHash: submission.transactionHash ?? submission.transactionId,
        producerAddress: agreement.producer_address
      })
      await this.database.attachBatchLedgerReferences(batchId, { hcsTransactionId })
    } catch (error) {
      // The submission is final on-chain; a failed publication is logged and never undoes it
      console.error(`HCS publication failed for batch ${batchId}:`, error)
    }

    return {
      status: 'submitted' as const,
      batchId, periodId, auditHash, onchainScore: result.onchainScore, onchainState: submission.state,
      transactionId: submission.transactionId, transactionHash: submission.transactionHash, hcsTransactionId, report: result
    }
  }
}
