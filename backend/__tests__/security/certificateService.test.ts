/**
 * NFT certificates (F5). A certificate exists only for a payment released on-chain. Its HIP-412
 * metadata is pinned to IPFS and only the ipfs://CID pointer goes on-chain. The server never mints:
 * it creates a scheduled TokenMint that the 2-of-3 supply key signs, and records the certificate as
 * minted only when the ledger shows that schedule executed and the serial carries the same pointer.
 */
import crypto from 'crypto'
import {
  CertificateService,
  CertificateError,
  rawCid,
  canonicalJson,
  MAX_NFT_METADATA_BYTES
} from '../../src/services/certificate'

const TOKEN = '0.0.5000'
const SCHEDULE = '0.0.6000'
const SCHEDULED_TX = '0.0.1002@1700000000.000000001?scheduled'
const RELEASE_HASH = '0x' + 'cd'.repeat(48)
const CONFIG = { tokenId: TOKEN, imageUri: 'ipfs://bafkreidcsqzr5su356thecwuyzrhsgekfdsqzuyuqxtsu4vh7oc34iv5oy', imageType: 'image/png' }

function payment(overrides: Record<string, unknown> = {}) {
  return {
    id: 7, agreement_id: 1, period_id: 9, status: 'completed', amount: '200000000', score: 0.85,
    audit_hash: 'ab'.repeat(32), transaction_id: '0.0.1013@1700000000.000000002', transaction_hash: RELEASE_HASH,
    hcs_transaction_id: '0.0.7@1.2', processed_at: new Date('2026-10-25T12:00:00Z'), ...overrides
  }
}

let db: any
// Fakes typed loosely: each test overrides single methods
let ledger: any
let pinner: any
let service: CertificateService
let pinned: string[]

beforeEach(() => {
  pinned = []
  db = {
    getPayment: jest.fn(async () => payment()),
    getAgreement: jest.fn(async () => ({ id: 1, blockchain_id: 0, producer_name: 'Producer', producer_address: '0x' + '11'.repeat(20) })),
    getCertificateByPayment: jest.fn(async () => null),
    getCertificate: jest.fn(async () => null),
    createCertificate: jest.fn(async () => 3),
    markCertificateScheduled: jest.fn(async () => true),
    markCertificateMinted: jest.fn(async () => true),
    markCertificateFailed: jest.fn(async () => true)
  }
  pinner = { pinJson: jest.fn(async (content: string, _name: string) => { pinned.push(content); return rawCid(Buffer.from(content)) }) }
  ledger = {
    scheduleMint: jest.fn(async () => ({ scheduleId: SCHEDULE, scheduledTransactionId: SCHEDULED_TX })),
    findScheduledMint: jest.fn(async () => ({ status: 'pending', expiresAt: 1700005000 } as const)),
    getNftMetadata: jest.fn(async () => null)
  }
  service = new CertificateService(db, ledger, pinner, CONFIG)
})

describe('prepare', () => {
  it('pins HIP-412 metadata and schedules a mint of its ipfs:// pointer', async () => {
    const result = await service.prepare(7)

    const json = pinned[0]
    const metadata = JSON.parse(json)
    expect(metadata).toMatchObject({ name: expect.any(String), image: CONFIG.imageUri, type: 'image/png', format: 'HIP412@2.0.0' })
    expect(metadata.properties).toMatchObject({
      agreementId: 1, onchainAgreementId: 0, periodId: 9, amountTinybar: '200000000', auditHash: 'ab'.repeat(32),
      releaseTransactionId: '0.0.1013@1700000000.000000002', releaseTransactionHash: RELEASE_HASH
    })
    // Deterministic bytes: the same payment always yields the same metadata and CID
    expect(json).toBe(canonicalJson(metadata))

    const cid = rawCid(Buffer.from(json))
    expect(db.createCertificate).toHaveBeenCalledWith({
      paymentId: 7, metadataJson: json, metadataSha256: crypto.createHash('sha256').update(json).digest('hex')
    })
    expect(ledger.scheduleMint).toHaveBeenCalledWith(TOKEN, `ipfs://${cid}`, 'WATA certificate 3')
    expect(db.markCertificateScheduled).toHaveBeenCalledWith(3, {
      cid, uri: `ipfs://${cid}`, tokenId: TOKEN, scheduleId: SCHEDULE, scheduledTransactionId: SCHEDULED_TX
    })
    expect(result).toMatchObject({ certificateId: 3, scheduleId: SCHEDULE, metadataUri: `ipfs://${cid}` })
  })

  it.each([
    ['a pending payment', { status: 'pending' }],
    ['a failed payment', { status: 'failed' }],
    ['a payment without the release hash', { transaction_hash: null }],
    ['a payment without an on-chain period', { period_id: null }]
  ])('refuses %s', async (_label, override) => {
    db.getPayment.mockResolvedValueOnce(payment(override))
    await expect(service.prepare(7)).rejects.toBeInstanceOf(CertificateError)
    expect(ledger.scheduleMint).not.toHaveBeenCalled()
    expect(pinner.pinJson).not.toHaveBeenCalled()
  })

  it('also certifies a deferred payout (released on-chain, held for withdrawal)', async () => {
    db.getPayment.mockResolvedValueOnce(payment({ status: 'deferred' }))
    await expect(service.prepare(7)).resolves.toMatchObject({ certificateId: 3 })
  })

  it('never schedules a second mint for a certificate already scheduled or minted', async () => {
    db.getCertificateByPayment.mockResolvedValueOnce({ id: 3, status: 'minted' })
    await expect(service.prepare(7)).rejects.toMatchObject({ code: 'ALREADY_EXISTS' })
    db.getCertificateByPayment.mockResolvedValueOnce({ id: 3, status: 'scheduled' })
    await expect(service.prepare(7)).rejects.toMatchObject({ code: 'ALREADY_EXISTS' })
    expect(ledger.scheduleMint).not.toHaveBeenCalled()
  })

  it('resumes a prepared or failed certificate with its stored metadata', async () => {
    const stored = canonicalJson({ name: 'stored' })
    db.getCertificateByPayment.mockResolvedValueOnce({ id: 3, status: 'failed', metadata_json: stored })

    await service.prepare(7)

    expect(db.createCertificate).not.toHaveBeenCalled()
    expect(pinned).toEqual([stored])
  })

  it('refuses a pinning provider that returns something other than the CID of the content', async () => {
    pinner.pinJson.mockResolvedValueOnce('not-a-cid')
    await expect(service.prepare(7)).rejects.toMatchObject({ code: 'INVALID_CID' })
    expect(ledger.scheduleMint).not.toHaveBeenCalled()
  })

  it('refuses a pointer longer than the NFT metadata limit', async () => {
    pinner.pinJson.mockResolvedValueOnce('b' + 'a'.repeat(MAX_NFT_METADATA_BYTES))
    await expect(service.prepare(7)).rejects.toMatchObject({ code: 'METADATA_TOO_LONG' })
    expect(ledger.scheduleMint).not.toHaveBeenCalled()
  })
})

describe('confirm', () => {
  const scheduled = (overrides: Record<string, unknown> = {}) => ({
    id: 3, payment_id: 7, status: 'scheduled', token_id: TOKEN, schedule_id: SCHEDULE,
    metadata_uri: 'ipfs://bafkreiexample', ...overrides
  })

  beforeEach(() => db.getCertificate.mockResolvedValue(scheduled()))

  it('records the mint only when the schedule executed and the serial carries the same pointer', async () => {
    ledger.findScheduledMint.mockResolvedValueOnce({ status: 'executed', result: 'SUCCESS', tokenId: TOKEN, serials: [12], transactionHash: '0x' + 'ef'.repeat(48) })
    ledger.getNftMetadata.mockResolvedValueOnce('ipfs://bafkreiexample')

    await expect(service.confirm(3)).resolves.toMatchObject({ status: 'minted', serialNumber: 12 })
    expect(ledger.getNftMetadata).toHaveBeenCalledWith(TOKEN, 12)
    expect(db.markCertificateMinted).toHaveBeenCalledWith(3, SCHEDULE, { serialNumber: 12, mintTransactionHash: '0x' + 'ef'.repeat(48) })
  })

  it('reports a schedule still waiting for signatures', async () => {
    await expect(service.confirm(3)).resolves.toEqual({ status: 'awaiting_signatures', expiresAt: 1700005000 })
    expect(db.markCertificateMinted).not.toHaveBeenCalled()
  })

  it('refuses a serial whose on-chain metadata differs from the certificate', async () => {
    ledger.findScheduledMint.mockResolvedValueOnce({ status: 'executed', result: 'SUCCESS', tokenId: TOKEN, serials: [12], transactionHash: '0x01' })
    ledger.getNftMetadata.mockResolvedValueOnce('ipfs://somethingelse')
    await expect(service.confirm(3)).rejects.toMatchObject({ code: 'LEDGER_MISMATCH' })
    expect(db.markCertificateMinted).not.toHaveBeenCalled()
  })

  it.each([
    ['another token', { tokenId: '0.0.9999', serials: [12] }],
    ['no serial', { tokenId: TOKEN, serials: [] }],
    ['more than one serial', { tokenId: TOKEN, serials: [12, 13] }]
  ])('refuses an executed schedule that minted %s', async (_label, override) => {
    // Matching metadata, so only the token and serial checks can refuse it
    ledger.getNftMetadata.mockResolvedValue('ipfs://bafkreiexample')
    ledger.findScheduledMint.mockResolvedValueOnce({ status: 'executed', result: 'SUCCESS', transactionHash: '0x01', ...override } as any)
    await expect(service.confirm(3)).rejects.toMatchObject({ code: 'LEDGER_MISMATCH' })
    expect(db.markCertificateMinted).not.toHaveBeenCalled()
  })

  it('marks failed an executed schedule whose mint failed, and an expired or deleted schedule', async () => {
    ledger.getNftMetadata.mockResolvedValue('ipfs://bafkreiexample')
    ledger.findScheduledMint.mockResolvedValueOnce({ status: 'executed', result: 'METADATA_TOO_LONG', tokenId: TOKEN, serials: [12], transactionHash: null })
    await expect(service.confirm(3)).resolves.toMatchObject({ status: 'failed' })
    ledger.findScheduledMint.mockResolvedValueOnce({ status: 'expired' })
    await expect(service.confirm(3)).resolves.toMatchObject({ status: 'failed' })
    expect(db.markCertificateFailed).toHaveBeenCalledWith(3, SCHEDULE)
    expect(db.markCertificateMinted).not.toHaveBeenCalled()
  })

  it('only confirms a scheduled certificate', async () => {
    db.getCertificate.mockResolvedValueOnce(scheduled({ status: 'minted' }))
    await expect(service.confirm(3)).rejects.toMatchObject({ code: 'INVALID_STATE' })
    expect(ledger.findScheduledMint).not.toHaveBeenCalled()
  })
})

describe('rawCid', () => {
  it('computes the CIDv1 (raw, sha2-256, base32) of the content', () => {
    // Reference: CID of the empty block
    expect(rawCid(Buffer.alloc(0))).toBe('bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku')
  })
})
