"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CipherAlgorithm = void 0;
exports.createCipheriv = createCipheriv;
exports.createDecipheriv = createDecipheriv;
exports.messageDigest = messageDigest;
var hex = _interopRequireWildcard(require("../encoding/hex.cjs"));
var utf8 = _interopRequireWildcard(require("../encoding/utf8.cjs"));
var _sparkMd = _interopRequireDefault(require("spark-md5"));
var _buffer = require("buffer");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
// this will be executed in browser environment so we can use window.crypto
/* eslint-disable n/no-unsupported-features/node-builtins */

const CipherAlgorithm = exports.CipherAlgorithm = {
  Aes128Ctr: "AES-128-CTR",
  Aes128Cbc: "AES-128-CBC"
};

/**
 * @param {string} algorithm
 * @param {Uint8Array} key
 * @param {Uint8Array} iv
 * @param {Uint8Array} data
 * @returns {Promise<Uint8Array>}
 */
async function createCipheriv(algorithm, key, iv, data) {
  let algorithm_;
  switch (algorithm.toUpperCase()) {
    case CipherAlgorithm.Aes128Ctr:
      algorithm_ = {
        name: "AES-CTR",
        counter: iv,
        length: 128
      };
      break;
    case CipherAlgorithm.Aes128Cbc:
      algorithm_ = {
        name: "AES-CBC",
        iv: iv
      };
      break;
    default:
      throw new Error("(BUG) non-exhaustive switch statement for CipherAlgorithm");
  }
  const key_ = await window.crypto.subtle.importKey("raw", key, algorithm_.name, false, ["encrypt"]);
  return new Uint8Array(
  // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#return_value
  /** @type {ArrayBuffer} */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  await window.crypto.subtle.encrypt(algorithm_, key_, data));
}

/**
 * @param {string} algorithm
 * @param {Uint8Array} key
 * @param {Uint8Array} iv
 * @param {Uint8Array} data
 * @returns {Promise<Uint8Array>}
 */
async function createDecipheriv(algorithm, key, iv, data) {
  let algorithm_;
  switch (algorithm.toUpperCase()) {
    case CipherAlgorithm.Aes128Ctr:
      algorithm_ = {
        name: "AES-CTR",
        counter: iv,
        length: 128
      };
      break;
    case CipherAlgorithm.Aes128Cbc:
      algorithm_ = {
        name: "AES-CBC",
        iv
      };
      break;
    default:
      throw new Error("(BUG) non-exhaustive switch statement for CipherAlgorithm");
  }
  const key_ = await window.crypto.subtle.importKey("raw", key, algorithm_.name, false, ["decrypt"]);
  let decrypted;
  try {
    decrypted = await window.crypto.subtle.decrypt(algorithm_, key_, data);
  } catch (error) {
    const message =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    error != null && /** @type {Error} */error.message != null ?
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    /** @type {Error} */
    error.message : "";
    throw new Error(`Unable to decrypt: ${message}`);
  }
  return new Uint8Array(
  // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#return_value
  /** @type {ArrayBuffer} */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  decrypted);
}

/**
 * @param {string} passphrase
 * @param {string} iv
 * @returns {Promise<Uint8Array>}
 */
async function messageDigest(passphrase, iv) {
  const pass = utf8.encode(passphrase);
  const sliced = hex.decode(iv).slice(0, 8);
  const result = _sparkMd.default.ArrayBuffer.hash(
  // @ts-ignore
  _buffer.Buffer.concat([_buffer.Buffer.from(pass), _buffer.Buffer.from(sliced)]));
  return Promise.resolve(hex.decode(result));
}