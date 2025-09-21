"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bytes = bytes;
exports.bytesAsync = bytesAsync;
var _tweetnacl = _interopRequireDefault(require("tweetnacl"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * @param {number} count
 * @returns {Uint8Array}
 */
function bytes(count) {
  return _tweetnacl.default.randomBytes(count);
}

/**
 * @param {number} count
 * @returns {Promise<Uint8Array>}
 */
function bytesAsync(count) {
  return Promise.resolve(_tweetnacl.default.randomBytes(count));
}