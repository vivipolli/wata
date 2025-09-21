"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.derive = derive;
exports.fromSeed = fromSeed;
exports.isHardenedIndex = isHardenedIndex;
exports.toHardenedIndex = toHardenedIndex;
var hmac = _interopRequireWildcard(require("./hmac.cjs"));
var _secp256k = require("@noble/curves/secp256k1");
var _utils = require("@noble/curves/abstract/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const N = _secp256k.secp256k1.CURVE.n;
const HARDENED_BIT = 0x80000000;

/**
 * Mostly copied from https://github.com/bitcoinjs/bip32/blob/master/ts-src/bip32.ts
 * We cannot use that library directly because it uses `Buffer` and we want to avoid
 * polyfills as much as possible. Also, we only need the `derive` function.
 * @param {Uint8Array} parentKey
 * @param {Uint8Array} chainCode
 * @param {number} index
 * @returns {Promise<{ keyData: Uint8Array; chainCode: Uint8Array }>}
 */
async function derive(parentKey, chainCode, index) {
  const isHardened = isHardenedIndex(index);
  const data = new Uint8Array(37);
  const publicKey = _secp256k.secp256k1.getPublicKey(parentKey, true);

  // Hardened child
  if (isHardened) {
    // data = 0x00 || ser256(kpar) || ser32(index)
    data[0] = 0x00;
    data.set(parentKey, 1);

    // Normal child
  } else {
    // data = serP(point(kpar)) || ser32(index)
    //      = serP(Kpar) || ser32(index)
    data.set(publicKey, 0);
  }
  new DataView(data.buffer, data.byteOffset, data.byteLength).setUint32(33, index, false);
  const I = await hmac.hash(hmac.HashAlgorithm.Sha512, chainCode, data);
  const IL = I.subarray(0, 32);
  const IR = I.subarray(32);

  // if parse256(IL) >= n, proceed with the next value for i
  try {
    // ki = parse256(IL) + kpar (mod n)
    const parentKeyBigInt = (0, _utils.bytesToNumberBE)(parentKey);
    const ILBigInt = (0, _utils.bytesToNumberBE)(IL);

    // Add private keys mod N
    const ki = (parentKeyBigInt + ILBigInt) % N;

    // In case ki == 0, proceed with the next value for i
    if (ki === 0n) {
      return derive(parentKey, chainCode, index + 1);
    }
    const keyData = (0, _utils.numberToBytesBE)(ki, 32);
    return {
      keyData,
      chainCode: IR
    };
  } catch {
    return derive(parentKey, chainCode, index + 1);
  }
}

/**
 * @param {Uint8Array} seed
 * @returns {Promise<{ keyData: Uint8Array; chainCode: Uint8Array }>}
 */
async function fromSeed(seed) {
  if (seed.length < 16) throw new TypeError("Seed should be at least 128 bits");
  if (seed.length > 64) throw new TypeError("Seed should be at most 512 bits");
  const I = await hmac.hash(hmac.HashAlgorithm.Sha512, "Bitcoin seed", seed);
  const IL = I.subarray(0, 32);
  const IR = I.subarray(32);
  return {
    keyData: IL,
    chainCode: IR
  };
}

/**
 * Harden the index
 * @param {number} index         the derivation index
 * @returns {number}              the hardened index
 */
function toHardenedIndex(index) {
  return index | HARDENED_BIT;
}

/**
 * Check if the index is hardened
 * @param {number} index         the derivation index
 * @returns {boolean}            true if the index is hardened
 */
function isHardenedIndex(index) {
  return (index & HARDENED_BIT) !== 0;
}