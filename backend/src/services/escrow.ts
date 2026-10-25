import { Interface, type LogDescription } from 'ethers'
import { sha256HexToBytes32 } from '../utils/bytes32'

/**
 * Minimal ABI of PESEscrowV3: only what the backend calls or reads. A test compares every
 * fragment with the compiled artifact, so a contract change cannot silently break encoding.
 * Enums are uint8 on the wire (GovernanceMode, PeriodState).
 */
export const ESCROW_ABI = [
  'function submitBatch(uint256 agreementId, uint256 periodId, bytes32 auditHash, uint8 score, uint16 scoreVersion)',
  'function release(uint256 agreementId, uint256 periodId)',
  'function getAgreement(uint256 agreementId) view returns (tuple(address producer, address funder, uint256 periodAmount, uint8 scoreThreshold, uint8 mode, bool active, uint256 deposited, uint256 released, uint256 refunded, uint256 committed))',
  'function getPeriod(uint256 agreementId, uint256 periodId) view returns (tuple(uint8 state, bytes32 auditHash, uint8 score, uint16 scoreVersion, address submitter, uint64 approvalDeadline))',
  'event BatchSubmitted(uint256 indexed agreementId, uint256 indexed periodId, bytes32 auditHash, uint8 score, uint16 scoreVersion, uint8 state)',
  'event PeriodReleased(uint256 indexed agreementId, uint256 indexed periodId, address indexed producer, uint256 amount)',
  'event PayoutDeferred(address indexed to, uint256 amount)'
]

// Order must follow the Solidity enum declarations.
export const GOVERNANCE_MODES = ['AUTO', 'HYBRID'] as const
export const PERIOD_STATES = ['None', 'PendingApproval', 'Approved', 'Released', 'Rejected', 'InReview', 'ClosedNoPay'] as const

export type GovernanceMode = typeof GOVERNANCE_MODES[number]
export type PeriodState = typeof PERIOD_STATES[number]

export interface EscrowLog {
  // EVM address of the contract that emitted the log
  address: string
  topics: string[]
  data: string
}

export interface ContractExecution {
  transactionId: string
  // Receipt status as reported by the ledger, e.g. SUCCESS or CONTRACT_REVERT_EXECUTED
  status: string
  // Hex hash from the transaction record; null when the record did not provide one
  transactionHash: string | null
  logs: EscrowLog[]
}

/** Transport to the ledger. Production uses the Hedera SDK; tests use a fake. */
export interface EscrowLedger {
  execute(contractAddress: string, callData: string): Promise<ContractExecution>
  query(contractAddress: string, callData: string): Promise<string>
}

export type EscrowErrorCode = 'INVALID_INPUT' | 'TX_FAILED' | 'MISSING_EVENT' | 'MISSING_HASH'

export class EscrowError extends Error {
  constructor(public readonly code: EscrowErrorCode, message: string) {
    super(message)
    this.name = 'EscrowError'
  }
}

export interface SubmitBatchInput {
  agreementId: number
  periodId: number
  // Hex SHA-256 digest of the batch (64 hex characters, optional 0x)
  auditHash: string
  // Integer 0-100
  score: number
  scoreVersion: number
}

export interface SubmitBatchResult {
  transactionId: string
  transactionHash: string | null
  state: PeriodState
}

export interface ReleaseResult {
  // deferred: the contract kept the funds as a pending withdrawal for the producer
  outcome: 'released' | 'deferred'
  // Decimal string in the contract's native unit
  amount: string
  producer: string
  transactionId: string
  transactionHash: string
}

export interface EscrowAgreement {
  producer: string
  funder: string
  periodAmount: string
  scoreThreshold: number
  mode: GovernanceMode
  active: boolean
  deposited: string
  released: string
  refunded: string
  committed: string
}

export interface EscrowPeriod {
  state: PeriodState
  // Hex digest without 0x, as stored in the database
  auditHash: string
  score: number
  scoreVersion: number
  // Unix seconds; 0 when no approval is pending
  approvalDeadline: number
}

function requireUint(value: number, max: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0 || value > max) {
    throw new EscrowError('INVALID_INPUT', `${label} must be an integer between 0 and ${max}`)
  }
}

export class EscrowService {
  private readonly iface = new Interface(ESCROW_ABI)
  private readonly address: string

  constructor(private readonly ledger: EscrowLedger, contractAddress: string) {
    this.address = contractAddress.toLowerCase()
  }

  async submitBatch(input: SubmitBatchInput): Promise<SubmitBatchResult> {
    requireUint(input.agreementId, Number.MAX_SAFE_INTEGER, 'agreementId')
    requireUint(input.periodId, Number.MAX_SAFE_INTEGER, 'periodId')
    requireUint(input.score, 100, 'score')
    requireUint(input.scoreVersion, 0xffff, 'scoreVersion')
    let auditHash: Uint8Array
    try {
      auditHash = sha256HexToBytes32(input.auditHash)
    } catch (error) {
      throw new EscrowError('INVALID_INPUT', (error as Error).message)
    }

    const data = this.iface.encodeFunctionData('submitBatch', [
      input.agreementId, input.periodId, auditHash, input.score, input.scoreVersion
    ])
    const execution = await this.executeOrFail(data, 'submitBatch')

    const event = this.findEvent(execution, 'BatchSubmitted', e =>
      e.args.agreementId === BigInt(input.agreementId) && e.args.periodId === BigInt(input.periodId))
    if (!event) {
      throw new EscrowError('MISSING_EVENT', 'submitBatch succeeded without a BatchSubmitted event from the escrow contract')
    }
    return {
      transactionId: execution.transactionId,
      transactionHash: execution.transactionHash,
      state: PERIOD_STATES[Number(event.args.state)]
    }
  }

  async release(agreementId: number, periodId: number): Promise<ReleaseResult> {
    requireUint(agreementId, Number.MAX_SAFE_INTEGER, 'agreementId')
    requireUint(periodId, Number.MAX_SAFE_INTEGER, 'periodId')

    const data = this.iface.encodeFunctionData('release', [agreementId, periodId])
    const execution = await this.executeOrFail(data, 'release')

    const released = this.findEvent(execution, 'PeriodReleased', e =>
      e.args.agreementId === BigInt(agreementId) && e.args.periodId === BigInt(periodId))
    if (!released) {
      throw new EscrowError('MISSING_EVENT', `release(${agreementId}, ${periodId}) has no matching PeriodReleased event from the escrow contract`)
    }
    // Only the record's own hash is acceptable: a payment is never reported without it.
    if (!execution.transactionHash) {
      throw new EscrowError('MISSING_HASH', 'The transaction record did not include a transaction hash')
    }

    // Addresses are returned lower-case so they compare as plain strings
    const producer = String(released.args.producer).toLowerCase()
    const deferred = this.findEvent(execution, 'PayoutDeferred', e =>
      String(e.args.to).toLowerCase() === producer)
    return {
      outcome: deferred ? 'deferred' : 'released',
      amount: (released.args.amount as bigint).toString(),
      producer,
      transactionId: execution.transactionId,
      transactionHash: execution.transactionHash
    }
  }

  async getAgreement(agreementId: number): Promise<EscrowAgreement> {
    requireUint(agreementId, Number.MAX_SAFE_INTEGER, 'agreementId')
    const [a] = await this.read('getAgreement', [agreementId])
    return {
      producer: String(a.producer).toLowerCase(),
      funder: String(a.funder).toLowerCase(),
      periodAmount: a.periodAmount.toString(),
      scoreThreshold: Number(a.scoreThreshold),
      mode: GOVERNANCE_MODES[Number(a.mode)],
      active: a.active,
      deposited: a.deposited.toString(),
      released: a.released.toString(),
      refunded: a.refunded.toString(),
      committed: a.committed.toString()
    }
  }

  async getPeriod(agreementId: number, periodId: number): Promise<EscrowPeriod> {
    requireUint(agreementId, Number.MAX_SAFE_INTEGER, 'agreementId')
    requireUint(periodId, Number.MAX_SAFE_INTEGER, 'periodId')
    const [p] = await this.read('getPeriod', [agreementId, periodId])
    return {
      state: PERIOD_STATES[Number(p.state)],
      auditHash: String(p.auditHash).slice(2),
      score: Number(p.score),
      scoreVersion: Number(p.scoreVersion),
      approvalDeadline: Number(p.approvalDeadline)
    }
  }

  private async executeOrFail(data: string, label: string): Promise<ContractExecution> {
    const execution = await this.ledger.execute(this.address, data)
    if (execution.status !== 'SUCCESS') {
      throw new EscrowError('TX_FAILED', `${label} failed on the ledger with status ${execution.status} (${execution.transactionId})`)
    }
    return execution
  }

  private async read(name: 'getAgreement' | 'getPeriod', args: number[]) {
    const result = await this.ledger.query(this.address, this.iface.encodeFunctionData(name, args))
    return this.iface.decodeFunctionResult(name, result)
  }

  /** Finds an event emitted by the escrow contract itself; logs from any other address are ignored. */
  private findEvent(execution: ContractExecution, name: string, match: (e: LogDescription) => boolean): LogDescription | undefined {
    for (const log of execution.logs) {
      if (log.address.toLowerCase() !== this.address) continue
      const parsed = this.iface.parseLog({ topics: log.topics, data: log.data })
      if (parsed && parsed.name === name && match(parsed)) return parsed
    }
    return undefined
  }
}
