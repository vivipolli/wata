"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CipherAlgorithm = void 0;
exports.createCipheriv = createCipheriv;
exports.createDecipheriv = createDecipheriv;
exports.messageDigest = messageDigest;
var _crypto = _interopRequireDefault(require("crypto"));
var hex = _interopRequireWildcard(require("../encoding/hex.cjs"));
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
  const cipher = _crypto.default.createCipheriv(algorithm, key.slice(0, 16), iv);
  return Promise.resolve(Buffer.concat([cipher.update(data), cipher["final"]()]));
}

/**
 * @param {string} algorithm
 * @param {Uint8Array} key
 * @param {Uint8Array} iv
 * @param {Uint8Array} data
 * @returns {Promise<Uint8Array>}
 */
function createDecipheriv(algorithm, key, iv, data) {
  const decipher = _crypto.default.createDecipheriv(algorithm, key.slice(0, 16), iv);
  return Promise.resolve(Buffer.concat([decipher.update(data), decipher["final"]()]));
}

/**
 * @param {string} passphrase
 * @param {string} iv
 * @returns {Promise<Uint8Array>}
 */
function messageDigest(passphrase, iv) {
  return Promise.resolve(_crypto.default.createHash("md5").update(passphrase).update(hex.decode(iv).slice(0, 8)).digest());
}