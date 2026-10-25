import type { IpfsPinner } from './certificate'

/**
 * Pins exact bytes through the Pinata pinFileToIPFS endpoint (CIDv1), so the CID covers the same
 * bytes the certificate hashes. The provider is a configuration decision (D6); requests to Pinata
 * have not been exercised against the real service yet.
 */
export class PinataPinner implements IpfsPinner {
  constructor(private readonly jwt: string, private readonly endpoint = 'https://api.pinata.cloud/pinning/pinFileToIPFS') {}

  async pinJson(content: string, name: string): Promise<string> {
    const form = new FormData()
    form.append('file', new Blob([content], { type: 'application/json' }), name)
    form.append('pinataOptions', JSON.stringify({ cidVersion: 1 }))
    form.append('pinataMetadata', JSON.stringify({ name }))
    const response = await fetch(this.endpoint, { method: 'POST', headers: { Authorization: `Bearer ${this.jwt}` }, body: form })
    if (!response.ok) throw new Error(`IPFS pinning failed with HTTP ${response.status}`)
    const body = await response.json() as { IpfsHash?: string }
    return String(body.IpfsHash ?? '')
  }
}

/** Pinner selected by IPFS_PROVIDER; fails clearly when none is configured. */
export function pinnerFromEnv(): IpfsPinner {
  const provider = process.env.IPFS_PROVIDER
  if (provider === 'pinata') {
    const jwt = process.env.PINATA_JWT
    if (!jwt) throw new Error('PINATA_JWT is required when IPFS_PROVIDER=pinata')
    return new PinataPinner(jwt)
  }
  throw new Error('IPFS_PROVIDER must be set to a supported provider (pinata) to pin certificate metadata')
}
