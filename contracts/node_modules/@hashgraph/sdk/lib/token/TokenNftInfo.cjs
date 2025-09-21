"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _NftId = _interopRequireDefault(require("./NftId.cjs"));
var _AccountId = _interopRequireDefault(require("../account/AccountId.cjs"));
var _Timestamp = _interopRequireDefault(require("../Timestamp.cjs"));
var hex = _interopRequireWildcard(require("../encoding/hex.cjs"));
var _LedgerId = _interopRequireDefault(require("../LedgerId.cjs"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.TokenFreezeStatus} HieroProto.proto.TokenFreezeStatus
 * @typedef {import("@hashgraph/proto").proto.TokenKycStatus} HieroProto.proto.TokenKycStatus
 * @typedef {import("@hashgraph/proto").proto.TokenPauseStatus} HieroProto.proto.TokenPauseStatus
 * @typedef {import("@hashgraph/proto").proto.ITokenNftInfo} HieroProto.proto.ITokenNftInfo
 * @typedef {import("@hashgraph/proto").proto.INftID} HieroProto.proto.INftID
 * @typedef {import("@hashgraph/proto").proto.ITimestamp} HieroProto.proto.ITimestamp
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HieroProto.proto.ITokenID
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 * @typedef {import("@hashgraph/proto").proto.IKey} HieroProto.proto.IKey
 * @typedef {import("@hashgraph/proto").proto.IDuration} HieroProto.proto.IDuration
 */

class TokenNftInfo {
  /**
   * @private
   * @param {object} props
   * @param {NftId} props.nftId
   * @param {AccountId} props.accountId
   * @param {Timestamp} props.creationTime
   * @param {Uint8Array | null} props.metadata
   * @param {LedgerId|null} props.ledgerId
   * @param {AccountId|null} props.spenderId
   */
  constructor(props) {
    /**
     * ID of the nft instance
     *
     * @readonly
     */
    this.nftId = props.nftId;

    /**
     * @readonly
     */
    this.accountId = props.accountId;

    /**
     * @readonly
     */
    this.creationTime = props.creationTime;

    /**
     * @readonly
     */
    this.metadata = props.metadata;
    this.ledgerId = props.ledgerId;
    this.spenderId = props.spenderId;
    Object.freeze(this);
  }

  /**
   * @internal
   * @param {HieroProto.proto.ITokenNftInfo} info
   * @returns {TokenNftInfo}
   */
  static _fromProtobuf(info) {
    return new TokenNftInfo({
      nftId: _NftId.default._fromProtobuf(/** @type {HieroProto.proto.INftID} */info.nftID),
      accountId: _AccountId.default._fromProtobuf(/** @type {HieroProto.proto.IAccountID} */info.accountID),
      creationTime: _Timestamp.default._fromProtobuf(/** @type {HieroProto.proto.ITimestamp} */info.creationTime),
      metadata: info.metadata !== undefined ? info.metadata : null,
      ledgerId: info.ledgerId != null ? _LedgerId.default.fromBytes(info.ledgerId) : null,
      spenderId: info.spenderId != null ? _AccountId.default._fromProtobuf(info.spenderId) : null
    });
  }

  /**
   * @returns {HieroProto.proto.ITokenNftInfo}
   */
  _toProtobuf() {
    return {
      nftID: this.nftId._toProtobuf(),
      accountID: this.accountId._toProtobuf(),
      creationTime: this.creationTime._toProtobuf(),
      metadata: this.metadata,
      ledgerId: this.ledgerId != null ? this.ledgerId.toBytes() : null,
      spenderId: this.spenderId != null ? this.spenderId._toProtobuf() : null
    };
  }

  /**
   * @typedef {object} TokenNftInfoJson
   * @property {string} nftId
   * @property {string} accountId
   * @property {string} creationTime
   * @property {string | null} metadata
   * @property {string | null} ledgerId
   * @property {string | null} spenderId
   * @returns {TokenNftInfoJson}
   */
  toJson() {
    return {
      nftId: this.nftId.toString(),
      accountId: this.accountId.toString(),
      creationTime: this.creationTime.toString(),
      metadata: this.metadata != null ? hex.encode(this.metadata) : null,
      ledgerId: this.ledgerId != null ? this.ledgerId.toString() : null,
      spenderId: this.spenderId != null ? this.spenderId.toString() : null
    };
  }

  /**
   * @returns {string}
   */
  toString() {
    return JSON.stringify(this.toJson());
  }
}
exports.default = TokenNftInfo;