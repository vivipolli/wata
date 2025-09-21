"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.equalBytes = equalBytes;
/**
 * Byte comparison utility
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {boolean}
 */
function equalBytes(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}