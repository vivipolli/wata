"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _bytes = require("@ethersproject/bytes");
var _cryptography = require("@hashgraph/cryptography");
var _proto = require("@hashgraph/proto");
var _Mnemonic = _interopRequireDefault(require("./Mnemonic.cjs"));
var _PublicKey = _interopRequireDefault(require("./PublicKey.cjs"));
var _Key = _interopRequireDefault(require("./Key.cjs"));
var _Cache = _interopRequireDefault(require("./Cache.cjs"));
var _SignatureMap = _interopRequireDefault(require("./transaction/SignatureMap.cjs"));
var _AccountId = _interopRequireDefault(require("./account/AccountId.cjs"));
var _TransactionId = _interopRequireDefault(require("./transaction/TransactionId.cjs"));
var _hex = require("./encoding/hex.cjs");
var _ASN1Decoder = require("./util/ASN1-Decoder.cjs");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @typedef {import("./transaction/Transaction.js").default} Transaction
 */

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IKey} HieroProto.proto.IKey
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignaturePair} HieroProto.proto.ISignaturePair
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 */

class PrivateKey extends _Key.default {
  /**
   * @internal
   * @hideconstructor
   * @param {PrivateKeyCrypto} key
   */
  constructor(key) {
    super();
    this._key = key;
  }

  /**
   * Generate a random Ed25519 private key.
   *
   * @returns {PrivateKey}
   */
  static generateED25519() {
    return new PrivateKey(_cryptography.PrivateKey.generateED25519());
  }

  /**
   * Generate a random EDSA private key.
   *
   * @returns {PrivateKey}
   */
  static generateECDSA() {
    return new PrivateKey(_cryptography.PrivateKey.generateECDSA());
  }

  /**
   * Depredated - Use `generateED25519()` instead
   * Generate a random Ed25519 private key.
   *
   * @returns {PrivateKey}
   */
  static generate() {
    return PrivateKey.generateED25519();
  }

  /**
   * Depredated - Use `generateED25519Async()` instead
   * Generate a random Ed25519 private key.
   *
   * @returns {Promise<PrivateKey>}
   */
  static async generateAsync() {
    return new PrivateKey(await _cryptography.PrivateKey.generateAsync());
  }

  /**
   * Generate a random Ed25519 private key.
   *
   * @returns {Promise<PrivateKey>}
   */
  static async generateED25519Async() {
    return new PrivateKey(await _cryptography.PrivateKey.generateED25519Async());
  }

  /**
   * Generate a random ECDSA private key.
   *
   * @returns {Promise<PrivateKey>}
   */
  static async generateECDSAAsync() {
    return new PrivateKey(await _cryptography.PrivateKey.generateECDSAAsync());
  }

  /**
   * Construct a private key from bytes. Requires DER header.
   *
   * @param {Uint8Array} data
   * @returns {PrivateKey}
   */
  static fromBytes(data) {
    const keyString = (0, _bytes.hexlify)(data);
    if (PrivateKey.isDerKey(keyString)) {
      if (PrivateKey.getAlgorithm(keyString) === "ecdsa") {
        return new PrivateKey(_cryptography.PrivateKey.fromBytesECDSA(data));
      } else {
        return new PrivateKey(_cryptography.PrivateKey.fromBytesED25519(data));
      }
    }

    // If the key is not DER, we assume it's a raw private key
    // this will default to ED25519 as we dont have a way
    // to determine the type of the key based on the raw bytes
    return new PrivateKey(_cryptography.PrivateKey.fromBytes(data));
  }

  /**
   * Construct a ECDSA private key from bytes.
   *
   * @param {Uint8Array} data
   * @returns {PrivateKey}
   */
  static fromBytesECDSA(data) {
    return new PrivateKey(_cryptography.PrivateKey.fromBytesECDSA(data));
  }

  /**
   * Construct a ED25519 private key from bytes.
   *
   * @param {Uint8Array} data
   * @returns {PrivateKey}
   */
  static fromBytesED25519(data) {
    return new PrivateKey(_cryptography.PrivateKey.fromBytesED25519(data));
  }

  /**
   * @deprecated - Use fromStringECDSA() or fromStringED2551() on a HEX-encoded string
   * and fromStringDer() on a HEX-encoded string with DER prefix instead.
   * Construct a private key from a hex-encoded string. Requires DER header.
   * @param {string} text
   * @returns {PrivateKey}
   */
  static fromString(text) {
    if (PrivateKey.isDerKey(text)) {
      return this.fromStringDer(text);
    }
    // If the key is not DER, we assume it's a raw private key
    // this will default to ED25519 as we dont have a way
    // to determine the type of the key based on the raw bytes
    return new PrivateKey(_cryptography.PrivateKey.fromString(text));
  }

  /**
   * Construct a private key from a HEX-encoded string with a der prefix
   *
   * @param {string} text
   * @returns {PrivateKey}
   */
  static fromStringDer(text) {
    // previous versions of the library used to accept non-der encoded private keys here
    // and it fallbacked to PrivateKey.fromString() so we need to keep this behavior
    if (!PrivateKey.isDerKey(text)) {
      // eslint-disable-next-line deprecation/deprecation
      return PrivateKey.fromString(text);
    }
    if (PrivateKey.getAlgorithm(text) === "ecdsa") {
      return this.fromStringECDSA(text);
    } else {
      return this.fromStringED25519(text);
    }
  }

  /**
   * Construct a ECDSA private key from a hex-encoded string.
   *
   * @param {string} text
   * @returns {PrivateKey}
   */
  static fromStringECDSA(text) {
    return new PrivateKey(_cryptography.PrivateKey.fromStringECDSA(text));
  }

  /**
   * Construct a Ed25519 private key from a hex-encoded string.
   *
   * @param {string} text
   * @returns {PrivateKey}
   */
  static fromStringED25519(text) {
    return new PrivateKey(_cryptography.PrivateKey.fromStringED25519(text));
  }

  /**
   * Construct a Ed25519 private key from a Uint8Array seed.
   *
   * @param {Uint8Array} seed
   * @returns {Promise<PrivateKey>}
   */
  static async fromSeedED25519(seed) {
    return new PrivateKey(await _cryptography.PrivateKey.fromSeedED25519(seed));
  }

  /**
   * Construct a Ed25519 private key from a Uint8Array seed.
   *
   * @param {Uint8Array} seed
   * @returns {Promise<PrivateKey>}
   */
  static async fromSeedECDSAsecp256k1(seed) {
    return new PrivateKey(await _cryptography.PrivateKey.fromSeedECDSAsecp256k1(seed));
  }

  /**
   * @deprecated - Use `Mnemonic.from[Words|String]().to[Ed25519|Ecdsa]PrivateKey()` instead
   *
   * Recover a private key from a mnemonic phrase (and optionally a password).
   * @param {Mnemonic  | string} mnemonic
   * @param {string} [passphrase]
   * @returns {Promise<PrivateKey>}
   */
  static async fromMnemonic(mnemonic, passphrase = "") {
    if (mnemonic instanceof _Mnemonic.default) {
      return new PrivateKey(
      // eslint-disable-next-line deprecation/deprecation
      await _cryptography.PrivateKey.fromMnemonic(mnemonic._mnemonic, passphrase));
    }
    return new PrivateKey(
    // eslint-disable-next-line deprecation/deprecation
    await _cryptography.PrivateKey.fromMnemonic(mnemonic, passphrase));
  }

  /**
   * Recover a private key from a keystore, previously created by `.toKeystore()`.
   *
   * This key will _not_ support child key derivation.
   *
   * @param {Uint8Array} data
   * @param {string} [passphrase]
   * @returns {Promise<PrivateKey>}
   * @throws {cryptography.BadKeyError} If the passphrase is incorrect or the hash fails to validate.
   */
  static async fromKeystore(data, passphrase = "") {
    return new PrivateKey(await _cryptography.PrivateKey.fromKeystore(data, passphrase));
  }

  /**
   * Recover a private key from a pem string; the private key may be encrypted.
   *
   * This method assumes the .pem file has been converted to a string already.
   *
   * If `passphrase` is not null or empty, this looks for the first `ENCRYPTED PRIVATE KEY`
   * section and uses `passphrase` to decrypt it; otherwise, it looks for the first `PRIVATE KEY`
   * section and decodes that as a DER-encoded  private key.
   *
   * @param {string} data
   * @param {string} [passphrase]
   * @returns {Promise<PrivateKey>}
   */
  static async fromPem(data, passphrase = "") {
    return new PrivateKey(await _cryptography.PrivateKey.fromPem(data, passphrase));
  }

  /**
   * Derive a new private key at the given wallet index.
   *
   * Only currently supported for keys created with `fromMnemonic()`; other keys will throw
   * an error.
   *
   * You can check if a key supports derivation with `.supportsDerivation()`
   *
   * @param {number} index
   * @returns {Promise<PrivateKey>}
   * @throws If this key does not support derivation.
   */
  async derive(index) {
    return new PrivateKey(await this._key.derive(index));
  }

  /**
   * @param {number} index
   * @returns {Promise<PrivateKey>}
   * @throws If this key does not support derivation.
   */
  async legacyDerive(index) {
    return new PrivateKey(await this._key.legacyDerive(index));
  }

  /**
   * Get the public key associated with this private key.
   *
   * The public key can be freely given and used by other parties to verify
   * the signatures generated by this private key.
   *
   * @returns {PublicKey}
   */
  get publicKey() {
    return new _PublicKey.default(this._key.publicKey);
  }

  /**
   * Get the public key associated with this private key.
   *
   * The public key can be freely given and used by other parties to verify
   * the signatures generated by this private key.
   *
   * @returns {?Uint8Array}
   */
  get chainCode() {
    return this._key._chainCode;
  }

  /**
   * Sign a message with this private key.
   *
   * @param {Uint8Array} bytes
   * @returns {Uint8Array} - The signature bytes without the message
   */
  sign(bytes) {
    return this._key.sign(bytes);
  }

  /**
   * @deprecated - Use legacy=false flag to use the modern approach
   * or don't pass it at all.
   * @overload
   * @param {Transaction} transaction
   * @param {true} legacy
   * @returns {Uint8Array | Uint8Array[] }
   */

  /**
   * @overload
   * @param {Transaction} transaction
   * @param {false} [legacy]
   * @returns {SignatureMap}
   */

  /**
   * @param {Transaction} transaction
   * @param {boolean} [legacy]
   * @returns {Uint8Array | Uint8Array[] | SignatureMap}
   */
  signTransaction(transaction, legacy = false) {
    if (legacy) {
      return this._signTransactionLegacy(transaction);
    }
    const sigMap = new _SignatureMap.default();
    for (const signedTx of transaction._signedTransactions.list) {
      const bodyBytes = signedTx.bodyBytes;
      if (!bodyBytes) throw new Error("Body bytes are missing");
      const body = _proto.proto.TransactionBody.decode(bodyBytes);
      if (!body.transactionID || !body.nodeAccountID) {
        throw new Error("Transaction ID or Node Account ID not found in the signed transaction");
      }
      const nodeId = _AccountId.default._fromProtobuf(body.nodeAccountID);
      const transactionId = _TransactionId.default._fromProtobuf(body.transactionID);
      const sig = this._key.sign(bodyBytes);
      sigMap.addSignature(nodeId, transactionId, this.publicKey, sig);
    }
    transaction.addSignature(this.publicKey, sigMap);
    return sigMap;
  }

  /**
   * deprecated - This method is deprecated and will be removed in future versions.
   * Use the `signTransaction` method with the `legacy=false` flag or don't
   * pass it all for the modern approach.
   * @param {Transaction} transaction
   * @returns {Uint8Array | Uint8Array[]}
   */
  _signTransactionLegacy(transaction) {
    const signatures = transaction._signedTransactions.list.map(signedTransaction => {
      const bodyBytes = signedTransaction.bodyBytes;
      if (!bodyBytes) {
        return new Uint8Array();
      }
      return this._key.sign(bodyBytes);
    });
    transaction.addSignature(this.publicKey, signatures);
    // Return directly Uint8Array if there is only one signature
    return signatures.length === 1 ? signatures[0] : signatures;
  }

  /**
   * Check if `derive` can be called on this private key.
   *
   * This is only the case if the key was created from a mnemonic.
   *
   * @returns {boolean}
   */
  isDerivable() {
    return this._key.isDerivable();
  }

  /**
   * @returns {Uint8Array}
   */
  toBytes() {
    return this._key.toBytes();
  }

  /**
   * @returns {Uint8Array}
   */
  toBytesDer() {
    return this._key.toBytesDer();
  }

  /**
   * @returns {Uint8Array}
   */
  toBytesRaw() {
    return this._key.toBytesRaw();
  }

  /**
   * @returns {string}
   */
  toString() {
    return this._key.toStringDer();
  }

  /**
   * @returns {string}
   */
  toStringDer() {
    return this._key.toStringDer();
  }

  /**
   * @returns {string}
   */
  toStringRaw() {
    return this._key.toStringRaw();
  }

  /**
   * Create a keystore with a given passphrase.
   *
   * The key can be recovered later with `fromKeystore()`.
   *
   * Note that this will not retain the ancillary data used for
   * deriving child keys, thus `.derive()` on the restored key will
   * throw even if this instance supports derivation.
   *
   * @param {string} [passphrase]
   * @returns {Promise<Uint8Array>}
   */
  toKeystore(passphrase = "") {
    return this._key.toKeystore(passphrase);
  }

  /**
   * @returns {HieroProto.proto.IKey}
   */
  _toProtobufKey() {
    return this.publicKey._toProtobufKey();
  }

  /**
   * @param {Long | number} shard
   * @param {Long | number} realm
   * @returns {AccountId}
   */
  toAccountId(shard, realm) {
    return this.publicKey.toAccountId(shard, realm);
  }

  /**
   * @returns {string}
   */
  get type() {
    return this._key._type;
  }

  /**
   * Recover the recovery ID used in the signature for the given message.
   *
   * **Note:** This method only works for ECDSA secp256k1 keys.
   * @param {Uint8Array} r - 32-byte `r` component of the signature
   * @param {Uint8Array} s - 32-byte `s` component of the signature
   * @param {Uint8Array} message - The original (unhashed) message
   * @returns {number} Recovery ID (0–3), or -1 if not found or not applicable
   */
  getRecoveryId(r, s, message) {
    return this._key.getRecoveryId(r, s, message);
  }

  /**
   * @param {string} privateKey
   * @returns { "ecdsa" | "ed25519"}
   */
  static getAlgorithm(privateKey) {
    if (!PrivateKey.isDerKey(privateKey)) {
      throw new Error("Only der keys are supported");
    }
    const decoder = new _ASN1Decoder.ASN1Decoder(Uint8Array.from((0, _hex.decode)(privateKey)));
    decoder.read();
    const decodedKeyType = decoder.getOidKeyTypes()[0];
    // @ts-ignored
    return decodedKeyType;
  }

  /**
   * @internal
   * @param {string} key
   * @returns {boolean}
   */
  static isDerKey(key) {
    try {
      const data = Uint8Array.from((0, _hex.decode)(key));
      const decoder = new _ASN1Decoder.ASN1Decoder(data);
      decoder.read(); // Attempt to read the ASN.1 structure
      return true;
    } catch (error) {
      return false;
    }
  }
}
exports.default = PrivateKey;
_Cache.default.setPrivateKeyConstructor(key => new PrivateKey(key));