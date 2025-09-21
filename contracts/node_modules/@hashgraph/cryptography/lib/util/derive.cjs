"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.legacy = legacy;
var pbkdf2 = _interopRequireWildcard(require("../primitive/pbkdf2.cjs"));
var hmac = _interopRequireWildcard(require("../primitive/hmac.cjs"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * @param {Uint8Array} seed
 * @param {number} index
 * @returns {Promise<Uint8Array>}
 */
function legacy(seed, index) {
  const password = new Uint8Array(seed.length + 8);
  password.set(seed, 0);
  const view = new DataView(password.buffer, password.byteOffset, password.byteLength);
  if (index === 0xffffffffff) {
    view.setInt32(seed.length + 0, 0xff);
    view.setInt32(seed.length + 4, -1); // 0xffffffff
  } else {
    view.setInt32(seed.length + 0, index < 0 ? -1 : 0);
    view.setInt32(seed.length + 4, index);
  }
  const salt = Uint8Array.from([0xff]);
  return pbkdf2.deriveKey(hmac.HashAlgorithm.Sha512, password, salt, 2048, 32);
}