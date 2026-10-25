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
  calls: Array<{ kind: 'execute' | 'query'; contract: string; data: string }> = []
  execution: ContractExecution = { transactionId: TX_ID, status: 'SUCCESS', transactionHash: TX_HASH, logs: [] }
  queryResult = '0x'

  async execute(contract: string, data: string): Promise<ContractExecution> {
    this.calls.push({ kind: 'execute', contract, data })
    return this.execution
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
    expect(names).toEqual(expect.arrayContaining(['submitBatch', 'release', 'getAgreement', 'getPeriod', 'PeriodReleased', 'PayoutDeferred', 'BatchSubmitted']))
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
