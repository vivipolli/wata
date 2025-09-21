"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _long = _interopRequireDefault(require("long"));
var _AccountId = _interopRequireDefault(require("../account/AccountId.cjs"));
var _TokenId = _interopRequireDefault(require("./TokenId.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenTransferList} HieroProto.proto.ITokenTransferList
 * @typedef {import("@hashgraph/proto").proto.IAccountAmount} HieroProto.proto.IAccountAmount
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HieroProto.proto.ITokenID
 */

/**
 * @typedef {import("bignumber.js").default} BigNumber
 */

/**
 * @typedef {object} TokenTransferJSON
 * @property {string} tokenId
 * @property {string} accountId
 * @property {?number} expectedDecimals
 * @property {string} amount
 * @property {boolean} isApproved
 */

/**
 * An account, and the amount that it sends or receives during a cryptocurrency tokentransfer.
 */
class TokenTransfer {
  /**
   * @internal
   * @param {object} props
   * @param {TokenId | string} props.tokenId
   * @param {AccountId | string} props.accountId
   * @param {number | null} props.expectedDecimals
   * @param {Long | number} props.amount
   * @param {boolean} props.isApproved
   */
  constructor(props) {
    /**
     * The Token ID that sends or receives cryptocurrency.
     *
     * @readonly
     */
    this.tokenId = props.tokenId instanceof _TokenId.default ? props.tokenId : _TokenId.default.fromString(props.tokenId);

    /**
     * The Account ID that sends or receives cryptocurrency.
     *
     * @readonly
     */
    this.accountId = props.accountId instanceof _AccountId.default ? props.accountId : _AccountId.default.fromString(props.accountId);
    this.expectedDecimals = props.expectedDecimals;
    this.amount = _long.default.fromValue(props.amount);
    this.isApproved = props.isApproved;
  }

  /**
   * @internal
   * @param {HieroProto.proto.ITokenTransferList[]} tokenTransfers
   * @returns {TokenTransfer[]}
   */
  static _fromProtobuf(tokenTransfers) {
    const transfers = [];
    for (const tokenTransfer of tokenTransfers) {
      const tokenId = _TokenId.default._fromProtobuf(/** @type {HieroProto.proto.ITokenID} */tokenTransfer.token);
      const expectedDecimals = tokenTransfer.expectedDecimals != null ? Object.hasOwn(tokenTransfer.expectedDecimals, "value") ? tokenTransfer.expectedDecimals.value : null : null;
      for (const transfer of tokenTransfer.transfers != null ? tokenTransfer.transfers : []) {
        transfers.push(new TokenTransfer({
          tokenId,
          accountId: _AccountId.default._fromProtobuf(/** @type {HieroProto.proto.IAccountID} */
          transfer.accountID),
          expectedDecimals: expectedDecimals || null,
          amount: transfer.amount != null ? transfer.amount : _long.default.ZERO,
          isApproved: transfer.isApproval == true
        }));
      }
    }
    return transfers;
  }

  /**
   * @internal
   * @returns {HieroProto.proto.IAccountAmount}
   */
  _toProtobuf() {
    return {
      accountID: this.accountId._toProtobuf(),
      amount: this.amount,
      isApproval: this.isApproved
    };
  }

  /**
   * @returns {TokenTransferJSON}
   */
  toJSON() {
    return {
      tokenId: this.tokenId.toString(),
      accountId: this.accountId.toString(),
      expectedDecimals: this.expectedDecimals,
      amount: this.amount.toString(),
      isApproved: this.isApproved
    };
  }

  /**
   * @returns {string}
   */
  toString() {
    return JSON.stringify(this.toJSON());
  }
}
exports.default = TokenTransfer;