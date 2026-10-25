/**
 * End-to-end escrow v3 cycle on a LOCAL Hedera network (Solo). Never runs against testnet or
 * mainnet: every node and mirror endpoint must be a loopback address.
 *
 * Verifies, with real consensus:
 *  - a 2-of-3 threshold key as the escrow admin account and as the contract adminKey;
 *  - the EVM address format of accounts and contracts;
 *  - the unit the contract sees for msg.value (tinybar or weibar);
 *  - the backend path: EscrowService + HederaService ledger adapter for submitBatch and release,
 *    with the producer balance checked before and after;
 *  - reconciliation: the transaction id handed over before sending, and the Mirror Node lookup of a
 *    successful release, a failed one and an unknown id;
 *  - HYBRID mode: deposit and approve signed by the funder's and financial manager's own accounts
 *    from the call data the server prepares, the deposit read back from the Mirror Node.
 *
 * Environment (values are read, never printed):
 *   LOCAL_NODE_ADDRESS    default 127.0.0.1:50211
 *   LOCAL_NODE_ACCOUNT    default 0.0.3
 *   LOCAL_OPERATOR_ID     funded local account that pays for setup
 *   LOCAL_OPERATOR_KEY    its private key (0x-prefixed hex is read as ECDSA, as in HederaService)
 *   MIRROR_NODE_URL       local Mirror Node REST, e.g. http://127.0.0.1:38081
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
  const mirror = requireEnv('MIRROR_NODE_URL')
  if (!/^https?:\/\/(127\.0\.0\.1|localhost|\[::1\]):\d+\/?$/.test(mirror)) {
    throw new Error('MIRROR_NODE_URL must be a loopback address: this script only runs on a local network')
  }
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
  const prepared: string[] = []
  const release = await escrow.release(0, 1, async id => { prepared.push(id) })
  report.preparedTransactionId = { handedOverBeforeSend: prepared[0], matchesExecuted: prepared[0] === release.transactionId }
  const after = (await new AccountBalanceQuery().setAccountId(producerId).execute(operator)).hbars.toTinybars().toString()
  report.release = { ...release, producerTinybarBefore: before, producerTinybarAfter: after, delta: (BigInt(after) - BigInt(before)).toString() }
  report.periodAfterRelease = await escrow.getPeriod(0, 1)

  // Replay of the same period must fail on-chain.
  const replayIds: string[] = []
  try {
    await escrow.release(0, 1, async id => { replayIds.push(id) })
    report.secondRelease = 'ACCEPTED: replay NOT blocked'
  } catch (error) {
    report.secondRelease = `rejected: ${(error as Error).message}`
  }

  // Reconciliation reads: the Mirror Node lags consensus by a few seconds, so poll briefly.
  async function lookupWhenAvailable(id: string) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const found = await escrow.findRelease(id, 0, 1).catch(error => ({ status: 'error', message: (error as Error).message }))
      if ((found as any).status !== 'not_found') return found
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    return { status: 'not_found' }
  }
  const fromMirror: any = await lookupWhenAvailable(release.transactionId)
  report.reconcileRelease = {
    status: fromMirror.status,
    sameHashAsRecord: fromMirror.release?.transactionHash === release.transactionHash,
    sameAmount: fromMirror.release?.amount === release.amount,
    outcome: fromMirror.release?.outcome
  }
  report.reconcileReplay = await lookupWhenAvailable(replayIds[0])
  const unknownId = `${oracleId.toString()}@1000000000.000000001`
  report.reconcileUnknown = await escrow.findRelease(unknownId, 0, 1)

  // HYBRID agreement: the server prepares call data; the wallets (here, the role accounts) sign and send.
  const hybrid = await new ContractExecuteTransaction()
    .setTransactionId(TransactionId.generate(adminId))
    .setContractId(escrowId)
    .setGas(300_000)
    .setFunction('createAgreement', new ContractFunctionParameters()
      .addAddress(evm(producerId))
      .addUint256(Number(HBAR_IN_TINYBAR))
      .addUint8(70)
      .addUint8(1))
    .freezeWith(operator)
  await hybrid.sign(adminKeys[1])
  await hybrid.sign(adminKeys[2])
  await (await hybrid.execute(operator)).getReceipt(operator)

  async function sendWalletCall(client: Client, callData: string, payableTinybar?: bigint) {
    const tx = new ContractExecuteTransaction()
      .setContractId(escrowId)
      .setGas(300_000)
      .setFunctionParameters(Buffer.from(callData.slice(2), 'hex'))
    if (payableTinybar) tx.setPayableAmount(Hbar.fromTinybars(Number(payableTinybar)))
    const response = await tx.execute(client)
    const receipt = await response.getReceipt(client)
    return { transactionId: response.transactionId.toString(), status: receipt.status.toString() }
  }

  const depositTx = await sendWalletCall(funder, escrow.encodeCall('deposit', 1), 5n * HBAR_IN_TINYBAR)
  let depositRead: any = { status: 'not_found' }
  for (let attempt = 0; attempt < 30 && depositRead.status === 'not_found'; attempt++) {
    depositRead = await escrow.findDeposit(depositTx.transactionId, 1)
    if (depositRead.status === 'not_found') await new Promise(resolve => setTimeout(resolve, 1000))
  }
  report.hybridDeposit = { status: depositRead.status, funderIsFunderAccount: depositRead.funder === evm(funderId), amount: depositRead.amount }

  const hybridBatch = await escrow.submitBatch({ agreementId: 1, periodId: 1, auditHash: 'cd'.repeat(32), score: 85, scoreVersion: 1 })
  const manager = localClient(managerId, managerKey)
  // The oracle (submitter) is not the financial manager: its approve must revert on-chain
  const oracleApprove = await sendWalletCall((oracleLedger as any).client, escrow.encodeCall('approve', 1, 1)).catch((error: Error) => ({ status: error.message.split('\n')[0] }))
  const managerApprove = await sendWalletCall(manager, escrow.encodeCall('approve', 1, 1))
  const afterApproval = await escrow.getPeriod(1, 1)
  const hybridBefore = (await new AccountBalanceQuery().setAccountId(producerId).execute(operator)).hbars.toTinybars().toString()
  const hybridRelease = await escrow.release(1, 1)
  const hybridAfter = (await new AccountBalanceQuery().setAccountId(producerId).execute(operator)).hbars.toTinybars().toString()
  report.hybrid = {
    stateAfterSubmit: hybridBatch.state,
    approveByOracle: oracleApprove.status,
    approveByFinancialManager: managerApprove.status,
    stateAfterApprove: afterApproval.state,
    release: hybridRelease.outcome,
    producerDelta: (BigInt(hybridAfter) - BigInt(hybridBefore)).toString()
  }
  manager.close()

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
