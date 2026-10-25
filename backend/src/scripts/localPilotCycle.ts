/**
 * Full pilot cycle on a LOCAL Hedera network (Solo), driven through the backend's real HTTP routes
 * with real INEA measurements. Never runs against testnet or mainnet: the node and the Mirror Node
 * must be loopback addresses, and the testnet credentials the HCS/HFS modules read at import are
 * filled with a throwaway key that holds nothing.
 *
 * Real: INEA measurements, pilot score rule v1, route code, local consensus.
 * Test values (D3 pending): score threshold 70 and 2 HBAR per period. IPFS: the CID is computed
 * locally over the metadata bytes; nothing is uploaded.
 *
 * Environment (values are read, never printed): LOCAL_NODE_ADDRESS, LOCAL_NODE_ACCOUNT,
 * LOCAL_OPERATOR_ID, LOCAL_OPERATOR_KEY, MIRROR_NODE_URL, PILOT_DATABASE_URL (throwaway SQLite with
 * migrations applied), INEA_CANONICAL_CSV, INEA_SPREADSHEET_SHA256, REPORT_PATH.
 *
 * Run from backend/: npx tsx src/scripts/localPilotCycle.ts
 */
import crypto from 'crypto'
import fs from 'fs'
import {
  AccountBalanceQuery, AccountCreateTransaction, AccountId, Client, ContractCreateFlow, ContractExecuteTransaction,
  ContractFunctionParameters, ContractId, Hbar, KeyList, PrivateKey, ScheduleSignTransaction, TokenCreateTransaction,
  TokenSupplyType, TokenType, TopicCreateTransaction, TopicMessageSubmitTransaction, TransactionId
} from '@hashgraph/sdk'

const LOOPBACK_HOST = /^(127\.0\.0\.1|localhost|\[::1\]):\d+$/
const LOOPBACK_URL = /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\]):\d+\/?$/
const STATION = 'IM0010'
const PERIOD = { from: '2019-01-01', to: '2019-12-31T23:59:59Z' }
const TEST_THRESHOLD = 70
const TEST_PERIOD_TINYBAR = 2n * 100_000_000n

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}

const evm = (id: AccountId | ContractId) => '0x' + id.toEvmAddress()
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function main(): Promise<void> {
  const node = process.env.LOCAL_NODE_ADDRESS ?? '127.0.0.1:50211'
  const mirror = requireEnv('MIRROR_NODE_URL')
  if (!LOOPBACK_HOST.test(node) || !LOOPBACK_URL.test(mirror)) {
    throw new Error('LOCAL_NODE_ADDRESS and MIRROR_NODE_URL must be loopback addresses: this script only runs on a local network')
  }
  const dbUrl = requireEnv('PILOT_DATABASE_URL')
  if (!dbUrl.startsWith('file:')) throw new Error('PILOT_DATABASE_URL must be a local SQLite file')

  // Environment for the backend modules, set before they are imported
  process.env.DATABASE_URL = dbUrl
  process.env.NODE_ENV = 'production'
  process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex')
  process.env.HEDERA_NETWORK = 'testnet'
  process.env.HEDERA_ACCOUNT_ID = '0.0.2'
  process.env.HEDERA_PRIVATE_KEY = PrivateKey.generateED25519().toStringDer()

  const rawKey = requireEnv('LOCAL_OPERATOR_KEY')
  const operatorId = AccountId.fromString(requireEnv('LOCAL_OPERATOR_ID'))
  const operatorKey = rawKey.startsWith('0x') ? PrivateKey.fromStringECDSA(rawKey.slice(2)) : PrivateKey.fromString(rawKey)
  const nodeAccount = AccountId.fromString(process.env.LOCAL_NODE_ACCOUNT ?? '0.0.3')
  const clientFor = (id: AccountId, key: PrivateKey) => Client.forNetwork({ [node]: nodeAccount }).setOperator(id, key)
  const operator = clientFor(operatorId, operatorKey)
  const report: Record<string, unknown> = { station: STATION, period: PERIOD, testValues: { threshold: TEST_THRESHOLD, periodTinybar: TEST_PERIOD_TINYBAR.toString() } }

  // --- Ledger setup -------------------------------------------------------------------------
  async function account(key: PrivateKey | KeyList, hbar: number) {
    return (await (await new AccountCreateTransaction().setKeyWithoutAlias(key).setInitialBalance(new Hbar(hbar)).execute(operator)).getReceipt(operator)).accountId!
  }
  const adminKeys = [PrivateKey.generateED25519(), PrivateKey.generateED25519(), PrivateKey.generateED25519()]
  const threshold = new KeyList(adminKeys.map(k => k.publicKey), 2)
  const [oracleKey, funderKey, producerKey, managerKey] = [0, 1, 2, 3].map(() => PrivateKey.generateED25519())
  const adminId = await account(threshold, 50)
  const oracleId = await account(oracleKey, 100)
  const funderId = await account(funderKey, 100)
  const producerId = await account(producerKey, 1)
  const managerId = await account(managerKey, 10)

  const artifact = (name: string) => JSON.parse(fs.readFileSync(`../contracts/artifacts/contracts/${name}.sol/${name}.json`, 'utf8')).bytecode
  const oracleManagerId = (await (await new ContractCreateFlow().setBytecode(artifact('OracleManager')).setGas(1_000_000).execute(operator)).getReceipt(operator)).contractId!
  await (await new ContractExecuteTransaction().setContractId(oracleManagerId).setGas(200_000)
    .setFunction('authorizeOracle', new ContractFunctionParameters().addAddress(evm(oracleId))).execute(operator)).getReceipt(operator)
  const escrowId = (await (await new ContractCreateFlow().setBytecode(artifact('PESEscrowV3')).setGas(3_000_000).setAdminKey(threshold)
    .setConstructorParameters(new ContractFunctionParameters().addAddress(evm(oracleManagerId)).addAddress(evm(adminId)).addAddress(evm(managerId)).addUint256(3600))
    .sign(adminKeys[0]).sign(adminKeys[1]).execute(operator)).getReceipt(operator)).contractId!

  const tokenCreate = await new TokenCreateTransaction().setTokenName('WATA PSA Certificate (local)').setTokenSymbol('WATACERT')
    .setTokenType(TokenType.NonFungibleUnique).setSupplyType(TokenSupplyType.Infinite).setDecimals(0).setInitialSupply(0)
    .setTreasuryAccountId(operatorId).setAdminKey(threshold).setSupplyKey(threshold).freezeWith(operator)
  await tokenCreate.sign(adminKeys[0])
  await tokenCreate.sign(adminKeys[1])
  const tokenId = (await (await tokenCreate.execute(operator)).getReceipt(operator)).tokenId!.toString()

  const topicId = (await (await new TopicCreateTransaction().setTopicMemo('WATA audit (local)').execute(operator)).getReceipt(operator)).topicId!
  report.ledger = { escrow: evm(escrowId), escrowId: escrowId.toString(), oracleManager: oracleManagerId.toString(), token: tokenId, topic: topicId.toString(),
    accounts: { admin: adminId.toString(), oracle: oracleId.toString(), funder: funderId.toString(), producer: producerId.toString(), financialManager: managerId.toString() } }

  // --- Backend wired to the local network ---------------------------------------------------
  process.env.ESCROW_CONTRACT_ADDRESS = evm(escrowId)
  const express = (await import('express')).default
  const request = (await import('supertest')).default
  const jwt = (await import('jsonwebtoken')).default
  const { PrismaDatabase } = await import('../services/orm/prismaDatabase')
  const { HederaService } = await import('../services/hedera')
  const { CertificateService, rawCid } = await import('../services/certificate')
  const { ScorePeriodOracle } = await import('../services/scorePeriod')
  const { parseCsv } = await import('../score/csv')
  const { ineaRowsToMeasurementInputs } = await import('../score/inea')
  const agreementRoutes = (await import('../routes/agreements')).default
  const measurementRoutes = (await import('../routes/measurements')).default
  const oracleRoutes = (await import('../routes/oracle')).default
  const paymentRoutes = (await import('../routes/payments')).default
  const certificateRoutes = (await import('../routes/certificates')).default

  const db = new PrismaDatabase()
  await db.initialize()
  const ledger = new HederaService()
  ;(ledger as any).client = clientFor(oracleId, oracleKey)

  // Real HCS on the local network: audit records go to a local topic
  const audit = {
    async publishAuditRecord(record: object): Promise<string> {
      const response = await new TopicMessageSubmitTransaction().setTopicId(topicId).setMessage(JSON.stringify(record)).execute(operator)
      await response.getReceipt(operator)
      return response.transactionId.toString()
    }
  }
  const localPinner = { pinJson: async (content: string) => rawCid(Buffer.from(content)) }
  const certificates = new CertificateService(db as any, ledger, localPinner, {
    tokenId, imageUri: 'ipfs://bafkreidcsqzr5su356thecwuyzrhsgekfdsqzuyuqxtsu4vh7oc34iv5oy', imageType: 'image/png'
  })

  const app = express()
  app.use(express.json({ limit: '10mb' }))
  app.use('/api/agreements', agreementRoutes(ledger, db))
  app.use('/api/measurements', measurementRoutes(db))
  app.use('/api/oracle', oracleRoutes(db, ledger, { scorePeriod: new ScorePeriodOracle(db as any, () => ledger.getEscrowService(), async () => audit as any) }))
  app.use('/api/payments', paymentRoutes(ledger, db, { audit: audit as any }))
  app.use('/api/certificates', certificateRoutes(ledger, db, { service: certificates }))

  const managerEmail = `manager-${Date.now()}@local`
  const investorEmail = `investor-${Date.now()}@local`
  const managerUser = await db.createUser({ email: managerEmail, name: 'Manager', password: crypto.randomBytes(16).toString('hex'), role: 'MANAGER', isActive: true } as any)
  const investorUser = await db.createUser({ email: investorEmail, name: 'Funder', password: crypto.randomBytes(16).toString('hex'), role: 'INVESTOR', address: evm(funderId), isActive: true } as any)
  const token = (userId: number, email: string, role: string) => jwt.sign({ userId, email, role }, process.env.JWT_SECRET!, {
    algorithm: 'HS256', expiresIn: '1h', issuer: 'wata-chain', audience: 'wata-users'
  })
  const asManager = { Authorization: `Bearer ${token(managerUser, managerEmail, 'MANAGER')}` }
  const asInvestor = { Authorization: `Bearer ${token(investorUser, investorEmail, 'INVESTOR')}` }
  const step = (name: string, res: { status: number; body: any }, expected: number) => {
    report[name] = { http: res.status, data: res.body.data ?? res.body.error }
    if (res.status !== expected) throw new Error(`${name}: expected HTTP ${expected}, got ${res.status}: ${JSON.stringify(res.body)}`)
    return res.body.data
  }

  // 1. Real INEA measurements of RH-VIII, through the ingestion route
  const rows = parseCsv(fs.readFileSync(requireEnv('INEA_CANONICAL_CSV'), 'utf8')) as any[]
  const inputs = ineaRowsToMeasurementInputs(rows.filter(r => r.estacao.startsWith('00RJ04') || r.estacao.startsWith('00RJ24')), requireEnv('INEA_SPREADSHEET_SHA256'))
    .filter(m => /^(DB0010|IM0010|MC0002|MC0010|OU0020|RB0010|RO0015|SN0005|SP0010|SP0050)$/.test(m.stationCode))
  let stored = 0
  for (let i = 0; i < inputs.length; i += 1000) {
    const data = step('measurements', await request(app).post('/api/measurements').set(asManager).send({ measurements: inputs.slice(i, i + 1000) }), 201)
    stored += data.inserted
  }
  report.measurements = { stored, stations: 10 }

  // 2. Agreement: server stores terms; the threshold admin creates it on-chain; the manager links it
  const created = step('createAgreement', await request(app).post('/api/agreements').set(asManager).send({
    producerName: 'Produtor IM0010 (teste)', producerAddress: evm(producerId), baseValue: 1, hectares: 1,
    periodAmount: TEST_PERIOD_TINYBAR.toString(), scoreThreshold: TEST_THRESHOLD, governanceMode: 'AUTO', stationCode: STATION
  }), 201)
  const call = created.escrowCall.args
  const createTx = await new ContractExecuteTransaction().setTransactionId(TransactionId.generate(adminId)).setContractId(escrowId).setGas(300_000)
    .setFunction('createAgreement', new ContractFunctionParameters().addAddress(call.producer).addUint256(Number(call.periodAmount)).addUint8(call.scoreThreshold).addUint8(0))
    .freezeWith(operator)
  await createTx.sign(adminKeys[0])
  await createTx.sign(adminKeys[2])
  const createResponse = await createTx.execute(operator)
  await createResponse.getReceipt(operator)
  step('linkOnchain', await request(app).post(`/api/agreements/${created.id}/link-onchain`).set(asManager)
    .send({ onchainAgreementId: 0, transactionId: createResponse.transactionId.toString() }), 200)

  // 3. Deposit from the funder's own account, prepared and confirmed through the routes
  const depositCall = step('depositCall', await request(app).post(`/api/payments/deposit-call/${created.id}`).set(asInvestor).send({ amountTinybar: (5n * 100_000_000n).toString() }), 200)
  const funder = clientFor(funderId, funderKey)
  const depositResponse = await new ContractExecuteTransaction().setContractId(escrowId).setGas(300_000)
    .setFunctionParameters(Buffer.from(depositCall.callData.slice(2), 'hex')).setPayableAmount(Hbar.fromTinybars(Number(depositCall.payableTinybar))).execute(funder)
  await depositResponse.getReceipt(funder)
  let confirmed: any
  for (let attempt = 0; attempt < 30; attempt++) {
    confirmed = await request(app).post('/api/payments/deposits/confirm').set(asInvestor).send({ agreementId: created.id, transactionId: depositResponse.transactionId.toString() })
    if (confirmed.status !== 404) break
    await sleep(1000)
  }
  step('depositConfirm', confirmed, 201)

  // 4. Score of IM0010 in 2019 from the stored measurements, submitted to the escrow
  step('scorePeriod', await request(app).post('/api/oracle/score-period').set(asManager).send({ agreementId: created.id, ...PERIOD }), 201)

  // 5. Release through trigger-check, with the producer balance checked on-ledger
  const balance = async () => (await new AccountBalanceQuery().setAccountId(producerId).execute(operator)).hbars.toTinybars().toString()
  const before = await balance()
  const released = step('triggerCheck', await request(app).post(`/api/payments/trigger-check/${created.id}`).set(asManager).send({}), 200)
  const after = await balance()
  report.producerBalance = { before, after, delta: (BigInt(after) - BigInt(before)).toString() }

  // 6. Certificate: scheduled mint, signed by 2 of the 3 supply keys, confirmed from the Mirror Node
  const prepared = step('certificatePrepare', await request(app).post(`/api/certificates/payment/${released.paymentId}/prepare`).set(asManager).send({}), 201)
  for (const key of [adminKeys[1], adminKeys[2]]) {
    const sign = await new ScheduleSignTransaction().setScheduleId(prepared.scheduleId).freezeWith(operator)
    await sign.sign(key)
    await (await sign.execute(operator)).getReceipt(operator)
  }
  let minted: any
  for (let attempt = 0; attempt < 30; attempt++) {
    minted = await request(app).post(`/api/certificates/${prepared.certificateId}/confirm`).set(asManager).send({})
    if (minted.status === 200 && minted.body.data?.status === 'minted') break
    await sleep(1000)
  }
  step('certificateConfirm', minted, 200)

  const out = JSON.stringify(report, null, 2)
  fs.writeFileSync(requireEnv('REPORT_PATH'), out + '\n')
  console.log(out)
  await db.close()
  operator.close()
  funder.close()
  ;(ledger as any).client.close()
}

main().then(() => process.exit(0)).catch(error => {
  console.error('Local pilot cycle failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
