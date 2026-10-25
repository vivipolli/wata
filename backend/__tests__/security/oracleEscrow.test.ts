/**
 * Oracle → escrow v3 (F2b T2): validated batches go to PESEscrowV3.submitBatch through the
 * EscrowService, with the batch as the on-chain period. Transaction id and hash come from the
 * ledger record, never assembled by hand. The Hedera ledger adapter is checked with stubbed
 * SDK calls, so no network or operator key is involved.
 */
import { ContractExecuteTransaction, ContractCallQuery, ContractId } from '@hashgraph/sdk'

jest.mock('../../src/services/hfs', () => ({
  hfsService: { createAuditReport: jest.fn(async () => '0.0.5005') }
}))
jest.mock('../../src/services/hcs', () => ({
  hcsService: { publishAuditRecord: jest.fn(async () => '0.0.1001@1.2') }
}))

import { OracleService, readScoreVersion } from '../../src/services/oracle'
import { HederaService } from '../../src/services/hedera'
import { EscrowError } from '../../src/services/escrow'

const AUDIT_HASH = 'ab'.repeat(32)
const TX_ID = '0.0.1001@1700000000.000000001'
const TX_HASH = '0x' + 'cd'.repeat(48)
const ESCROW = '0x00000000000000000000000000000000000004d2'

function batchResult(): any {
  return {
    auditHash: AUDIT_HASH,
    signature: 'sig',
    score: 0.8,
    readings: [{ id: 1 }],
    validReadings: [{ id: 1 }],
    invalidReadings: [],
    averageTurbidity: 3,
    medianTurbidity: 3,
    outliersDetected: 0
  }
}

function fakeDatabase(blockchainId: number | null = 0): any {
  return {
    createBatch: jest.fn(async () => 11),
    createOracleLog: jest.fn(async () => 1),
    getAgreement: jest.fn(async () => ({ id: 1, blockchain_id: blockchainId, producer_address: '0xabc' })),
    updateBatchStatus: jest.fn(async () => undefined),
    markReadingsAsValidated: jest.fn(async () => undefined),
    attachBatchLedgerReferences: jest.fn(async () => undefined)
  }
}

function fakeEscrow(): any {
  return {
    submitBatch: jest.fn(async () => ({ transactionId: TX_ID, transactionHash: TX_HASH, state: 'Approved' }))
  }
}

const savedScoreVersion = process.env.SCORE_VERSION
const savedEscrowAddress = process.env.ESCROW_CONTRACT_ADDRESS

beforeEach(() => {
  process.env.SCORE_VERSION = '1'
  jest.spyOn(console, 'log').mockImplementation(() => undefined)
  jest.spyOn(console, 'error').mockImplementation(() => undefined)
})

afterEach(() => {
  jest.restoreAllMocks()
  process.env.SCORE_VERSION = savedScoreVersion
  process.env.ESCROW_CONTRACT_ADDRESS = savedEscrowAddress
})

describe('OracleService.submitValidatedBatch through the escrow', () => {
  it('submits the batch as the on-chain period with the integer score and score version', async () => {
    const db = fakeDatabase(0)
    const escrow = fakeEscrow()
    const oracle = new OracleService(db, {} as any, escrow)

    await expect(oracle.submitValidatedBatch(1, batchResult())).resolves.toBe(TX_ID)

    expect(escrow.submitBatch).toHaveBeenCalledWith({
      agreementId: 0, periodId: 11, auditHash: AUDIT_HASH, score: 80, scoreVersion: 1
    })
    expect(db.updateBatchStatus).toHaveBeenCalledWith(11, 'submitted', expect.any(Date), 11)
  })

  it('logs the transaction id and hash exactly as the ledger record reported them', async () => {
    const db = fakeDatabase(0)
    const oracle = new OracleService(db, {} as any, fakeEscrow())

    await oracle.submitValidatedBatch(1, batchResult())

    expect(db.createOracleLog).toHaveBeenCalledWith(expect.objectContaining({
      action: 'batch_submitted',
      transactionHash: TX_HASH,
      details: expect.stringContaining(TX_ID)
    }))
  })

  it('does not mark the batch submitted when the escrow call fails', async () => {
    const db = fakeDatabase(0)
    const escrow = { submitBatch: jest.fn(async () => { throw new EscrowError('TX_FAILED', 'reverted') }) }
    const oracle = new OracleService(db, {} as any, escrow as any)

    await expect(oracle.submitValidatedBatch(1, batchResult())).rejects.toThrow('reverted')
    expect(db.updateBatchStatus).not.toHaveBeenCalled()
    expect(db.createOracleLog).not.toHaveBeenCalledWith(expect.objectContaining({ action: 'batch_submitted' }))
  })

  it('refuses to submit without a valid SCORE_VERSION', async () => {
    const escrow = fakeEscrow()
    const oracle = new OracleService(fakeDatabase(0), {} as any, escrow)

    for (const bad of [undefined, '', 'v1', '-1', '1.5', '70000']) {
      if (bad === undefined) delete process.env.SCORE_VERSION
      else process.env.SCORE_VERSION = bad
      await expect(oracle.submitValidatedBatch(1, batchResult())).rejects.toThrow('SCORE_VERSION')
    }
    expect(escrow.submitBatch).not.toHaveBeenCalled()
  })
})

describe('readScoreVersion', () => {
  it('accepts an integer between 0 and 65535', () => {
    process.env.SCORE_VERSION = '65535'
    expect(readScoreVersion()).toBe(65535)
  })
})

describe('HederaService escrow ledger adapter', () => {
  let service: HederaService

  beforeEach(() => {
    service = new HederaService()
    ;(service as any).client = {}
  })

  function stubExecution(status: string, record: any) {
    const getRecord = jest.fn(async () => record)
    jest.spyOn(ContractExecuteTransaction.prototype, 'execute').mockImplementation(async function (this: ContractExecuteTransaction) {
      return {
        transactionId: { toString: () => TX_ID },
        getReceiptQuery: () => ({
          setValidateStatus: () => ({ execute: async () => ({ status: { toString: () => status } }) })
        }),
        getRecord
      } as any
    })
    return getRecord
  }

  it('requires a valid ESCROW_CONTRACT_ADDRESS', () => {
    delete process.env.ESCROW_CONTRACT_ADDRESS
    expect(() => service.getEscrowService()).toThrow('ESCROW_CONTRACT_ADDRESS')
    process.env.ESCROW_CONTRACT_ADDRESS = '0.0.1234'
    expect(() => service.getEscrowService()).toThrow('ESCROW_CONTRACT_ADDRESS')
    process.env.ESCROW_CONTRACT_ADDRESS = ESCROW
    expect(() => service.getEscrowService()).not.toThrow()
  })

  it('maps a successful record: hash, and logs with the emitting contract address', async () => {
    const emitter = ContractId.fromEvmAddress(0, 0, ESCROW)
    // A contract called during execution (e.g. the producer) emits its own logs; each keeps its emitter
    const other = ContractId.fromEvmAddress(0, 0, '0x0000000000000000000000000000000000000bad')
    stubExecution('SUCCESS', {
      transactionHash: Buffer.from('cd'.repeat(48), 'hex'),
      contractFunctionResult: {
        logs: [
          { contractId: emitter, topics: [Buffer.from('11'.repeat(32), 'hex')], data: Buffer.from('2233', 'hex') },
          { contractId: other, topics: [], data: new Uint8Array(0) }
        ]
      }
    })

    const execution = await service.execute(ESCROW, '0xabcdef')

    expect(execution).toEqual({
      transactionId: TX_ID,
      status: 'SUCCESS',
      transactionHash: TX_HASH,
      logs: [
        { address: ESCROW, topics: ['0x' + '11'.repeat(32)], data: '0x2233' },
        { address: '0x0000000000000000000000000000000000000bad', topics: [], data: '0x' }
      ]
    })
  })

  it('reports a failed receipt without reading logs or inventing a hash', async () => {
    const getRecord = stubExecution('CONTRACT_REVERT_EXECUTED', {})

    const execution = await service.execute(ESCROW, '0xabcdef')

    expect(execution).toEqual({ transactionId: TX_ID, status: 'CONTRACT_REVERT_EXECUTED', transactionHash: null, logs: [] })
    expect(getRecord).not.toHaveBeenCalled()
  })

  it('returns a null hash when the record has none', async () => {
    stubExecution('SUCCESS', { transactionHash: new Uint8Array(0), contractFunctionResult: { logs: [] } })
    await expect(service.execute(ESCROW, '0xabcdef')).resolves.toMatchObject({ transactionHash: null })
  })

  it('returns the raw result bytes of a read', async () => {
    jest.spyOn(ContractCallQuery.prototype, 'execute').mockImplementation(async () => ({ bytes: Buffer.from('00ff', 'hex') }) as any)
    await expect(service.query(ESCROW, '0x1234')).resolves.toBe('0x00ff')
  })
})
