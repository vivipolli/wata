"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CipherAlgorithm = void 0;
exports.createCipheriv = createCipheriv;
exports.createDecipheriv = createDecipheriv;
exports.messageDigest = messageDigest;
var _cryptoJs = _interopRequireDefault(require("crypto-js"));
var hex = _interopRequireWildcard(require("../encoding/hex.cjs"));
var utf8 = _interopRequireWildcard(require("../encoding/utf8.cjs"));
var _sparkMd = _interopRequireDefault(require("spark-md5"));
var _buffer = require("buffer");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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
function createCipheriv(algorithm, key, iv, data) {
  let mode;
  switch (algorithm.toUpperCase()) {
    case CipherAlgorithm.Aes128Cbc:
      mode = _cryptoJs.default.mode.CBC;
      break;
    case CipherAlgorithm.Aes128Ctr:
      mode = _cryptoJs.default.mode.CTR;
      break;
    default:
      throw new Error("(BUG) non-exhaustive switch statement");
  }
  const data_ = _cryptoJs.default.enc.Hex.parse(hex.encode(data));
  const key_ = _cryptoJs.default.enc.Hex.parse(hex.encode(key.slice(0, 16)));
  const cfg_ = {
    iv: _cryptoJs.default.enc.Hex.parse(hex.encode(iv)),
    mode
  };
  return Promise.resolve(hex.decode(_cryptoJs.default.AES.encrypt(data_, key_, cfg_).toString(_cryptoJs.default.format.Hex)));
}

/**
 * @param {string} algorithm
 * @param {Uint8Array} key
 * @param {Uint8Array} iv
 * @param {Uint8Array} data
 * @returns {Promise<Uint8Array>}
 */
function createDecipheriv(algorithm, key, iv, data) {
  let mode;
  switch (algorithm) {
    case CipherAlgorithm.Aes128Cbc:
      mode = _cryptoJs.default.mode.CBC;
      break;
    case CipherAlgorithm.Aes128Ctr:
      mode = _cryptoJs.default.mode.CTR;
      break;
    default:
      throw new Error("(BUG) non-exhaustive switch statement");
  }
  const key_ = _cryptoJs.default.enc.Hex.parse(hex.encode(key.slice(0, 16)));
  const iv_ = _cryptoJs.default.enc.Hex.parse(hex.encode(iv));
  const params = _cryptoJs.default.lib.CipherParams.create({
    ciphertext: _cryptoJs.default.enc.Hex.parse(hex.encode(data)),
    iv: iv_,
    key: key_,
    algorithm: _cryptoJs.default.algo.AES,
    blockSize: 4
  });
  return Promise.resolve(hex.decode(_cryptoJs.default.AES.decrypt(params, key_, {
    iv: iv_,
    mode
  }).toString(_cryptoJs.default.enc.Hex)));
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