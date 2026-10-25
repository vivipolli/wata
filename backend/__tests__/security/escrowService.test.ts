/**
 * EscrowService (F2b T1): the backend's only door to PESEscrowV3. Calls are encoded from an
 * embedded ABI that must match the compiled contract, and every outcome is read from the
 * transaction record (status, hash, logs of the escrow contract itself). No network involved:
 * the ledger is a fake, and the logs it returns are encoded with the compiled artifact's ABI.
 */
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { Interface, ZeroAddress } from 'ethers'
import {
  EscrowService,
  EscrowError,
  ESCROW_ABI,
  type EscrowLedger,
  type ContractExecution,
  type EscrowLog
} from '../../src/services/escrow'

const ARTIFACT = path.join(__dirname, '..', '..', '..', 'contracts', 'artifacts', 'contracts', 'PESEscrowV3.sol', 'PESEscrowV3.json')

function loadArtifactAbi(): Interface {
  if (!fs.existsSync(ARTIFACT)) {
    throw new Error(`Compiled PESEscrowV3 artifact not found at ${ARTIFACT}: run "npx hardhat compile" in contracts/`)
  }
  return new Interface(JSON.parse(fs.readFileSync(ARTIFACT, 'utf8')).abi)
}

const artifact = loadArtifactAbi()
const ESCROW = '0x00000000000000000000000000000000000004d2'
const PRODUCER = '0x00000000000000000000000000000000000010e1'
const OTHER = '0x0000000000000000000000000000000000000bad'
const DIGEST_HEX = crypto.createHash('sha256').update('batch-7').digest('hex')
const TX_ID = '0.0.1001@1700000000.000000001'
const TX_HASH = '0x' + 'ab'.repeat(48)

function log(address: string, event: string, args: unknown[]): EscrowLog {
  const encoded = artifact.encodeEventLog(event, args)
  return { address, topics: encoded.topics, data: encoded.data }
}

class FakeLedger implements EscrowLedger {
  calls: Array<{ kind: 'execute' | 'query' | 'prepared' | 'lookup'; contract: string; data: string }> = []
  execution: ContractExecution = { transactionId: TX_ID, status: 'SUCCESS', transactionHash: TX_HASH, logs: [] }
  queryResult = '0x'
  lookupResult: ContractExecution | null = null

  async execute(contract: string, data: string, onPrepared?: (transactionId: string) => Promise<void>): Promise<ContractExecution> {
    if (onPrepared) {
      await onPrepared(this.execution.transactionId)
      this.calls.push({ kind: 'prepared', contract, data: this.execution.transactionId })
    }
    this.calls.push({ kind: 'execute', contract, data })
    return this.execution
  }

  async lookup(transactionId: string): Promise<ContractExecution | null> {
    this.calls.push({ kind: 'lookup', contract: '', data: transactionId })
    return this.lookupResult
  }

  async query(contract: string, data: string): Promise<string> {
    this.calls.push({ kind: 'query', contract, data })
    return this.queryResult
  }
}

let ledger: FakeLedger
let escrow: EscrowService

beforeEach(() => {
  ledger = new FakeLedger()
  escrow = new EscrowService(ledger, ESCROW)
})

describe('embedded ABI', () => {
  it('matches the compiled PESEscrowV3 artifact fragment by fragment', () => {
    const embedded = new Interface(ESCROW_ABI)
    const names: string[] = []
    embedded.forEachFunction(f => {
      names.push(f.name)
      expect(f.format('full')).toBe(artifact.getFunction(f.name)!.format('full'))
    })
    embedded.forEachEvent(e => {
      names.push(e.name)
      expect(e.format('full')).toBe(artifact.getEvent(e.name)!.format('full'))
    })
    expect(names).toEqual(expect.arrayContaining([
      'submitBatch', 'release', 'getAgreement', 'getPeriod', 'approve', 'reject', 'deposit',
      'PeriodReleased', 'PayoutDeferred', 'BatchSubmitted', 'Deposited'
    ]))
  })
})

describe('submitBatch', () => {
  it('sends the raw SHA-256 digest, period and score to the escrow contract', async () => {
    ledger.execution.logs = [log(ESCROW, 'BatchSubmitted', [3, 7, '0x' + DIGEST_HEX, 85, 2, 2])]

    const result = await escrow.submitBatch({ agreementId: 3, periodId: 7, auditHash: DIGEST_HEX, score: 85, scoreVersion: 2 })

    expect(ledger.calls).toHaveLength(1)
    expect(ledger.calls[0].contract).toBe(ESCROW)
    const decoded = artifact.decodeFunctionData('submitBatch', ledger.calls[0].data)
    expect(decoded.map(String)).toEqual(['3', '7', '0x' + DIGEST_HEX, '85', '2'])
    expect(result).toEqual({ transactionId: TX_ID, transactionHash: TX_HASH, state: 'Approved' })
  })

  it.each([
    ['score above 100', { score: 101 }],
    ['fractional score', { score: 85.5 }],
    ['negative period', { periodId: -1 }],
    ['malformed audit hash', { auditHash: 'abc' }],
    ['score version above uint16', { scoreVersion: 70000 }]
  ])('rejects %s before touching the ledger', async (_label, override) => {
    const input = { agreementId: 3, periodId: 7, auditHash: DIGEST_HEX, score: 85, scoreVersion: 2, ...override }
    await expect(escrow.submitBatch(input)).rejects.toThrow(EscrowError)
    expect(ledger.calls).toHaveLength(0)
  })

  it('fails when the receipt is not SUCCESS', async () => {
    ledger.execution = { ...ledger.execution, status: 'CONTRACT_REVERT_EXECUTED', logs: [] }
    await expect(escrow.submitBatch({ agreementId: 3, periodId: 7, auditHash: DIGEST_HEX, score: 85, scoreVersion: 2 }))
      .rejects.toMatchObject({ code: 'TX_FAILED' })
  })
})

describe('release', () => {
  const released = (address = ESCROW, agreementId = 3, periodId = 7) =>
    log(address, 'PeriodReleased', [agreementId, periodId, PRODUCER, 2n ** 70n])

  it('reports a release with the amount, transaction id and hash taken from the record', async () => {
    ledger.execution.logs = [released()]

    const result = await escrow.release(3, 7)

    expect(artifact.decodeFunctionData('release', ledger.calls[0].data).map(String)).toEqual(['3', '7'])
    expect(result).toEqual({
      outcome: 'released',
      amount: (2n ** 70n).toString(),
      producer: PRODUCER,
      transactionId: TX_ID,
      transactionHash: TX_HASH
    })
  })

  it('reports a deferred payout when the contract could not push the funds', async () => {
    ledger.execution.logs = [released(), log(ESCROW, 'PayoutDeferred', [PRODUCER, 2n ** 70n])]
    await expect(escrow.release(3, 7)).resolves.toMatchObject({ outcome: 'deferred' })
  })

  it('ignores a PeriodReleased event emitted by any other contract', async () => {
    ledger.execution.logs = [released(OTHER)]
    await expect(escrow.release(3, 7)).rejects.toMatchObject({ code: 'MISSING_EVENT' })
  })

  it('ignores a PayoutDeferred event emitted by any other contract', async () => {
    ledger.execution.logs = [released(), log(OTHER, 'PayoutDeferred', [PRODUCER, 1])]
    await expect(escrow.release(3, 7)).resolves.toMatchObject({ outcome: 'released' })
  })

  it('rejects a PeriodReleased event for another agreement or period', async () => {
    ledger.execution.logs = [released(ESCROW, 4, 7)]
    await expect(escrow.release(3, 7)).rejects.toMatchObject({ code: 'MISSING_EVENT' })
    ledger.execution.logs = [released(ESCROW, 3, 8)]
    await expect(escrow.release(3, 7)).rejects.toMatchObject({ code: 'MISSING_EVENT' })
  })

  it('fails when the receipt is not SUCCESS, even if logs are present', async () => {
    ledger.execution = { ...ledger.execution, status: 'CONTRACT_REVERT_EXECUTED', logs: [released()] }
    await expect(escrow.release(3, 7)).rejects.toMatchObject({ code: 'TX_FAILED' })
  })

  it('never reports success without the transaction hash from the record', async () => {
    ledger.execution = { ...ledger.execution, transactionHash: null, logs: [released()] }
    await expect(escrow.release(3, 7)).rejects.toMatchObject({ code: 'MISSING_HASH' })
  })
})

describe('release with a prepared transaction id', () => {
  const releasedLog = () => log(ESCROW, 'PeriodReleased', [3, 7, PRODUCER, 100])

  it('hands the transaction id to the caller before the transaction is sent', async () => {
    ledger.execution.logs = [releasedLog()]
    const seen: string[] = []

    await escrow.release(3, 7, async id => { seen.push(id) })

    expect(seen).toEqual([TX_ID])
    expect(ledger.calls.map(c => c.kind)).toEqual(['prepared', 'execute'])
  })
})

describe('findRelease (reconciliation from the ledger)', () => {
  it('reports not_found when the ledger has no such transaction', async () => {
    await expect(escrow.findRelease(TX_ID, 3, 7)).resolves.toEqual({ status: 'not_found' })
    expect(ledger.calls).toEqual([{ kind: 'lookup', contract: '', data: TX_ID }])
  })

  it('reports a failed transaction with its ledger status', async () => {
    ledger.lookupResult = { transactionId: TX_ID, status: 'CONTRACT_REVERT_EXECUTED', transactionHash: null, logs: [] }
    await expect(escrow.findRelease(TX_ID, 3, 7)).resolves.toEqual({ status: 'failed', ledgerStatus: 'CONTRACT_REVERT_EXECUTED' })
  })

  it('reports the release read from the ledger, with its hash and outcome', async () => {
    ledger.lookupResult = {
      transactionId: TX_ID, status: 'SUCCESS', transactionHash: TX_HASH,
      logs: [log(ESCROW, 'PeriodReleased', [3, 7, PRODUCER, 100]), log(ESCROW, 'PayoutDeferred', [PRODUCER, 100])]
    }
    await expect(escrow.findRelease(TX_ID, 3, 7)).resolves.toEqual({
      status: 'released',
      release: { outcome: 'deferred', amount: '100', producer: PRODUCER, transactionId: TX_ID, transactionHash: TX_HASH }
    })
  })

  it('applies the same checks as a live release: emitter, agreement, period and hash', async () => {
    ledger.lookupResult = { transactionId: TX_ID, status: 'SUCCESS', transactionHash: TX_HASH, logs: [log(OTHER, 'PeriodReleased', [3, 7, PRODUCER, 100])] }
    await expect(escrow.findRelease(TX_ID, 3, 7)).rejects.toMatchObject({ code: 'MISSING_EVENT' })
    ledger.lookupResult = { transactionId: TX_ID, status: 'SUCCESS', transactionHash: TX_HASH, logs: [log(ESCROW, 'PeriodReleased', [3, 8, PRODUCER, 100])] }
    await expect(escrow.findRelease(TX_ID, 3, 7)).rejects.toMatchObject({ code: 'MISSING_EVENT' })
    ledger.lookupResult = { transactionId: TX_ID, status: 'SUCCESS', transactionHash: null, logs: [log(ESCROW, 'PeriodReleased', [3, 7, PRODUCER, 100])] }
    await expect(escrow.findRelease(TX_ID, 3, 7)).rejects.toMatchObject({ code: 'MISSING_HASH' })
  })
})

describe('calls prepared for a wallet to sign', () => {
  it('encodes approve, reject and deposit exactly as the compiled contract expects', () => {
    expect(artifact.decodeFunctionData('approve', escrow.encodeCall('approve', 3, 7)).map(String)).toEqual(['3', '7'])
    expect(artifact.decodeFunctionData('reject', escrow.encodeCall('reject', 3, 7)).map(String)).toEqual(['3', '7'])
    expect(artifact.decodeFunctionData('deposit', escrow.encodeCall('deposit', 3)).map(String)).toEqual(['3'])
    expect(escrow.contractAddress).toBe(ESCROW)
    expect(ledger.calls).toHaveLength(0)
  })

  it('rejects invalid ids', () => {
    expect(() => escrow.encodeCall('approve', -1, 7)).toThrow(EscrowError)
    expect(() => escrow.encodeCall('approve', 3)).toThrow(EscrowError)
  })
})

describe('findDeposit', () => {
  const FUNDER = '0x0000000000000000000000000000000000000f0f'
  const deposited = (address = ESCROW, agreementId = 3) => log(address, 'Deposited', [agreementId, FUNDER, 2n ** 70n])

  it('reads the funder and exact amount of a deposit from the ledger record', async () => {
    ledger.lookupResult = { transactionId: TX_ID, status: 'SUCCESS', transactionHash: TX_HASH, logs: [deposited()] }
    await expect(escrow.findDeposit(TX_ID, 3)).resolves.toEqual({
      status: 'deposited', funder: FUNDER, amount: (2n ** 70n).toString(), transactionId: TX_ID, transactionHash: TX_HASH
    })
  })

  it('reports not_found and failed transactions', async () => {
    await expect(escrow.findDeposit(TX_ID, 3)).resolves.toEqual({ status: 'not_found' })
    ledger.lookupResult = { transactionId: TX_ID, status: 'CONTRACT_REVERT_EXECUTED', transactionHash: null, logs: [] }
    await expect(escrow.findDeposit(TX_ID, 3)).resolves.toEqual({ status: 'failed', ledgerStatus: 'CONTRACT_REVERT_EXECUTED' })
  })

  it('ignores a Deposited event from another contract or for another agreement, and requires the hash', async () => {
    ledger.lookupResult = { transactionId: TX_ID, status: 'SUCCESS', transactionHash: TX_HASH, logs: [deposited(OTHER)] }
    await expect(escrow.findDeposit(TX_ID, 3)).rejects.toMatchObject({ code: 'MISSING_EVENT' })
    ledger.lookupResult = { transactionId: TX_ID, status: 'SUCCESS', transactionHash: TX_HASH, logs: [deposited(ESCROW, 4)] }
    await expect(escrow.findDeposit(TX_ID, 3)).rejects.toMatchObject({ code: 'MISSING_EVENT' })
    ledger.lookupResult = { transactionId: TX_ID, status: 'SUCCESS', transactionHash: null, logs: [deposited()] }
    await expect(escrow.findDeposit(TX_ID, 3)).rejects.toMatchObject({ code: 'MISSING_HASH' })
  })
})

describe('reads', () => {
  it('decodes an agreement with exact amounts and named governance mode', async () => {
    const big = 2n ** 80n
    ledger.queryResult = artifact.encodeFunctionResult('getAgreement', [
      [PRODUCER, OTHER, big, 70, 1, true, big * 3n, big, 0n, big]
    ])

    const agreement = await escrow.getAgreement(3)

    expect(ledger.calls[0].kind).toBe('query')
    expect(agreement).toEqual({
      producer: PRODUCER,
      funder: OTHER,
      periodAmount: big.toString(),
      scoreThreshold: 70,
      mode: 'HYBRID',
      active: true,
      deposited: (big * 3n).toString(),
      released: big.toString(),
      refunded: '0',
      committed: big.toString()
    })
  })

  it('decodes a period with its named state', async () => {
    ledger.queryResult = artifact.encodeFunctionResult('getPeriod', [
      [4, '0x' + DIGEST_HEX, 40, 2, ZeroAddress, 0]
    ])

    await expect(escrow.getPeriod(3, 7)).resolves.toEqual({
      state: 'Rejected',
      auditHash: DIGEST_HEX,
      score: 40,
      scoreVersion: 2,
      approvalDeadline: 0
    })
  })
})
