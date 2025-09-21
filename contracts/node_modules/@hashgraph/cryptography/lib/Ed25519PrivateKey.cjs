"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.derPrefixBytes = exports.derPrefix = exports.default = void 0;
var _BadKeyError = _interopRequireDefault(require("./BadKeyError.cjs"));
var _Ed25519PublicKey = _interopRequireDefault(require("./Ed25519PublicKey.cjs"));
var _tweetnacl = _interopRequireDefault(require("tweetnacl"));
var hex = _interopRequireWildcard(require("./encoding/hex.cjs"));
var random = _interopRequireWildcard(require("./primitive/random.cjs"));
var slip10 = _interopRequireWildcard(require("./primitive/slip10.cjs"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const derPrefix = exports.derPrefix = "302e020100300506032b657004220420";
const derPrefixBytes = exports.derPrefixBytes = hex.decode(derPrefix);
class Ed25519PrivateKey {
  /**
   * @hideconstructor
   * @internal
   * @param {nacl.SignKeyPair | Uint8Array} keyPair
   * @param {Uint8Array=} chainCode
   */
  constructor(keyPair, chainCode) {
    /**
     * @type {nacl.SignKeyPair}
     * @readonly
     * @private
     */
    this._keyPair = keyPair instanceof Uint8Array ? _tweetnacl.default.sign.keyPair.fromSeed(keyPair) : keyPair;

    /**
     * @type {?Uint8Array}
     * @readonly
     */
    this._chainCode = chainCode != null ? chainCode : null;
  }

  /**
   * @returns {string}
   */
  get _type() {
    return "ED25519";
  }

  /**
   * Generate a random Ed25519 private key.
   * @returns {Ed25519PrivateKey}
   */
  static generate() {
    // 32 bytes for the secret key
    // 32 bytes for the chain code (to support derivation)
    const entropy = random.bytes(64);
    return new Ed25519PrivateKey(_tweetnacl.default.sign.keyPair.fromSeed(entropy.subarray(0, 32)), entropy.subarray(32));
  }

  /**
   * Generate a random Ed25519 private key.
   * @returns {Promise<Ed25519PrivateKey>}
   */
  static async generateAsync() {
    // 32 bytes for the secret key
    // 32 bytes for the chain code (to support derivation)
    const entropy = await random.bytesAsync(64);
    return new Ed25519PrivateKey(_tweetnacl.default.sign.keyPair.fromSeed(entropy.subarray(0, 32)), entropy.subarray(32));
  }

  /**
   * Construct a private key from bytes.
   * @param {Uint8Array} data
   * @returns {Ed25519PrivateKey}
   */
  static fromBytes(data) {
    switch (data.length) {
      case 48:
        return Ed25519PrivateKey.fromBytesDer(data);
      case 32:
      case 64:
        return Ed25519PrivateKey.fromBytesRaw(data);
      default:
        throw new _BadKeyError.default(`invalid private key length: ${data.length} bytes`);
    }
  }

  /**
   * Construct a private key from bytes with DER header.
   * @param {Uint8Array} data
   * @returns {Ed25519PrivateKey}
   */
  static fromBytesDer(data) {
    /** * @type {Uint8Array} */
    let privateKey;
    try {
      const arr = new Uint8Array(data);
      const header = arr.subarray(0, data.length - 32);
      const isValidED25519 = header.every((byte, index) => {
        return derPrefixBytes[index] === byte;
      });
      if (!isValidED25519) {
        throw new _BadKeyError.default(`invalid DER prefix for ED25519 private key`);
      }
      privateKey = arr.slice(data.length - 32);
    } catch (error) {
      const message =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      error != null && /** @type {Error} */error.message != null ?
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      /** @type {Error} */
      error.message : "";
      throw new _BadKeyError.default(`cannot decode ED25519 private key data from DER format: ${message}`);
    }
    const keyPair = _tweetnacl.default.sign.keyPair.fromSeed(privateKey);
    return new Ed25519PrivateKey(keyPair);
  }

  /**
   * Construct a private key from bytes without DER header.
   * @param {Uint8Array} data
   * @returns {Ed25519PrivateKey}
   */
  static fromBytesRaw(data) {
    switch (data.length) {
      case 32:
        return new Ed25519PrivateKey(_tweetnacl.default.sign.keyPair.fromSeed(data));
      case 64:
        // priv + pub key
        return new Ed25519PrivateKey(_tweetnacl.default.sign.keyPair.fromSecretKey(data));
      default:
    }
    throw new _BadKeyError.default(`invalid private key length: ${data.length} bytes`);
  }

  /**
   * Construct a private key from a hex-encoded string.
   * @param {string} text
   * @returns {Ed25519PrivateKey}
   */
  static fromString(text) {
    return Ed25519PrivateKey.fromBytes(hex.decode(text));
  }

  /**
   * Construct a private key from a hex-encoded string.
   * @param {string} text
   * @returns {Ed25519PrivateKey}
   */
  static fromStringDer(text) {
    return Ed25519PrivateKey.fromBytesDer(hex.decode(text));
  }

  /**
   * Construct a private key from a hex-encoded string.
   * @param {string} text
   * @returns {Ed25519PrivateKey}
   */
  static fromStringRaw(text) {
    return Ed25519PrivateKey.fromBytesRaw(hex.decode(text));
  }

  /**
   * Construct a ED25519 private key from a Uint8Array seed.
   * @param {Uint8Array} seed
   * @returns {Promise<Ed25519PrivateKey>}
   */
  static async fromSeed(seed) {
    const {
      keyData,
      chainCode
    } = await slip10.fromSeed(seed);
    return new Ed25519PrivateKey(keyData, chainCode);
  }

  /**
   * Get the public key associated with this private key.
   *
   * The public key can be freely given and used by other parties to verify
   * the signatures generated by this private key.
   * @returns {Ed25519PublicKey}
   */
  get publicKey() {
    return new _Ed25519PublicKey.default(this._keyPair.publicKey);
  }

  /**
   * Sign a message with this private key.
   * @param {Uint8Array} bytes
   * @returns {Uint8Array} - The signature bytes without the message
   */
  sign(bytes) {
    return _tweetnacl.default.sign.detached(bytes, this._keyPair.secretKey);
  }

  /**
   * @returns {Uint8Array}
   */
  toBytesDer() {
    const bytes = new Uint8Array(derPrefixBytes.length + 32);
    const privateKey = this._keyPair.secretKey.subarray(0, 32);
    const leadingZeroes = 32 - privateKey.length;
    const privateKeyOffset = derPrefixBytes.length + leadingZeroes;
    bytes.set(derPrefixBytes, 0);
    bytes.set(privateKey, privateKeyOffset);
    return bytes;
  }

  /**
   * @returns {Uint8Array}
   */
  toBytesRaw() {
    // copy the bytes so they can't be modified accidentally
    return this._keyPair.secretKey.slice(0, 32);
  }
}
exports.default = Ed25519PrivateKey;