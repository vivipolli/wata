"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Key = _interopRequireDefault(require("./Key.cjs"));
var hex = _interopRequireWildcard(require("./encoding/hex.cjs"));
var _util = require("./util.cjs");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IKey} HieroProto.proto.IKey
 */

/**
 * @typedef {import("./client/Client.js").default<*, *>} Client
 */

/**
 *  Represents an Ethereum Virtual Machine (EVM) address.
 * This class extends the Key class and provides functionality for handling EVM addresses.
 */
class EvmAddress extends _Key.default {
  /**
   * @internal
   * @param {Uint8Array} bytes
   */
  constructor(bytes) {
    super();
    this._bytes = bytes;
  }

  /**
   * Creates an EvmAddress from a hex string representation.
   * @param {string} evmAddress - The hex string representing the EVM address
   * @returns {EvmAddress}
   * @throws {Error} If the input string is not the correct size
   */
  static fromString(evmAddress) {
    evmAddress = evmAddress.startsWith("0x") ? evmAddress.slice(2) : evmAddress;

    // Standard EVM address is 20 bytes which is 40 hex characters
    if (evmAddress.length !== 40) {
      throw new Error("Input EVM address string is not the correct size");
    }
    return new EvmAddress(hex.decode(evmAddress));
  }

  /**
   * @param {Uint8Array} bytes
   * @returns {EvmAddress}
   */
  static fromBytes(bytes) {
    return new EvmAddress(bytes);
  }

  /**
   * @returns {Uint8Array}
   */
  toBytes() {
    return this._bytes;
  }

  /**
   * @returns {string}
   */
  toString() {
    return hex.encode(this._bytes);
  }

  /**
   * @param {EvmAddress} other
   * @returns {boolean}
   */
  equals(other) {
    return (0, _util.arrayEqual)(this._bytes, other._bytes);
  }
}
exports.default = EvmAddress;