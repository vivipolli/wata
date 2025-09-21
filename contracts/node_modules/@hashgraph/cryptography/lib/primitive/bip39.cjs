"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toSeed = toSeed;
var hmac = _interopRequireWildcard(require("../primitive/hmac.cjs"));
var pbkdf2 = _interopRequireWildcard(require("./pbkdf2.cjs"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * @param {string[]} words
 * @param {string} passphrase
 * @returns {Promise<Uint8Array>}
 */
async function toSeed(words, passphrase) {
  const input = words.join(" ");
  const salt = `mnemonic${passphrase}`.normalize("NFKD");
  return pbkdf2.deriveKey(hmac.HashAlgorithm.Sha512, input, salt, 2048, 64);
}