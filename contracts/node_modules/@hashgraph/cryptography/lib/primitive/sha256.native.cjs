"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.digest = digest;
var _cryptoJs = _interopRequireDefault(require("crypto-js"));
var hex = _interopRequireWildcard(require("../encoding/hex.cjs"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * @param {Uint8Array} data
 * @returns {Promise<Uint8Array>}
 */
// eslint-disable-next-line @typescript-eslint/require-await
async function digest(data) {
  return Promise.resolve(hex.decode(_cryptoJs.default.SHA256(_cryptoJs.default.enc.Hex.parse(hex.encode(data))).toString(_cryptoJs.default.enc.Hex)));
}