const SHA256_HEX = /^[0-9a-fA-F]{64}$/

/**
 * Converts a hex-encoded SHA-256 digest into the raw 32 bytes expected by a Solidity bytes32.
 * Accepts exactly 64 hex characters, with an optional 0x prefix. Anything else throws, so a
 * malformed hash never reaches the ledger truncated or padded.
 */
export function sha256HexToBytes32(hex: string): Uint8Array {
  if (typeof hex !== 'string') {
    throw new Error('Hash must be a hex string')
  }
  const digits = hex.startsWith('0x') || hex.startsWith('0X') ? hex.slice(2) : hex
  if (!SHA256_HEX.test(digits)) {
    throw new Error('Hash must be a SHA-256 digest: exactly 64 hex characters')
  }
  return new Uint8Array(Buffer.from(digits, 'hex'))
}
