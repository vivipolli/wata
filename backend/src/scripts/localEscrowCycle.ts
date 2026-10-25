/**
 * End-to-end escrow v3 cycle on a LOCAL Hedera network (Solo). Never runs against testnet or
 * mainnet: every node and mirror endpoint must be a loopback address.
 *
 * Verifies, with real consensus:
 *  - a 2-of-3 threshold key as the escrow admin account and as the contract adminKey;
 *  - the EVM address format of accounts and contracts;
 *  - the unit the contract sees for msg.value (tinybar or weibar);
 *  - the backend path: EscrowService + HederaService ledger adapter for submitBatch and release,
 *    with the producer balance checked before and after.
 *
 * Environment (values are read, never printed):
 *   LOCAL_NODE_ADDRESS    default 127.0.0.1:50211
 *   LOCAL_NODE_ACCOUNT    default 0.0.3
 *   LOCAL_OPERATOR_ID     funded local account that pays for setup
 *   LOCAL_OPERATOR_KEY    its private key (0x-prefixed hex is read as ECDSA, as in HederaService)
 *
 * Run from backend/: npx tsx src/scripts/localEscrowCycle.ts
 */
import fs from 'fs'
import path from 'path'
import {
  AccountBalanceQuery,
  AccountCreateTransaction,
  AccountId,
  Client,
  ContractCreateFlow,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId,
  Hbar,
  KeyList,
  PrivateKey,
  TransactionId
} from '@hashgraph/sdk'
import { HederaService } from '../services/hedera'
import { EscrowService } from '../services/escrow'

const LOOPBACK = /^(127\.0\.0\.1|localhost|\[::1\]):\d+$/
const ARTIFACTS = path.resolve(process.cwd(), '..', 'contracts', 'artifacts', 'contracts')
const HBAR_IN_TINYBAR = 100_000_000n

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}

function bytecode(contract: string): string {
  const artifact = JSON.parse(fs.readFileSync(path.join(ARTIFACTS, `${contract}.sol`, `${contract}.json`), 'utf8'))
  return artifact.bytecode
}

function localClient(operatorId: AccountId, operatorKey: PrivateKey): Client {
  const node = process.env.LOCAL_NODE_ADDRESS ?? '127.0.0.1:50211'
  if (!LOOPBACK.test(node)) {
    throw new Error('LOCAL_NODE_ADDRESS must be a loopback address: this script only runs on a local network')
  }
  const nodeAccount = AccountId.fromString(process.env.LOCAL_NODE_ACCOUNT ?? '0.0.3')
  return Client.forNetwork({ [node]: nodeAccount }).setOperator(operatorId, operatorKey)
}

const evm = (id: AccountId | ContractId) => '0x' + id.toEvmAddress()

async function main(): Promise<void> {
  const operatorId = AccountId.fromString(requireEnv('LOCAL_OPERATOR_ID'))
  const rawKey = requireEnv('LOCAL_OPERATOR_KEY')
  const operatorKey = rawKey.startsWith('0x') ? PrivateKey.fromStringECDSA(rawKey.slice(2)) : PrivateKey.fromString(rawKey)
  const operator = localClient(operatorId, operatorKey)
  const report: Record<string, unknown> = {}

  async function createAccount(key: PrivateKey | KeyList, hbar: number): Promise<AccountId> {
    const receipt = await (await new AccountCreateTransaction()
      .setKeyWithoutAlias(key)
      .setInitialBalance(new Hbar(hbar))
      .execute(operator)).getReceipt(operator)
    return receipt.accountId!
  }

  // Roles. The admin account is controlled by a 2-of-3 threshold key, as decided for the pilot (D5).
  const adminKeys = [PrivateKey.generateED25519(), PrivateKey.generateED25519(), PrivateKey.generateED25519()]
  const threshold = new KeyList(adminKeys.map(k => k.publicKey), 2)
  const oracleKey = PrivateKey.generateED25519()
  const funderKey = PrivateKey.generateED25519()
  const producerKey = PrivateKey.generateED25519()
  const managerKey = PrivateKey.generateED25519()

  const adminId = await createAccount(threshold, 50)
  const oracleId = await createAccount(oracleKey, 50)
  const funderId = await createAccount(funderKey, 100)
  const producerId = await createAccount(producerKey, 1)
  const managerId = await createAccount(managerKey, 10)
  report.accounts = {
    admin: { id: adminId.toString(), evm: evm(adminId) },
    oracle: { id: oracleId.toString(), evm: evm(oracleId) },
    funder: { id: funderId.toString(), evm: evm(funderId) },
    producer: { id: producerId.toString(), evm: evm(producerId) },
    financialManager: { id: managerId.toString(), evm: evm(managerId) }
  }

  // OracleManager: owner is the setup operator; it authorizes the oracle account.
  const oracleManagerId = (await (await new ContractCreateFlow()
    .setBytecode(bytecode('OracleManager'))
    .setGas(1_000_000)
    .execute(operator)).getReceipt(operator)).contractId!
  await (await new ContractExecuteTransaction()
    .setContractId(oracleManagerId)
    .setGas(200_000)
    .setFunction('authorizeOracle', new ContractFunctionParameters().addAddress(evm(oracleId)))
    .execute(operator)).getReceipt(operator)

  // PESEscrowV3 with the threshold key as contract adminKey: creation must carry 2 of the 3 signatures.
  const approvalWindow = 3600
  const escrowFlow = new ContractCreateFlow()
    .setBytecode(bytecode('PESEscrowV3'))
    .setGas(3_000_000)
    .setAdminKey(threshold)
    .setConstructorParameters(new ContractFunctionParameters()
      .addAddress(evm(oracleManagerId))
      .addAddress(evm(adminId))
      .addAddress(evm(managerId))
      .addUint256(approvalWindow))
    .sign(adminKeys[0])
    .sign(adminKeys[1])
  const escrowReceipt = await (await escrowFlow.execute(operator)).getReceipt(operator)
  const escrowId = escrowReceipt.contractId!
  report.escrow = { id: escrowId.toString(), evm: evm(escrowId), adminKey: 'threshold 2-of-3', createStatus: escrowReceipt.status.toString() }

  // createAgreement paid and signed by the threshold admin account itself (msg.sender = admin).
  const periodAmountTinybar = 2n * HBAR_IN_TINYBAR
  const create = await new ContractExecuteTransaction()
    .setTransactionId(TransactionId.generate(adminId))
    .setContractId(escrowId)
    .setGas(300_000)
    .setFunction('createAgreement', new ContractFunctionParameters()
      .addAddress(evm(producerId))
      .addUint256(Number(periodAmountTinybar))
      .addUint8(70)
      .addUint8(0))
    .freezeWith(operator)
  await create.sign(adminKeys[0])
  await create.sign(adminKeys[2])
  const createReceipt = await (await create.execute(operator)).getReceipt(operator)
  report.createAgreementByThresholdAdmin = createReceipt.status.toString()

  // A single admin key must not be enough.
  const single = await new ContractExecuteTransaction()
    .setTransactionId(TransactionId.generate(adminId))
    .setContractId(escrowId)
    .setGas(300_000)
    .setFunction('pause')
    .freezeWith(operator)
  await single.sign(adminKeys[0])
  try {
    const r = await (await single.execute(operator)).getReceipt(operator)
    report.singleAdminKey = `ACCEPTED (${r.status.toString()}): threshold NOT enforced`
  } catch (error) {
    report.singleAdminKey = `rejected: ${(error as Error).message.split('\n')[0]}`
  }

  // Unit check: deposit 10 HBAR from the funder and read what the contract accounted.
  const funder = localClient(funderId, funderKey)
  await (await new ContractExecuteTransaction()
    .setContractId(escrowId)
    .setGas(200_000)
    .setPayableAmount(new Hbar(10))
    .setFunction('deposit', new ContractFunctionParameters().addUint256(0))
    .execute(funder)).getReceipt(funder)

  // Backend path: the oracle account runs the same EscrowService and ledger adapter as the server.
  const oracleLedger = new HederaService()
  ;(oracleLedger as any).client = localClient(oracleId, oracleKey)
  const escrow = new EscrowService(oracleLedger, evm(escrowId))

  const onchain = await escrow.getAgreement(0)
  const deposited = BigInt(onchain.deposited)
  report.unit = {
    depositedFor10Hbar: onchain.deposited,
    msgValueUnit: deposited === 10n * HBAR_IN_TINYBAR ? 'tinybar' : deposited === 10n * 10n ** 18n ? 'weibar' : 'unknown'
  }
  report.onchainAgreement = onchain

  const auditHash = 'ab'.repeat(32)
  const submission = await escrow.submitBatch({ agreementId: 0, periodId: 1, auditHash, score: 85, scoreVersion: 1 })
  report.submitBatch = submission

  const before = (await new AccountBalanceQuery().setAccountId(producerId).execute(operator)).hbars.toTinybars().toString()
  const release = await escrow.release(0, 1)
  const after = (await new AccountBalanceQuery().setAccountId(producerId).execute(operator)).hbars.toTinybars().toString()
  report.release = { ...release, producerTinybarBefore: before, producerTinybarAfter: after, delta: (BigInt(after) - BigInt(before)).toString() }
  report.periodAfterRelease = await escrow.getPeriod(0, 1)

  // Replay of the same period must fail on-chain.
  try {
    await escrow.release(0, 1)
    report.secondRelease = 'ACCEPTED: replay NOT blocked'
  } catch (error) {
    report.secondRelease = `rejected: ${(error as Error).message}`
  }

  console.log(JSON.stringify(report, null, 2))
  // Open gRPC channels keep the process alive: close every client
  operator.close()
  funder.close()
  ;(oracleLedger as any).client.close()
}

main().catch(error => {
  console.error('Local escrow cycle failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
