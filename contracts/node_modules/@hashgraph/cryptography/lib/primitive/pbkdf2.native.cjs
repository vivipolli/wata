"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deriveKey = deriveKey;
var _hmac = require("./hmac.cjs");
var utf8 = _interopRequireWildcard(require("../encoding/utf8.cjs"));
var hex = _interopRequireWildcard(require("../encoding/hex.cjs"));
var _cryptoJs = _interopRequireDefault(require("crypto-js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * @param {HashAlgorithm} algorithm
 * @param {Uint8Array | string} password
 * @param {Uint8Array | string} salt
 * @param {number} iterations
 * @param {number} length
 * @returns {Promise<Uint8Array>}
 */
async function deriveKey(algorithm, password, salt, iterations, length) {
  const pass = typeof password === "string" ?
  // Valid ASCII is also valid UTF-8 so encoding the password as UTF-8
  // should be fine if only valid ASCII characters are used in the password
  utf8.encode(password) : password;
  const nacl = typeof salt === "string" ? utf8.encode(salt) : salt;
  const password_ = _cryptoJs.default.enc.Hex.parse(hex.encode(pass));
  const nacl_ = _cryptoJs.default.enc.Hex.parse(hex.encode(nacl));
  let hasher;
  switch (algorithm) {
    case _hmac.HashAlgorithm.Sha256:
      hasher = _cryptoJs.default.algo.SHA256;
      break;
    case _hmac.HashAlgorithm.Sha384:
      hasher = _cryptoJs.default.algo.SHA384;
      break;
    case _hmac.HashAlgorithm.Sha512:
      hasher = _cryptoJs.default.algo.SHA512;
      break;
    default:
      throw new Error("(BUG) Non-Exhaustive switch statement for algorithms");
  }
  const cfg = {
    keySize: length / 4,
    hasher,
    iterations
  };
  return Promise.resolve(hex.decode(_cryptoJs.default.PBKDF2(password_, nacl_, cfg).toString(_cryptoJs.default.enc.Hex)));
}