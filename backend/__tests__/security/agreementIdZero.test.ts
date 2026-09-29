/**
 * On-chain agreement IDs (DI-2): the contract counter starts at 0, so ID 0 is a real agreement
 * and must be processed. A missing contract result must fail instead of defaulting to 0,
 * which would bind the local agreement to someone else's on-chain agreement #0.
 */
import { AccountId, ContractExecuteTransaction, ContractId } from '@hashgraph/sdk'

jest.mock('../../src/services/hfs', () => ({
  hfsService: { createAuditReport: jest.fn(async () => '0.0.5005') }
}))
jest.mock('../../src/services/hcs', () => ({
  hcsService: { publishAuditRecord: jest.fn(async () => '0.0.1001@1.2') }
}))

import { OracleService } from '../../src/services/oracle'
import { HederaService } from '../../src/services/hedera'

const AUDIT_HASH = 'ab'.repeat(32)

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

function fakeDatabase(blockchainId: number | null): any {
  return {
    createBatch: jest.fn(async () => 11),
    createOracleLog: jest.fn(async () => 1),
    getAgreement: jest.fn(async () => ({ id: 1, blockchain_id: blockchainId, producer_address: '0xabc' })),
    updateBatchStatus: jest.fn(async () => undefined),
    markReadingsAsValidated: jest.fn(async () => undefined),
    attachBatchLedgerReferences: jest.fn(async () => undefined)
  }
}

function fakeHedera(): any {
  return {
    submitValidatedBatch: jest.fn(async () => ({
      transactionId: { accountId: { toString: () => '0.0.1001' }, validStart: { seconds: 1, nanos: 2 } }
    }))
  }
}

describe('OracleService.submitValidatedBatch with on-chain agreement ID 0', () => {
  beforeEach(() => jest.spyOn(console, 'log').mockImplementation(() => undefined))
  afterEach(() => jest.restoreAllMocks())

  it('submits the batch for agreement 0 instead of skipping it', async () => {
    const hedera = fakeHedera()
    const oracle = new OracleService(fakeDatabase(0), hedera)

    const tx = await oracle.submitValidatedBatch(1, batchResult())

    expect(tx).not.toBe('skipped')
    expect(tx).toBe('0.0.1001@1.2')
    expect(hedera.submitValidatedBatch).toHaveBeenCalledWith(0, AUDIT_HASH, 80)
  })

  it('still skips an agreement that was never deployed (null ID)', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    const hedera = fakeHedera()
    const oracle = new OracleService(fakeDatabase(null), hedera)

    await expect(oracle.submitValidatedBatch(1, batchResult())).resolves.toBe('skipped')
    expect(hedera.submitValidatedBatch).not.toHaveBeenCalled()
  })
})

describe('OracleService.submitValidatedBatch without a ledger transaction ID', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined)
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })
  afterEach(() => jest.restoreAllMocks())

  it('fails instead of recording a placeholder hash, and does not mark the batch submitted', async () => {
    const db = fakeDatabase(0)
    const hedera = { submitValidatedBatch: jest.fn(async () => ({ transactionId: undefined })) }
    const oracle = new OracleService(db, hedera as any)

    await expect(oracle.submitValidatedBatch(1, batchResult())).rejects.toThrow('no transaction ID')
    expect(db.updateBatchStatus).not.toHaveBeenCalled()
    expect(db.createOracleLog).not.toHaveBeenCalledWith(expect.objectContaining({ action: 'batch_submitted' }))
  })
})

describe('HederaService.createAgreementWithSystem result handling', () => {
  let service: HederaService

  function stubRecord(record: any) {
    jest.spyOn(ContractExecuteTransaction.prototype, 'execute').mockImplementation(async () => ({
      getReceipt: async () => ({}),
      getRecord: async () => record
    }) as any)
  }

  const txId = { toString: () => '0.0.1001@1.2' }

  beforeEach(() => {
    service = new HederaService()
    ;(service as any).client = {}
    ;(service as any).accountId = AccountId.fromString('0.0.1001')
    ;(service as any).contractId = ContractId.fromString('0.0.2002')
  })

  afterEach(() => jest.restoreAllMocks())

  const create = () => service.createAgreementWithSystem(AUDIT_HASH, '0x742d35Cc6639C0532fEb217F5e4B9af48Bf9bA2A', 1000, 50)

  it('returns agreement ID 0 when the contract returns 0', async () => {
    stubRecord({ transactionId: txId, contractFunctionResult: { getUint256: () => ({ toString: () => '0' }) } })
    await expect(create()).resolves.toEqual({ agreementId: 0, transactionId: '0.0.1001@1.2' })
  })

  it('returns the contract-issued ID', async () => {
    stubRecord({ transactionId: txId, contractFunctionResult: { getUint256: () => ({ toString: () => '42' }) } })
    await expect(create()).resolves.toEqual({ agreementId: 42, transactionId: '0.0.1001@1.2' })
  })

  it('throws when the record has no function result', async () => {
    stubRecord({ transactionId: txId, contractFunctionResult: null })
    await expect(create()).rejects.toThrow('no function result')
  })

  it('throws when the returned ID is missing or not a safe integer', async () => {
    stubRecord({ transactionId: txId, contractFunctionResult: { getUint256: () => undefined } })
    await expect(create()).rejects.toThrow('invalid agreement ID')

    stubRecord({ transactionId: txId, contractFunctionResult: { getUint256: () => ({ toString: () => '9007199254740993' }) } })
    await expect(create()).rejects.toThrow('invalid agreement ID')
  })
})
