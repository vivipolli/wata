"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HashAlgorithm = void 0;
exports.hash = hash;
var _crypto = _interopRequireDefault(require("crypto"));
var utf8 = _interopRequireWildcard(require("../encoding/utf8.cjs"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * @enum {string}
 */
const HashAlgorithm = exports.HashAlgorithm = {
  Sha256: "SHA-256",
  Sha384: "SHA-384",
  Sha512: "SHA-512"
};

/**
 * @param {HashAlgorithm} algorithm
 * @param {Uint8Array | string} secretKey
 * @param {Uint8Array | string} data
 * @returns {Promise<Uint8Array>}
 */
function hash(algorithm, secretKey, data) {
  const key = typeof secretKey === "string" ? utf8.encode(secretKey) : secretKey;
  const value = typeof data === "string" ? utf8.encode(data) : data;
  switch (algorithm) {
    case HashAlgorithm.Sha256:
      return Promise.resolve(_crypto.default.createHmac("SHA256", key).update(value).digest());
    case HashAlgorithm.Sha384:
      return Promise.resolve(_crypto.default.createHmac("SHA384", key).update(value).digest());
    case HashAlgorithm.Sha512:
      return Promise.resolve(_crypto.default.createHmac("SHA512", key).update(value).digest());
    default:
      throw new Error("(BUG) Non-Exhaustive switch statement for algorithms");
  }
}