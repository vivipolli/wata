/**
 * Certificate ledger adapter (F5): ScheduleCreate of a TokenMint through the SDK, and the schedule
 * outcome and serial metadata read from the Mirror Node. SDK calls and fetch are stubbed.
 */
import { ScheduleCreateTransaction, ScheduleId, TransactionId, AccountId, TokenMintTransaction } from '@hashgraph/sdk'
import { HederaService } from '../../src/services/hedera'

const MIRROR = 'http://127.0.0.1:38081'
const savedMirror = process.env.MIRROR_NODE_URL
let service: HederaService
let requested: string[]

function stubFetch(routes: Record<string, { status: number; body?: unknown }>) {
  requested = []
  jest.spyOn(global, 'fetch').mockImplementation(async (url: any) => {
    requested.push(String(url))
    const route = routes[String(url)] ?? { status: 404 }
    return { ok: route.status === 200, status: route.status, json: async () => route.body } as any
  })
}

beforeEach(() => {
  process.env.MIRROR_NODE_URL = MIRROR
  service = new HederaService()
  ;(service as any).client = { operatorAccountId: AccountId.fromString('0.0.1002') }
})

afterEach(() => {
  jest.restoreAllMocks()
  process.env.MIRROR_NODE_URL = savedMirror
})

describe('scheduleMint', () => {
  let scheduled: TokenMintTransaction | null

  function stubSchedule(status: string, scheduleId: string | null) {
    scheduled = null
    jest.spyOn(ScheduleCreateTransaction.prototype, 'execute').mockImplementation(async function (this: ScheduleCreateTransaction) {
      scheduled = (this as any)._scheduledTransaction as TokenMintTransaction
      return {
        getReceiptQuery: () => ({
          setValidateStatus: () => ({
            execute: async () => ({
              status: { toString: () => status },
              scheduleId: scheduleId ? ScheduleId.fromString(scheduleId) : null,
              scheduledTransactionId: TransactionId.fromString('0.0.1002@1700000000.000000001')
            })
          })
        })
      } as any
    })
  }

  it('schedules a TokenMint of exactly the given pointer for the configured token', async () => {
    stubSchedule('SUCCESS', '0.0.6000')

    const result = await service.scheduleMint('0.0.5000', 'ipfs://bafkreiexample', 'WATA certificate 3')

    expect(result.scheduleId).toBe('0.0.6000')
    expect(result.scheduledTransactionId).toContain('0.0.1002@1700000000')
    expect(scheduled!.tokenId!.toString()).toBe('0.0.5000')
    expect(scheduled!.metadata.map(m => Buffer.from(m).toString('utf8'))).toEqual(['ipfs://bafkreiexample'])
  })

  it('returns the existing schedule when an identical one is already pending', async () => {
    stubSchedule('IDENTICAL_SCHEDULE_ALREADY_CREATED', '0.0.6000')
    await expect(service.scheduleMint('0.0.5000', 'ipfs://bafkreiexample', 'WATA certificate 3')).resolves.toMatchObject({ scheduleId: '0.0.6000' })
  })

  it('fails on any other receipt status', async () => {
    stubSchedule('INVALID_TOKEN_ID', '0.0.6000')
    await expect(service.scheduleMint('0.0.5000', 'ipfs://bafkreiexample', 'm')).rejects.toThrow('INVALID_TOKEN_ID')
  })
})

describe('findScheduledMint', () => {
  const schedule = (body: object) => ({ [`${MIRROR}/api/v1/schedules/0.0.6000`]: { status: 200, body } })

  it('reports a pending schedule with its expiry', async () => {
    stubFetch(schedule({ deleted: false, executed_timestamp: null, expiration_time: '4102444800.000000000' }))
    await expect(service.findScheduledMint('0.0.6000')).resolves.toEqual({ status: 'pending', expiresAt: 4102444800 })
  })

  it('reports deleted and expired schedules', async () => {
    stubFetch(schedule({ deleted: true, executed_timestamp: null, expiration_time: null }))
    await expect(service.findScheduledMint('0.0.6000')).resolves.toEqual({ status: 'deleted' })
    stubFetch(schedule({ deleted: false, executed_timestamp: null, expiration_time: '1000000000.000000000' }))
    await expect(service.findScheduledMint('0.0.6000')).resolves.toEqual({ status: 'expired' })
  })

  it('reads the executed mint: result, minted serials and the full transaction hash', async () => {
    stubFetch({
      ...schedule({ deleted: false, executed_timestamp: '1700000100.000000001', expiration_time: null }),
      [`${MIRROR}/api/v1/transactions?timestamp=1700000100.000000001`]: { status: 200, body: { transactions: [{
        name: 'TOKENMINT', result: 'SUCCESS', scheduled: true, transaction_hash: Buffer.from('ef'.repeat(48), 'hex').toString('base64'),
        nft_transfers: [{ token_id: '0.0.5000', serial_number: 12, sender_account_id: null, receiver_account_id: '0.0.1002' }]
      }] } }
    })

    await expect(service.findScheduledMint('0.0.6000')).resolves.toEqual({
      status: 'executed', result: 'SUCCESS', tokenId: '0.0.5000', serials: [12], transactionHash: '0x' + 'ef'.repeat(48)
    })
  })

  it('ignores NFT transfers that are not mints', async () => {
    stubFetch({
      ...schedule({ deleted: false, executed_timestamp: '1700000100.000000001', expiration_time: null }),
      [`${MIRROR}/api/v1/transactions?timestamp=1700000100.000000001`]: { status: 200, body: { transactions: [{
        name: 'TOKENMINT', result: 'SUCCESS', scheduled: true, transaction_hash: '',
        nft_transfers: [{ token_id: '0.0.5000', serial_number: 3, sender_account_id: '0.0.1002', receiver_account_id: '0.0.1003' }]
      }] } }
    })
    await expect(service.findScheduledMint('0.0.6000')).resolves.toMatchObject({ serials: [], transactionHash: null })
  })

  it('rejects malformed ids before any request', async () => {
    stubFetch({})
    await expect(service.findScheduledMint('0.0.6000/../x')).rejects.toThrow('schedule id')
    await expect(service.getNftMetadata('0.0.5000', -1)).rejects.toThrow('serial')
    expect(requested).toHaveLength(0)
  })
})

describe('getNftMetadata', () => {
  it('returns the serial metadata as UTF-8, or null for an unknown serial', async () => {
    stubFetch({ [`${MIRROR}/api/v1/tokens/0.0.5000/nfts/12`]: { status: 200, body: { metadata: Buffer.from('ipfs://bafkreiexample').toString('base64') } } })
    await expect(service.getNftMetadata('0.0.5000', 12)).resolves.toBe('ipfs://bafkreiexample')
    await expect(service.getNftMetadata('0.0.5000', 13)).resolves.toBeNull()
  })
})
