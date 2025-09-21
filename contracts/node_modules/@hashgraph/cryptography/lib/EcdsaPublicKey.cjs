"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _secp256k = require("@noble/curves/secp256k1");
var _Key = _interopRequireDefault(require("./Key.cjs"));
var _BadKeyError = _interopRequireDefault(require("./BadKeyError.cjs"));
var _array = require("./util/array.cjs");
var hex = _interopRequireWildcard(require("./encoding/hex.cjs"));
var ecdsa = _interopRequireWildcard(require("./primitive/ecdsa.cjs"));
var _keccak = require("./primitive/keccak.cjs");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const legacyDerPrefix = "302d300706052b8104000a032200";
const legacyDerPrefixBytes = hex.decode(legacyDerPrefix);
const derPrefix = "3036301006072a8648ce3d020106052b8104000a032200";
const derPrefixBytes = hex.decode(derPrefix);

/**
 * A public key on the Hedera™ network.
 */
class EcdsaPublicKey extends _Key.default {
  /**
   * @internal
   * @hideconstructor
   * @param {Uint8Array} keyData
   */
  constructor(keyData) {
    super();

    /**
     * @type {Uint8Array}
     * @private
     * @readonly
     */
    this._keyData = keyData;
  }

  /**
   * @returns {string}
   */
  get _type() {
    return "secp256k1";
  }

  /**
   * @param {Uint8Array} data
   * @returns {EcdsaPublicKey}
   */
  static fromBytes(data) {
    switch (data.length) {
      case 33:
        return EcdsaPublicKey.fromBytesRaw(data);
      default:
        return EcdsaPublicKey.fromBytesDer(data);
    }
  }

  /**
   * @param {Uint8Array} data
   * @returns {EcdsaPublicKey}
   */
  static fromBytesDer(data) {
    let ecdsaPublicKeyBytes;
    switch (data.length) {
      case 47:
        // Legacy DER prefix
        ecdsaPublicKeyBytes = data.subarray(legacyDerPrefixBytes.length);
        break;
      case 56:
        // Standard DER prefix
        ecdsaPublicKeyBytes = data.subarray(derPrefixBytes.length, derPrefixBytes.length + 33);
        break;
      default:
        // Uncompressed DER public keys
        try {
          const keyPair = _secp256k.secp256k1.ProjectivePoint.fromHex(data.subarray(derPrefixBytes.length));
          ecdsaPublicKeyBytes = keyPair.toRawBytes(true); // Compressed format
        } catch (error) {
          throw new _BadKeyError.default(`cannot decode ECDSA public key from this DER format`);
        }
        break;
    }
    if (!ecdsaPublicKeyBytes || ecdsaPublicKeyBytes.length === 0) {
      throw new _BadKeyError.default(`cannot decode ECDSA public key from this DER format`);
    }
    return new EcdsaPublicKey(ecdsaPublicKeyBytes);
  }

  /**
   * @param {Uint8Array} data
   * @returns {EcdsaPublicKey}
   */
  static fromBytesRaw(data) {
    if (data.length !== 33) {
      throw new _BadKeyError.default(`invalid public key length: ${data.length} bytes`);
    }
    return new EcdsaPublicKey(data);
  }

  /**
   * Parse a public key from a hexadecimal string.
   *
   * The public key may optionally be prefixed with
   * the DER header.
   * @param {string} text
   * @returns {EcdsaPublicKey}
   */
  static fromString(text) {
    return EcdsaPublicKey.fromBytes(hex.decode(text));
  }

  /**
   * Verify a signature on a message with this public key.
   * @param {Uint8Array} message
   * @param {Uint8Array} signature
   * @returns {boolean}
   */
  verify(message, signature) {
    return ecdsa.verify(this._keyData, message, signature);
  }

  /**
   * @returns {Uint8Array}
   */
  toBytesDer() {
    const bytes = new Uint8Array(legacyDerPrefixBytes.length + this._keyData.length);
    bytes.set(legacyDerPrefixBytes, 0);
    bytes.set(this._keyData, legacyDerPrefixBytes.length);
    return bytes;
  }

  /**
   * @returns {Uint8Array}
   */
  toBytesRaw() {
    return new Uint8Array(this._keyData.subarray());
  }

  /**
   * @returns {string}
   */
  toEthereumAddress() {
    const publicKey = _secp256k.secp256k1.ProjectivePoint.fromHex(this._keyData).toRawBytes(false);
    const hash = hex.decode((0, _keccak.keccak256)(`0x${hex.encode(publicKey.subarray(1))}`));
    return hex.encode(hash.subarray(12));
  }

  /**
   * @param {EcdsaPublicKey} other
   * @returns {boolean}
   */
  equals(other) {
    return (0, _array.arrayEqual)(this._keyData, other._keyData);
  }
}
exports.default = EcdsaPublicKey;