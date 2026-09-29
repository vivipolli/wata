import { Client } from '@hashgraph/sdk'

export type HederaNetwork = 'testnet' | 'mainnet'

const NETWORKS: readonly HederaNetwork[] = ['testnet', 'mainnet']

/**
 * Reads HEDERA_NETWORK and fails fast on a missing or unknown value, so the service can never
 * silently write to a different ledger than the one it was configured for.
 */
export function resolveHederaNetwork(value: string | undefined = process.env.HEDERA_NETWORK): HederaNetwork {
  if (!NETWORKS.includes(value as HederaNetwork)) {
    throw new Error(`HEDERA_NETWORK must be one of: ${NETWORKS.join(', ')}`)
  }
  return value as HederaNetwork
}

/** Creates an SDK client for the configured network (no operator set). */
export function createHederaClient(network: HederaNetwork = resolveHederaNetwork()): Client {
  return network === 'mainnet' ? Client.forMainnet() : Client.forTestnet()
}
