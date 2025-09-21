"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bytesToBits = bytesToBits;
exports.convertRadix = convertRadix;
exports.crc8 = crc8;
exports.legacy1 = legacy1;
exports.legacy2 = legacy2;
var _bignumber = _interopRequireDefault(require("bignumber.js"));
var sha256 = _interopRequireWildcard(require("../primitive/sha256.cjs"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * @param {string[]} words
 * @param {string[]} wordlist
 * @returns {[Uint8Array, number]}
 */
function legacy1(words, wordlist) {
  const indicies = words.map(word => wordlist.indexOf(word.toLowerCase()));
  const data = convertRadix(indicies, wordlist.length, 256, 33);
  const checksum = data[data.length - 1];
  const result = new Uint8Array(data.length - 1);
  for (let i = 0; i < data.length - 1; i += 1) {
    result[i] = data[i] ^ checksum;
  }
  return [result, checksum];
}

/**
 * @param {string[]} words
 * @param {string[]} wordlist
 * @returns {Promise<Uint8Array>}
 */
async function legacy2(words, wordlist) {
  const concatBitsLen = words.length * 11;
  /** @type {boolean[]} */
  const concatBits = [];
  concatBits.fill(false, 0, concatBitsLen);
  for (const [wordIndex, word] of words.entries()) {
    const index = wordlist.indexOf(word.toLowerCase());
    if (index < 0) {
      throw new Error(`Word not found in wordlist: ${word}`);
    }
    for (let i = 0; i < 11; i += 1) {
      concatBits[wordIndex * 11 + i] = (index & 1 << 10 - i) !== 0;
    }
  }
  const checksumBitsLen = concatBitsLen / 33;
  const entropyBitsLen = concatBitsLen - checksumBitsLen;
  const entropy = new Uint8Array(entropyBitsLen / 8);
  for (let i = 0; i < entropy.length; i += 1) {
    for (let j = 0; j < 8; j += 1) {
      if (concatBits[i * 8 + j]) {
        entropy[i] |= 1 << 7 - j;
      }
    }
  }

  // Checksum validation
  const hash = await sha256.digest(entropy);
  const hashBits = bytesToBits(hash);
  for (let i = 0; i < checksumBitsLen; i += 1) {
    if (concatBits[entropyBitsLen + i] !== hashBits[i]) {
      throw new Error("Checksum mismatch");
    }
  }
  return entropy;
}

/**
 * @param {Uint8Array} data
 * @returns {number}
 */
function crc8(data) {
  let crc = 0xff;
  for (let i = 0; i < data.length - 1; i += 1) {
    crc ^= data[i];
    for (let j = 0; j < 8; j += 1) {
      crc = crc >>> 1 ^ ((crc & 1) === 0 ? 0 : 0xb2);
    }
  }
  return crc ^ 0xff;
}

/**
 * @param {number[]} nums
 * @param {number} fromRadix
 * @param {number} toRadix
 * @param {number} toLength
 * @returns {Uint8Array}
 */
function convertRadix(nums, fromRadix, toRadix, toLength) {
  let num = new _bignumber.default(0);
  for (const element of nums) {
    num = num.times(fromRadix);
    num = num.plus(element);
  }
  const result = new Uint8Array(toLength);
  for (let i = toLength - 1; i >= 0; i -= 1) {
    const tem = num.dividedToIntegerBy(toRadix);
    const rem = num.modulo(toRadix);
    num = tem;
    result[i] = rem.toNumber();
  }
  return result;
}

/**
 * @param {Uint8Array} data
 * @returns {boolean[]}
 */
function bytesToBits(data) {
  /** @type {boolean[]} */
  const bits = [];
  bits.fill(false, 0, data.length * 8);
  for (let i = 0; i < data.length; i += 1) {
    for (let j = 0; j < 8; j += 1) {
      bits[i * 8 + j] = (data[i] & 1 << 7 - j) !== 0;
    }
  }
  return bits;
}