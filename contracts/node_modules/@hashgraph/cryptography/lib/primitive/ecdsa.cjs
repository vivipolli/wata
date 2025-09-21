"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fromBytes = fromBytes;
exports.generate = generate;
exports.generateAsync = generateAsync;
exports.getFullPublicKey = getFullPublicKey;
exports.getRecoveryId = getRecoveryId;
exports.sign = sign;
exports.verify = verify;
var _keccak = require("./keccak.cjs");
var hex = _interopRequireWildcard(require("../encoding/hex.cjs"));
var _secp256k = require("@noble/curves/secp256k1");
var _utils = require("./utils.cjs");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * @typedef {import("../EcdsaPrivateKey.js").KeyPair} KeyPair
 */

/**
 * @returns {KeyPair}
 */
function generate() {
  const privateKey = _secp256k.secp256k1.utils.randomPrivateKey();
  const publicKey = _secp256k.secp256k1.getPublicKey(privateKey, true);
  return {
    privateKey,
    publicKey
  };
}

/**
 * @returns {Promise<KeyPair>}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateAsync() {
  return Promise.resolve(generate());
}

/**
 * @param {Uint8Array} data
 * @returns {KeyPair}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function fromBytes(data) {
  const privateKey = new Uint8Array(data);
  const publicKey = _secp256k.secp256k1.getPublicKey(privateKey, true);
  return {
    privateKey: privateKey,
    publicKey: publicKey
  };
}

/**
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getFullPublicKey(data) {
  return _secp256k.secp256k1.getPublicKey(data, false);
}

/**
 * @param {Uint8Array} keydata
 * @param {Uint8Array} message
 * @returns {Uint8Array}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function sign(keydata, message) {
  const msg = hex.encode(message);
  const data = hex.decode((0, _keccak.keccak256)(`0x${msg}`));
  const signature = _secp256k.secp256k1.sign(data, keydata);
  return signature.toCompactRawBytes();
}

/**
 * @param {Uint8Array} keydata
 * @param {Uint8Array} message
 * @param {Uint8Array} signature
 * @returns {boolean}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function verify(keydata, message, signature) {
  const msg = hex.encode(message);
  const data = hex.decode((0, _keccak.keccak256)(`0x${msg}`));
  const r = BigInt("0x" + hex.encode(signature.subarray(0, 32)));
  const s = BigInt("0x" + hex.encode(signature.subarray(32, 64)));
  return _secp256k.secp256k1.verify({
    r,
    s
  }, data, keydata);
}

/**
 * @param {Uint8Array} privateKey
 * @param {Uint8Array} signature - 64-byte compact signature (r || s)
 * @param {Uint8Array} message - Original message (not hashed)
 * @returns {number} Recovery ID (0–3), or -1
 */
function getRecoveryId(privateKey, signature, message) {
  const expectedPubKey = _secp256k.secp256k1.getPublicKey(privateKey, false);
  const hash = hex.decode((0, _keccak.keccak256)(`0x${hex.encode(message)}`));
  for (let recovery = 0; recovery < 4; recovery++) {
    try {
      const sig = _secp256k.secp256k1.Signature.fromCompact(signature).addRecoveryBit(recovery);
      const recovered = sig.recoverPublicKey(hash).toRawBytes(false);
      if ((0, _utils.equalBytes)(recovered, expectedPubKey)) {
        return recovery;
      }
    } catch {
      // Ignore invalid recoveries
    }
  }
  throw new Error("Unexpected error: could not construct a recoverable key.");
}