/**
 * Multi-word mnemonic phrase (BIP-39).
 *
 * Compatible with the official Hiero mobile
 * wallets (24-words or 22-words) and BRD (12-words).
 */
export default class Mnemonic {
    /**
     * Returns a new random 24-word mnemonic from the BIP-39
     * standard English word list.
     *
     * @returns {Promise<Mnemonic>}
     */
    static generate(): Promise<Mnemonic>;
    /**
     * Returns a new random 12-word mnemonic from the BIP-39
     * standard English word list.
     *
     * @returns {Promise<Mnemonic>}
     */
    static generate12(): Promise<Mnemonic>;
    /**
     * Construct a mnemonic from a list of words. Handles 12, 22 (legacy), and 24 words.
     *
     * An exception of BadMnemonicError will be thrown if the mnemonic
     * contains unknown words or fails the checksum. An invalid mnemonic
     * can still be used to create private keys, the exception will
     * contain the failing mnemonic in case you wish to ignore the
     * validation error and continue.
     *
     * @param {string[]} words
     * @throws {cryptography.BadMnemonicError}
     * @returns {Promise<Mnemonic>}
     */
    static fromWords(words: string[]): Promise<Mnemonic>;
    /**
     * Recover a mnemonic phrase from a string, splitting on spaces. Handles 12, 22 (legacy), and 24 words.
     *
     * @param {string} mnemonic
     * @returns {Promise<Mnemonic>}
     */
    static fromString(mnemonic: string): Promise<Mnemonic>;
    /**
     * @param {MnemonicCryptography} mnemonic
     * @hideconstructor
     * @private
     */
    private constructor();
    _mnemonic: MnemonicCryptography;
    /**
     * @deprecated - Use `toStandardEd25519PrivateKey()` or `toStandardECDSAsecp256k1PrivateKey()` instead
     * Recover a private key from this mnemonic phrase, with an
     * optional passphrase.
     * @param {string} [passphrase]
     * @returns {Promise<PrivateKey>}
     */
    toPrivateKey(passphrase?: string): Promise<PrivateKey>;
    /**
     * @deprecated - Use `toStandardEd25519PrivateKey()` or `toStandardECDSAsecp256k1PrivateKey()` instead
     * Recover an Ed25519 private key from this mnemonic phrase, with an
     * optional passphrase.
     * @param {string} [passphrase]
     * @param {number[]} [path]
     * @returns {Promise<PrivateKey>}
     */
    toEd25519PrivateKey(passphrase?: string, path?: number[]): Promise<PrivateKey>;
    /**
     * Recover an Ed25519 private key from this mnemonic phrase, with an
     * optional passphrase.
     *
     * @param {string} [passphrase]
     * @param {number} [index]
     * @returns {Promise<PrivateKey>}
     */
    toStandardEd25519PrivateKey(passphrase?: string, index?: number): Promise<PrivateKey>;
    /**
     * @deprecated - Use `toStandardEd25519PrivateKey()` or `toStandardECDSAsecp256k1PrivateKey()` instead
     * Recover an ECDSA private key from this mnemonic phrase, with an
     * optional passphrase.
     * @param {string} [passphrase]
     * @param {number[]} [path]
     * @returns {Promise<PrivateKey>}
     */
    toEcdsaPrivateKey(passphrase?: string, path?: number[]): Promise<PrivateKey>;
    /**
     * Converts a derivation path from string to an array of integers.
     * Note that this expects precisely 5 components in the derivation path,
     * as per BIP-44:
     * `m / purpose' / coin_type' / account' / change / address_index`
     * Takes into account `'` for hardening as per BIP-32,
     * and does not prescribe which components should be hardened.
     *
     * @param {string} derivationPath    the derivation path in BIP-44 format,
     *                                   e.g. "m/44'/60'/0'/0/0"
     * @returns {Array<number>} to be used with PrivateKey#derive
     */
    calculateDerivationPathValues(derivationPath: string): Array<number>;
    /**
     * Common implementation for both `toStandardECDSAsecp256k1PrivateKey`
     * functions.
     *
     * @param {string} passphrase  the passphrase used to protect the
     *                             mnemonic, use "" for none
     * @param {Array<number>} derivationPathValues derivation path as an
     *                             integer array,
     *                             see: `calculateDerivationPathValues`
     * @returns {Promise<PrivateKey>}  a private key
     */
    toStandardECDSAsecp256k1PrivateKeyImpl(passphrase: string, derivationPathValues: Array<number>): Promise<PrivateKey>;
    /**
     * Recover an ECDSA private key from this mnemonic phrase, with an
     * optional passphrase.
     *
     * @param {string} [passphrase]
     * @param {number} [index]
     * @returns {Promise<PrivateKey>}
     */
    toStandardECDSAsecp256k1PrivateKey(passphrase?: string, index?: number): Promise<PrivateKey>;
    /**
     * Recover an ECDSAsecp256k1 private key from this mnemonic phrase and
     * derivation path, with an optional passphrase
     *
     * @param {string} passphrase      the passphrase used to protect the mnemonic,
     *                                 use "" for none
     * @param {string} derivationPath  the derivation path in BIP-44 format,
     *                                 e.g. "m/44'/60'/0'/0/0"
     * @returns {Promise<PrivateKey>}  the private key
     */
    toStandardECDSAsecp256k1PrivateKeyCustomDerivationPath(passphrase: string | undefined, derivationPath: string): Promise<PrivateKey>;
    /**
     * @returns {Promise<PrivateKey>}
     */
    toLegacyPrivateKey(): Promise<PrivateKey>;
    /**
     * @param {string} passphrase
     * @returns {Promise<Uint8Array>}
     */
    toSeed(passphrase: string): Promise<Uint8Array>;
    /**
     * @returns {string}
     */
    toString(): string;
}
export type PrivateKey = import("./PrivateKey.js").default;
import { Mnemonic as MnemonicCryptography } from "@hashgraph/cryptography";
