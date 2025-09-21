"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var HieroProto = _interopRequireWildcard(require("@hashgraph/proto"));
var _TokenId = _interopRequireDefault(require("../token/TokenId.cjs"));
var _long = _interopRequireDefault(require("long"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
// SPDX-License-Identifier: Apache-2.0

/**
 * The ID for a crypto-currency token on Hedera.
 *
 * @augments {EntityId<HieroProto.proto.INftID>}
 */
class NftId {
  /**
   * @param {TokenId} token
   * @param {number | Long} serial
   */
  constructor(token, serial) {
    this.tokenId = token;
    this.serial = typeof serial === "number" ? _long.default.fromNumber(serial) : serial;
    Object.freeze(this);
  }

  /**
   * @param {string} text
   * @returns {NftId}
   */
  static fromString(text) {
    const strings = text.split("/").length > 1 ? text.split("/") : text.split("@");
    for (const string of strings) {
      if (string === "") {
        throw new Error("invalid format for NftId: use [token]/[serial] or [token]@[serial]");
      }
    }
    const token = _TokenId.default.fromString(strings[0]);
    const serial = _long.default.fromString(strings[1]);
    return new NftId(token, serial);
  }

  /**
   * @internal
   * @param {HieroProto.proto.INftID} id
   * @returns {NftId}
   */
  static _fromProtobuf(id) {
    return new NftId(_TokenId.default._fromProtobuf(/** @type {HieroProto.proto.ITokenID} */id.token_ID), id.serialNumber != null ? id.serialNumber : _long.default.ZERO);
  }

  /**
   * @param {Uint8Array} bytes
   * @returns {NftId}
   */
  static fromBytes(bytes) {
    return NftId._fromProtobuf(HieroProto.proto.NftID.decode(bytes));
  }

  /**
   * @internal
   * @returns {HieroProto.proto.INftID}
   */
  _toProtobuf() {
    return {
      token_ID: this.tokenId._toProtobuf(),
      serialNumber: _long.default.fromValue(this.serial !== undefined ? this.serial : 0)
    };
  }

  /**
   * @returns {string}
   */
  toString() {
    return `${this.tokenId.toString()}/${this.serial.toString()}`;
  }

  /**
   * @returns {Uint8Array}
   */
  toBytes() {
    return HieroProto.proto.NftID.encode(this._toProtobuf()).finish();
  }
}
exports.default = NftId;