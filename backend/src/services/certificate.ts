import crypto from 'crypto'

/**
 * HTS limit for the metadata of one NFT serial. The on-chain metadata is only the ipfs:// pointer
 * to the HIP-412 JSON, so it must fit. Checked against a local network (METADATA_TOO_LONG above it).
 */
export const MAX_NFT_METADATA_BYTES = 100

// CIDv0 (base58btc, sha2-256) or CIDv1 in base32 (starts with "b")
const CID = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{58,})$/

export type CertificateErrorCode =
  | 'NOT_FOUND' | 'NOT_RELEASED' | 'ALREADY_EXISTS' | 'INVALID_CID' | 'METADATA_TOO_LONG' | 'INVALID_STATE' | 'LEDGER_MISMATCH'

export class CertificateError extends Error {
  constructor(public readonly code: CertificateErrorCode, message: string) {
    super(message)
    this.name = 'CertificateError'
  }
}

/** Pins content to IPFS and returns its CID. Providers are configuration (D6). */
export interface IpfsPinner {
  pinJson(content: string, name: string): Promise<string>
}

export type ScheduledMint =
  | { status: 'pending'; expiresAt: number | null }
  | { status: 'expired' }
  | { status: 'deleted' }
  | { status: 'executed'; result: string; tokenId: string; serials: number[]; transactionHash: string | null }

/** Ledger operations for certificates. The server pays for the schedule; the supply key signs it. */
export interface CertificateLedger {
  scheduleMint(tokenId: string, metadata: string, memo: string): Promise<{ scheduleId: string; scheduledTransactionId: string }>
  findScheduledMint(scheduleId: string): Promise<ScheduledMint>
  // Metadata of a minted serial as UTF-8, or null when the serial does not exist
  getNftMetadata(tokenId: string, serialNumber: number): Promise<string | null>
}

export interface CertificateConfig {
  tokenId: string
  // HIP-412 requires an image and its mime type
  imageUri: string
  imageType: string
}

interface CertificateDatabase {
  getPayment(id: number): Promise<any>
  getAgreement(id: number): Promise<any>
  getCertificate(id: number): Promise<any>
  getCertificateByPayment(paymentId: number): Promise<any>
  createCertificate(data: { paymentId: number; metadataJson: string; metadataSha256: string }): Promise<number>
  markCertificateScheduled(id: number, data: { cid: string; uri: string; tokenId: string; scheduleId: string; scheduledTransactionId: string }): Promise<boolean>
  markCertificateMinted(id: number, scheduleId: string, data: { serialNumber: number; mintTransactionHash: string | null }): Promise<boolean>
  markCertificateFailed(id: number, scheduleId: string): Promise<boolean>
}

/** JSON with keys sorted at every level, so the same certificate always has the same bytes and CID. */
export function canonicalJson(value: unknown): string {
  const sort = (v: any): any => {
    if (Array.isArray(v)) return v.map(sort)
    if (v && typeof v === 'object' && !(v instanceof Date)) {
      return Object.keys(v).sort().reduce((acc: any, key) => { acc[key] = sort(v[key]); return acc }, {})
    }
    return v
  }
  return JSON.stringify(sort(value))
}

const BASE32 = 'abcdefghijklmnopqrstuvwxyz234567'

/** CIDv1 of the raw bytes (codec raw 0x55, multihash sha2-256), base32 lower case. */
export function rawCid(content: Uint8Array): string {
  const bytes = Buffer.concat([Buffer.from([0x01, 0x55, 0x12, 0x20]), crypto.createHash('sha256').update(content).digest()])
  let bits = 0
  let value = 0
  let out = 'b'
  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31]
  return out
}

const RELEASED = new Set(['completed', 'deferred'])

export class CertificateService {
  constructor(
    private readonly database: CertificateDatabase,
    private readonly ledger: CertificateLedger,
    private readonly pinner: IpfsPinner,
    private readonly config: CertificateConfig
  ) {}

  /**
   * Builds and pins the HIP-412 metadata of a released payment and schedules the mint of its pointer.
   * Nothing is minted here: the scheduled TokenMint executes only with the supply key signatures.
   */
  async prepare(paymentId: number) {
    const payment = await this.database.getPayment(paymentId)
    if (!payment) throw new CertificateError('NOT_FOUND', 'Payment not found')
    if (!RELEASED.has(payment.status) || !payment.transaction_hash || payment.period_id == null) {
      throw new CertificateError('NOT_RELEASED', 'Only a payment released on-chain, with its ledger hash, can be certified')
    }

    const existing = await this.database.getCertificateByPayment(paymentId)
    if (existing && existing.status !== 'prepared' && existing.status !== 'failed') {
      throw new CertificateError('ALREADY_EXISTS', `Certificate ${existing.id} is already ${existing.status}`)
    }

    let certificateId: number
    let json: string
    if (existing) {
      // Resume with the stored bytes so the CID never changes for a payment
      certificateId = existing.id
      json = existing.metadata_json
    } else {
      json = canonicalJson(await this.buildMetadata(payment))
      certificateId = await this.database.createCertificate({
        paymentId,
        metadataJson: json,
        metadataSha256: crypto.createHash('sha256').update(json).digest('hex')
      })
    }

    const cid = await this.pinner.pinJson(json, `wata-certificate-${certificateId}.json`)
    if (typeof cid !== 'string' || !CID.test(cid)) {
      throw new CertificateError('INVALID_CID', 'The IPFS provider did not return a valid CID')
    }
    const uri = `ipfs://${cid}`
    if (Buffer.byteLength(uri, 'utf8') > MAX_NFT_METADATA_BYTES) {
      throw new CertificateError('METADATA_TOO_LONG', `The metadata pointer exceeds ${MAX_NFT_METADATA_BYTES} bytes`)
    }

    // An identical pending schedule is returned by the ledger instead of a new one, so a retry
    // after a crash finds the same schedule rather than creating a second mint.
    const schedule = await this.ledger.scheduleMint(this.config.tokenId, uri, `WATA certificate ${certificateId}`)
    await this.database.markCertificateScheduled(certificateId, {
      cid, uri, tokenId: this.config.tokenId, scheduleId: schedule.scheduleId, scheduledTransactionId: schedule.scheduledTransactionId
    })
    return { certificateId, metadataUri: uri, scheduleId: schedule.scheduleId, scheduledTransactionId: schedule.scheduledTransactionId }
  }

  /** Reads the schedule on the ledger and records the mint only if it checks out. */
  async confirm(certificateId: number) {
    const certificate = await this.database.getCertificate(certificateId)
    if (!certificate) throw new CertificateError('NOT_FOUND', 'Certificate not found')
    if (certificate.status !== 'scheduled') {
      throw new CertificateError('INVALID_STATE', `Certificate is ${certificate.status}, not scheduled`)
    }

    const mint = await this.ledger.findScheduledMint(certificate.schedule_id)
    if (mint.status === 'pending') {
      return { status: 'awaiting_signatures' as const, expiresAt: mint.expiresAt }
    }
    if (mint.status !== 'executed' || mint.result !== 'SUCCESS') {
      await this.database.markCertificateFailed(certificateId, certificate.schedule_id)
      return { status: 'failed' as const, reason: mint.status === 'executed' ? mint.result : mint.status }
    }

    if (mint.tokenId !== certificate.token_id || mint.serials.length !== 1) {
      throw new CertificateError('LEDGER_MISMATCH', 'The executed schedule did not mint exactly one serial of the certificate token')
    }
    const serialNumber = mint.serials[0]
    const onchainMetadata = await this.ledger.getNftMetadata(certificate.token_id, serialNumber)
    if (onchainMetadata !== certificate.metadata_uri) {
      throw new CertificateError('LEDGER_MISMATCH', `Serial ${serialNumber} does not carry this certificate's metadata`)
    }

    await this.database.markCertificateMinted(certificateId, certificate.schedule_id, {
      serialNumber, mintTransactionHash: mint.transactionHash
    })
    return { status: 'minted' as const, tokenId: certificate.token_id, serialNumber, metadataUri: certificate.metadata_uri }
  }

  private async buildMetadata(payment: any) {
    const agreement = await this.database.getAgreement(payment.agreement_id)
    if (!agreement || agreement.blockchain_id == null) {
      throw new CertificateError('NOT_RELEASED', 'The agreement is not linked on-chain')
    }
    // HIP-412: name, image and type are required; format names the schema of the other fields
    return {
      name: `W.A.T.A. PSA certificate - agreement ${payment.agreement_id}, period ${payment.period_id}`,
      creator: 'W.A.T.A.',
      description: 'Payment for water environmental services released by the PESEscrowV3 escrow after a validated dMRV score.',
      image: this.config.imageUri,
      type: this.config.imageType,
      format: 'HIP412@2.0.0',
      properties: {
        agreementId: payment.agreement_id,
        onchainAgreementId: agreement.blockchain_id,
        periodId: payment.period_id,
        producerAddress: agreement.producer_address,
        amountTinybar: payment.amount,
        score: payment.score,
        auditHash: payment.audit_hash,
        releaseTransactionId: payment.transaction_id,
        releaseTransactionHash: payment.transaction_hash,
        hcsTransactionId: payment.hcs_transaction_id ?? null,
        releasedAt: payment.processed_at ? new Date(payment.processed_at).toISOString() : null
      },
      attributes: [
        { trait_type: 'period', value: payment.period_id },
        { trait_type: 'outcome', value: payment.status }
      ]
    }
  }
}
