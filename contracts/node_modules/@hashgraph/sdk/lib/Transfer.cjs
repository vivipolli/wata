"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _AccountId = _interopRequireDefault(require("./account/AccountId.cjs"));
var _Hbar = _interopRequireDefault(require("./Hbar.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @typedef {object} TransferJSON
 * @property {string} accountId
 * @property {string} amount
 * @property {boolean} isApproved
 */

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IAccountAmount} HieroProto.proto.IAccountAmount
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 */

/**
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("long")} Long
 */

/**
 * An account, and the amount that it sends or receives during a cryptocurrency transfer.
 */
class Transfer {
  /**
   * @internal
   * @param {object} props
   * @param {AccountId | string} props.accountId
   * @param {number | string | Long | BigNumber | Hbar} props.amount
   * @param {boolean} props.isApproved
   */
  constructor(props) {
    /**
     * The Account ID that sends or receives cryptocurrency.
     *
     * @readonly
     */
    this.accountId = props.accountId instanceof _AccountId.default ? props.accountId : _AccountId.default.fromString(props.accountId);

    /**
     * The amount of tinybars that the account sends(negative) or receives(positive).
     */
    this.amount = props.amount instanceof _Hbar.default ? props.amount : new _Hbar.default(props.amount);
    this.isApproved = props.isApproved;
  }

  /**
   * @internal
   * @param {HieroProto.proto.IAccountAmount[]} accountAmounts
   * @returns {Transfer[]}
   */
  static _fromProtobuf(accountAmounts) {
    const transfers = [];
    for (const transfer of accountAmounts) {
      transfers.push(new Transfer({
        accountId: _AccountId.default._fromProtobuf(/** @type {HieroProto.proto.IAccountID} */
        transfer.accountID),
        amount: _Hbar.default.fromTinybars(transfer.amount != null ? transfer.amount : 0),
        isApproved: (/** @type {boolean} */transfer.isApproval)
      }));
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
      amount: this.amount.toTinybars(),
      isApproval: this.isApproved
    };
  }

  /**
   * @returns {TransferJSON}
   */
  toJSON() {
    return {
      accountId: this.accountId.toString(),
      amount: this.amount.toTinybars().toString(),
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
exports.default = Transfer;