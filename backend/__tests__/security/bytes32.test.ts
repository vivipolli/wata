/**
 * Hash integrity (DI-1): the bytes32 sent to the contract must be the raw 32-byte SHA-256
 * digest, so any third party can recompute it from the source data. Transactions are
 * intercepted before freeze/execute, so no network or operator key is involved.
 */
import crypto from 'crypto'
import {
  AccountId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId
} from '@hashgraph/sdk'
import { sha256HexToBytes32 } from '../../src/utils/bytes32'
import { HederaService } from '../../src/services/hedera'

const SOURCE = JSON.stringify({ agreementId: 7, readings: [1.2, 3.4], ts: 1700000000000 })
const DIGEST = crypto.createHash('sha256').update(SOURCE).digest()
const HEX = DIGEST.toString('hex')

class StopBeforeNetwork extends Error {}

describe('sha256HexToBytes32', () => {
  it('returns exactly the 32 digest bytes of the hex SHA-256', () => {
    const out = sha256HexToBytes32(HEX)
    expect(out).toHaveLength(32)
    expect(Buffer.from(out).equals(DIGEST)).toBe(true)
  })

  it('accepts a 0x prefix and upper-case hex', () => {
    expect(Buffer.from(sha256HexToBytes32('0x' + HEX.toUpperCase())).equals(DIGEST)).toBe(true)
  })

  it.each([
    ['empty', ''],
    ['63 chars', HEX.slice(1)],
    ['65 chars', HEX + 'a'],
    ['non-hex char', HEX.slice(0, 63) + 'g'],
    ['only 0x', '0x'],
    ['ASCII text', 'not-a-hash'],
    ['hash with whitespace', ` ${HEX}`]
  ])('rejects %s', (_label, value) => {
    expect(() => sha256HexToBytes32(value)).toThrow('64 hex characters')
  })

  it('rejects non-string input', () => {
    expect(() => sha256HexToBytes32(undefined as any)).toThrow()
    expect(() => sha256HexToBytes32(123 as any)).toThrow()
  })
})

describe('HederaService sends the real digest as bytes32', () => {
  let sent: Uint8Array[]
  let service: HederaService

  beforeEach(() => {
    sent = []
    jest.spyOn(ContractFunctionParameters.prototype, 'addBytes32').mockImplementation(function (this: any, value: Uint8Array) {
      sent.push(Buffer.from(value))
      return this
    })
    jest.spyOn(ContractExecuteTransaction.prototype, 'freezeWith').mockImplementation(() => {
      throw new StopBeforeNetwork()
    })
    jest.spyOn(ContractExecuteTransaction.prototype, 'execute').mockImplementation(() => {
      throw new StopBeforeNetwork()
    })

    service = new HederaService()
    ;(service as any).client = {}
    ;(service as any).accountId = AccountId.fromString('0.0.1001')
    ;(service as any).contractId = ContractId.fromString('0.0.2002')
  })

  afterEach(() => jest.restoreAllMocks())

  const calls: Array<[string, (s: HederaService) => Promise<unknown>]> = [
    ['submitValidatedBatch', s => s.submitValidatedBatch(0, HEX, 80)],
    ['requestPayment', s => s.requestPayment(0, HEX)],
    ['recordAudit', s => s.recordAudit(HEX)],
    ['createAgreementWithSystem', s => s.createAgreementWithSystem(HEX, '0x742d35Cc6639C0532fEb217F5e4B9af48Bf9bA2A', 1000, 50)]
  ]

  it.each(calls)('%s: bytes32 equals the recomputed SHA-256 byte by byte', async (_name, call) => {
    await expect(call(service)).rejects.toBeInstanceOf(StopBeforeNetwork)
    expect(sent).toHaveLength(1)
    expect(sent[0]).toHaveLength(32)
    for (let i = 0; i < 32; i++) {
      expect(sent[0][i]).toBe(DIGEST[i])
    }
  })

  it.each(calls.map(([name]) => [name]))('%s: malformed hash is rejected before building a transaction', async (name) => {
    const bad: Record<string, () => Promise<unknown>> = {
      submitValidatedBatch: () => service.submitValidatedBatch(0, HEX.slice(0, 32), 80),
      requestPayment: () => service.requestPayment(0, HEX.slice(0, 32)),
      recordAudit: () => service.recordAudit(HEX.slice(0, 32)),
      createAgreementWithSystem: () => service.createAgreementWithSystem(HEX.slice(0, 32), '0x742d35Cc6639C0532fEb217F5e4B9af48Bf9bA2A', 1000, 50)
    }
    await expect(bad[name]()).rejects.toThrow('64 hex characters')
    expect(ContractExecuteTransaction.prototype.freezeWith).not.toHaveBeenCalled()
    expect(ContractExecuteTransaction.prototype.execute).not.toHaveBeenCalled()
  })
})
