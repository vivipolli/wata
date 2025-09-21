"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Key = _interopRequireDefault(require("./Key.cjs"));
var _BadKeyError = _interopRequireDefault(require("./BadKeyError.cjs"));
var _Ed25519PublicKey = _interopRequireDefault(require("./Ed25519PublicKey.cjs"));
var _EcdsaPublicKey = _interopRequireDefault(require("./EcdsaPublicKey.cjs"));
var _array = require("./util/array.cjs");
var hex = _interopRequireWildcard(require("./encoding/hex.cjs"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * @typedef {import("./PrivateKey.js").Transaction} Transaction
 */

/**
 * An public key on the Hedera™ network.
 */
class PublicKey extends _Key.default {
  /**
   * @internal
   * @hideconstructor
   * @param {Ed25519PublicKey | EcdsaPublicKey} key
   */
  constructor(key) {
    super();

    /**
     * @type {Ed25519PublicKey | EcdsaPublicKey}
     * @private
     * @readonly
     */
    this._key = key;
  }

  /**
   * @returns {string}
   */
  get _type() {
    return this._key._type;
  }

  /**
   * @param {Uint8Array} data
   * @returns {PublicKey}
   */
  static fromBytes(data) {
    let message;
    try {
      return new PublicKey(_Ed25519PublicKey.default.fromBytes(data));
    } catch (error) {
      message =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      error != null && /** @type {Error} */error.message != null ?
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      /** @type {Error} */
      error.message : "";
    }
    try {
      return new PublicKey(_EcdsaPublicKey.default.fromBytes(data));
    } catch (error) {
      message =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      error != null && /** @type {Error} */error.message != null ?
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      /** @type {Error} */
      error.message : "";
    }
    throw new _BadKeyError.default(`public key cannot be decoded from bytes: ${message}`);
  }

  /**
   * @param {Uint8Array} data
   * @returns {PublicKey}
   */
  static fromBytesED25519(data) {
    return new PublicKey(_Ed25519PublicKey.default.fromBytes(data));
  }

  /**
   * @param {Uint8Array} data
   * @returns {PublicKey}
   */
  static fromBytesECDSA(data) {
    return new PublicKey(_EcdsaPublicKey.default.fromBytes(data));
  }

  /**
   * Parse a public key from a string of hexadecimal digits.
   *
   * The public key may optionally be prefixed with
   * the DER header.
   * @param {string} text
   * @returns {PublicKey}
   */
  static fromString(text) {
    return PublicKey.fromBytes(hex.decode(text));
  }

  /**
   * @param {string} text
   * @returns {PublicKey}
   */
  static fromStringED25519(text) {
    return PublicKey.fromBytesED25519(hex.decode(text));
  }

  /**
   * @param {string} text
   * @returns {PublicKey}
   */
  static fromStringECDSA(text) {
    return PublicKey.fromBytesECDSA(hex.decode(text));
  }

  /**
   * Verify a signature on a message with this public key.
   * @param {Uint8Array} message
   * @param {Uint8Array} signature
   * @returns {boolean}
   */
  verify(message, signature) {
    return this._key.verify(message, signature);
  }

  /**
   * @deprecated - use `@hashgraph/sdk`.PublicKey instead
   * @param {Transaction} transaction
   * @returns {boolean}
   */
  verifyTransaction(transaction) {
    //NOSONAR
    console.log("Deprecated: use `@hashgraph/sdk`.PublicKey instead");
    transaction._requireFrozen();
    if (!transaction.isFrozen()) {
      transaction.freeze();
    }
    for (const signedTransaction of transaction._signedTransactions) {
      if (signedTransaction.sigMap != null && signedTransaction.sigMap.sigPair != null) {
        let found = false;
        for (const sigPair of signedTransaction.sigMap.sigPair) {
          const pubKeyPrefix = /** @type {Uint8Array} */
          sigPair.pubKeyPrefix;
          if ((0, _array.arrayEqual)(pubKeyPrefix, this.toBytesRaw())) {
            found = true;
            const bodyBytes = /** @type {Uint8Array} */
            signedTransaction.bodyBytes;
            const signature = sigPair.ed25519 != null ? sigPair.ed25519 : (/** @type {Uint8Array} */
            sigPair.ECDSASecp256k1);
            if (!this.verify(bodyBytes, signature)) {
              return false;
            }
          }
        }
        if (!found) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * @returns {Uint8Array}
   */
  toBytes() {
    if (this._key instanceof _Ed25519PublicKey.default) {
      return this.toBytesRaw();
    } else {
      return this.toBytesDer();
    }
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
    return this.toStringDer();
  }

  /**
   * @returns {string}
   */
  toStringDer() {
    return hex.encode(this.toBytesDer());
  }

  /**
   * @returns {string}
   */
  toStringRaw() {
    return hex.encode(this.toBytesRaw());
  }

  /**
   * @returns {string}
   */
  toEthereumAddress() {
    if (this._key instanceof _EcdsaPublicKey.default) {
      return this._key.toEthereumAddress();
    } else {
      throw new Error("unsupported operation on Ed25519PublicKey");
    }
  }

  /**
   * @param {PublicKey} other
   * @returns {boolean}
   */
  equals(other) {
    if (this._key instanceof _Ed25519PublicKey.default && other._key instanceof _Ed25519PublicKey.default) {
      return this._key.equals(other._key);
    } else if (this._key instanceof _EcdsaPublicKey.default && other._key instanceof _EcdsaPublicKey.default) {
      return this._key.equals(other._key);
    } else {
      return false;
    }
  }
}
exports.default = PublicKey;