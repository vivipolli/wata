"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HashAlgorithm = void 0;
exports.hash = hash;
var utf8 = _interopRequireWildcard(require("../encoding/utf8.cjs"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
// this will be executed in browser environment so we can use window.crypto
/* eslint-disable n/no-unsupported-features/node-builtins */

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
async function hash(algorithm, secretKey, data) {
  const key = typeof secretKey === "string" ? utf8.encode(secretKey) : secretKey;
  const value = typeof data === "string" ? utf8.encode(data) : data;
  try {
    const key_ = await window.crypto.subtle.importKey("raw", key, {
      name: "HMAC",
      hash: algorithm
    }, false, ["sign"]);
    return new Uint8Array(await window.crypto.subtle.sign("HMAC", key_, value));
  } catch {
    throw new Error("Fallback if SubtleCrypto fails is not implemented");
  }
}