/**
 * Network selection (DI-5): the Hedera client must follow HEDERA_NETWORK and refuse to start on
 * a missing or unknown value, instead of silently using testnet. Client factories are stubbed,
 * so no connection is opened; the operator key is generated per test and never used.
 */
import { Client, PrivateKey } from '@hashgraph/sdk'
import { createHederaClient, resolveHederaNetwork } from '../../src/utils/hederaNetwork'
import { HederaService } from '../../src/services/hedera'

const ENV_KEYS = ['HEDERA_NETWORK', 'HEDERA_ACCOUNT_ID', 'HEDERA_PRIVATE_KEY', 'CONTRACT_ADDRESS'] as const
const savedEnv: Record<string, string | undefined> = {}

let forTestnet: jest.SpyInstance
let forMainnet: jest.SpyInstance
const testnetClient = { network: 'testnet', setOperator() { return this } }
const mainnetClient = { network: 'mainnet', setOperator() { return this } }

beforeEach(() => {
  for (const k of ENV_KEYS) savedEnv[k] = process.env[k]
  forTestnet = jest.spyOn(Client, 'forTestnet').mockReturnValue(testnetClient as any)
  forMainnet = jest.spyOn(Client, 'forMainnet').mockReturnValue(mainnetClient as any)
})

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k]
    else process.env[k] = savedEnv[k]
  }
  jest.restoreAllMocks()
})

describe('resolveHederaNetwork', () => {
  it.each(['testnet', 'mainnet'])('accepts %s', (value) => {
    expect(resolveHederaNetwork(value)).toBe(value)
  })

  it.each([
    ['missing', undefined],
    ['empty', ''],
    ['upper case', 'TESTNET'],
    ['padded', ' testnet'],
    ['previewnet', 'previewnet'],
    ['local', 'local-node'],
    ['typo', 'mainet']
  ])('rejects %s', (_label, value) => {
    expect(() => resolveHederaNetwork(value)).toThrow('HEDERA_NETWORK must be one of')
  })
})

describe('createHederaClient', () => {
  it('builds a mainnet client only for mainnet', () => {
    expect(createHederaClient('mainnet')).toBe(mainnetClient)
    expect(forMainnet).toHaveBeenCalledTimes(1)
    expect(forTestnet).not.toHaveBeenCalled()
  })

  it('builds a testnet client only for testnet', () => {
    expect(createHederaClient('testnet')).toBe(testnetClient)
    expect(forTestnet).toHaveBeenCalledTimes(1)
    expect(forMainnet).not.toHaveBeenCalled()
  })

  it('throws on an invalid HEDERA_NETWORK without building any client', () => {
    process.env.HEDERA_NETWORK = 'foo'
    expect(() => createHederaClient()).toThrow('HEDERA_NETWORK must be one of')
    expect(forTestnet).not.toHaveBeenCalled()
    expect(forMainnet).not.toHaveBeenCalled()
  })
})

describe('HederaService.initialize follows HEDERA_NETWORK', () => {
  beforeEach(() => {
    process.env.HEDERA_ACCOUNT_ID = '0.0.1001'
    process.env.HEDERA_PRIVATE_KEY = PrivateKey.generateED25519().toStringDer()
    process.env.CONTRACT_ADDRESS = '0.0.2002'
  })

  it('uses mainnet when configured for mainnet', async () => {
    process.env.HEDERA_NETWORK = 'mainnet'
    const service = new HederaService()
    await service.initialize()
    expect((service as any).client).toBe(mainnetClient)
    expect(forTestnet).not.toHaveBeenCalled()
  })

  it('uses testnet when configured for testnet', async () => {
    process.env.HEDERA_NETWORK = 'testnet'
    const service = new HederaService()
    await service.initialize()
    expect((service as any).client).toBe(testnetClient)
    expect(forMainnet).not.toHaveBeenCalled()
  })

  it.each([undefined, 'foo'])('refuses to initialize when HEDERA_NETWORK is %s', async (value) => {
    if (value === undefined) delete process.env.HEDERA_NETWORK
    else process.env.HEDERA_NETWORK = value
    const service = new HederaService()
    await expect(service.initialize()).rejects.toThrow('HEDERA_NETWORK must be one of')
    expect((service as any).client).toBeNull()
    expect(forTestnet).not.toHaveBeenCalled()
    expect(forMainnet).not.toHaveBeenCalled()
  })
})
