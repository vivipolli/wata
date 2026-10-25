/**
 * NFT certificate cycle on a LOCAL Hedera network (Solo). Never runs against testnet or mainnet:
 * the node and the Mirror Node must be loopback addresses.
 *
 * Verifies, with real consensus:
 *  - an NFT token whose admin and supply keys are a 2-of-3 threshold;
 *  - the HTS metadata limit for one serial (MAX_NFT_METADATA_BYTES accepted, one byte more refused);
 *  - the backend path: HederaService.scheduleMint creates a scheduled TokenMint, an identical request
 *    returns the same schedule, one signature leaves it pending, two execute it, and
 *    findScheduledMint / getNftMetadata read the serial and its ipfs:// pointer from the Mirror Node.
 *
 * Environment (values are read, never printed):
 *   LOCAL_NODE_ADDRESS, LOCAL_NODE_ACCOUNT, LOCAL_OPERATOR_ID, LOCAL_OPERATOR_KEY, MIRROR_NODE_URL
 *   (same as localEscrowCycle.ts)
 *
 * Run from backend/: npx tsx src/scripts/localCertificateCycle.ts
 */
import {
  AccountId,
  Client,
  KeyList,
  PrivateKey,
  ScheduleSignTransaction,
  TokenCreateTransaction,
  TokenMintTransaction,
  TokenSupplyType,
  TokenType
} from '@hashgraph/sdk'
import { HederaService } from '../services/hedera'
import { MAX_NFT_METADATA_BYTES, canonicalJson, rawCid } from '../services/certificate'

const LOOPBACK_HOST = /^(127\.0\.0\.1|localhost|\[::1\]):\d+$/
const LOOPBACK_URL = /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\]):\d+\/?$/

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}

async function main(): Promise<void> {
  const node = process.env.LOCAL_NODE_ADDRESS ?? '127.0.0.1:50211'
  if (!LOOPBACK_HOST.test(node) || !LOOPBACK_URL.test(requireEnv('MIRROR_NODE_URL'))) {
    throw new Error('LOCAL_NODE_ADDRESS and MIRROR_NODE_URL must be loopback addresses: this script only runs on a local network')
  }
  const operatorId = AccountId.fromString(requireEnv('LOCAL_OPERATOR_ID'))
  const rawKey = requireEnv('LOCAL_OPERATOR_KEY')
  const operatorKey = rawKey.startsWith('0x') ? PrivateKey.fromStringECDSA(rawKey.slice(2)) : PrivateKey.fromString(rawKey)
  const client = Client.forNetwork({ [node]: AccountId.fromString(process.env.LOCAL_NODE_ACCOUNT ?? '0.0.3') })
    .setOperator(operatorId, operatorKey)
  const report: Record<string, unknown> = {}

  // Token keys: 2-of-3 threshold for both admin and supply (D5); the operator is the treasury.
  const keys = [PrivateKey.generateED25519(), PrivateKey.generateED25519(), PrivateKey.generateED25519()]
  const threshold = new KeyList(keys.map(k => k.publicKey), 2)
  const create = await new TokenCreateTransaction()
    .setTokenName('WATA PSA Certificate (local)')
    .setTokenSymbol('WATACERT')
    .setTokenType(TokenType.NonFungibleUnique)
    .setSupplyType(TokenSupplyType.Infinite)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(operatorId)
    .setAdminKey(threshold)
    .setSupplyKey(threshold)
    .freezeWith(client)
  await create.sign(keys[0])
  await create.sign(keys[1])
  const tokenId = (await (await create.execute(client)).getReceipt(client)).tokenId!.toString()
  report.token = { id: tokenId, keys: 'admin and supply: threshold 2-of-3' }

  // HTS metadata limit for one serial, minted directly with two supply signatures.
  async function directMint(bytes: number): Promise<string> {
    const tx = await new TokenMintTransaction().setTokenId(tokenId).addMetadata(Buffer.alloc(bytes, 0x61)).freezeWith(client)
    await tx.sign(keys[0])
    await tx.sign(keys[1])
    try {
      return (await (await tx.execute(client)).getReceipt(client)).status.toString()
    } catch (error) {
      return (error as Error).message.split('\n')[0]
    }
  }
  report.metadataLimit = {
    [`${MAX_NFT_METADATA_BYTES} bytes`]: await directMint(MAX_NFT_METADATA_BYTES),
    [`${MAX_NFT_METADATA_BYTES + 1} bytes`]: await directMint(MAX_NFT_METADATA_BYTES + 1)
  }

  // Backend path: schedule, re-schedule, sign one by one, read back from the Mirror Node.
  const ledger = new HederaService()
  ;(ledger as any).client = client
  const json = canonicalJson({ name: 'local certificate', image: 'ipfs://bafkreidcsqzr5su356thecwuyzrhsgekfdsqzuyuqxtsu4vh7oc34iv5oy', type: 'image/png', format: 'HIP412@2.0.0', run: Date.now() })
  const uri = `ipfs://${rawCid(Buffer.from(json))}`
  const first = await ledger.scheduleMint(tokenId, uri, 'WATA certificate local')
  const second = await ledger.scheduleMint(tokenId, uri, 'WATA certificate local')
  report.schedule = { scheduleId: first.scheduleId, identicalRequestReturnsSameSchedule: first.scheduleId === second.scheduleId }

  async function sign(key: PrivateKey) {
    const tx = await new ScheduleSignTransaction().setScheduleId(first.scheduleId).freezeWith(client)
    await tx.sign(key)
    return (await (await tx.execute(client)).getReceipt(client)).status.toString()
  }
  async function mirrorState(wait: (s: any) => boolean) {
    let state: any
    for (let attempt = 0; attempt < 30; attempt++) {
      state = await ledger.findScheduledMint(first.scheduleId).catch((error: Error) => ({ status: 'error', message: error.message }))
      if (wait(state)) return state
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    return state
  }

  report.afterOneSignature = { sign: await sign(keys[2]), mirror: (await mirrorState(s => s.status === 'pending')).status }
  report.afterTwoSignatures = { sign: await sign(keys[0]), mirror: await mirrorState(s => s.status === 'executed') }
  const executed: any = report.afterTwoSignatures as any
  const serial = executed.mirror.serials?.[0]
  const onchainMetadata = serial ? await ledger.getNftMetadata(tokenId, serial) : null
  report.serialMetadata = { serial, matchesPointer: onchainMetadata === uri, pointerBytes: Buffer.byteLength(uri) }

  console.log(JSON.stringify(report, null, 2))
  client.close()
}

main().catch(error => {
  console.error('Local certificate cycle failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
