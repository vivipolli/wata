"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.derive = derive;
exports.fromSeed = fromSeed;
var hmac = _interopRequireWildcard(require("../primitive/hmac.cjs"));
var bip32 = _interopRequireWildcard(require("../primitive/bip32.cjs"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * @param {Uint8Array} parentKey
 * @param {Uint8Array} chainCode
 * @param {number} index
 * @returns {Promise<{ keyData: Uint8Array; chainCode: Uint8Array }>}
 */
async function derive(parentKey, chainCode, index) {
  if (bip32.isHardenedIndex(index)) {
    throw new Error("the index should not be pre-hardened");
  }
  const input = new Uint8Array(37);

  // 0x00 + parentKey + index(BE)
  input[0] = 0;
  input.set(parentKey, 1);
  new DataView(input.buffer, input.byteOffset, input.byteLength).setUint32(33, index, false);

  // set the index to hardened
  input[33] |= 128;
  const digest = await hmac.hash(hmac.HashAlgorithm.Sha512, chainCode, input);
  return {
    keyData: digest.subarray(0, 32),
    chainCode: digest.subarray(32)
  };
}

/**
 * @param {Uint8Array} seed
 * @returns {Promise<{ keyData: Uint8Array; chainCode: Uint8Array }>}
 */
async function fromSeed(seed) {
  const digest = await hmac.hash(hmac.HashAlgorithm.Sha512, "ed25519 seed", seed);
  return {
    keyData: digest.subarray(0, 32),
    chainCode: digest.subarray(32)
  };
}