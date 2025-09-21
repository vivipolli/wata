"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decode = decode;
exports.encode = encode;
// SPDX-License-Identifier: Apache-2.0

/**
 * @param {Uint8Array} data
 * @returns {string}
 */
function decode(data) {
  return Buffer.from(data).toString("utf8");
}

/**
 * @param {string} text
 * @returns {Uint8Array}
 */
function encode(text) {
  return Buffer.from(text, "utf8");
}