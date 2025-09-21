"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _AccountId = _interopRequireDefault(require("./AccountId.cjs"));
var _Hbar = _interopRequireDefault(require("../Hbar.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IGrantedCryptoAllowance} HieroProto.proto.IGrantedCryptoAllowance
 * @typedef {import("@hashgraph/proto").proto.ICryptoAllowance} HieroProto.proto.ICryptoAllowance
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 */

/**
 * @typedef {import("long")} Long
 */

/**
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

/**
 * Represents an HBAR allowance granted to a spender account by an owner account.
 * This class manages the permissions for one account to spend HBAR on behalf of another account.
 */
class HbarAllowance {
  /**
   * @internal
   * @param {object} props
   * @param {AccountId | null} props.spenderAccountId
   * @param {AccountId | null} props.ownerAccountId
   * @param {Hbar | null} props.amount
   */
  constructor(props) {
    /**
     * The account ID of the hbar allowance spender.
     *
     * @readonly
     */
    this.spenderAccountId = props.spenderAccountId;

    /**
     * The account ID of the hbar allowance owner.
     *
     * @readonly
     */
    this.ownerAccountId = props.ownerAccountId;

    /**
     * The current balance of the spender's allowance in tinybars.
     *
     * @readonly
     */
    this.amount = props.amount;
    Object.freeze(this);
  }

  /**
   * @internal
   * @param {HieroProto.proto.ICryptoAllowance} allowance
   * @returns {HbarAllowance}
   */
  static _fromProtobuf(allowance) {
    return new HbarAllowance({
      spenderAccountId: _AccountId.default._fromProtobuf(/** @type {HieroProto.proto.IAccountID} */allowance.spender),
      ownerAccountId: allowance.owner != null ? _AccountId.default._fromProtobuf(/**@type {HieroProto.proto.IAccountID}*/
      allowance.owner) : null,
      amount: _Hbar.default.fromTinybars(allowance.amount != null ? allowance.amount : 0)
    });
  }

  /**
   * @internal
   * @param {HieroProto.proto.IGrantedCryptoAllowance} allowance
   * @param {AccountId} ownerAccountId
   * @returns {HbarAllowance}
   */
  static _fromGrantedProtobuf(allowance, ownerAccountId) {
    return new HbarAllowance({
      spenderAccountId: _AccountId.default._fromProtobuf(/** @type {HieroProto.proto.IAccountID} */allowance.spender),
      ownerAccountId,
      amount: _Hbar.default.fromTinybars(allowance.amount != null ? allowance.amount : 0)
    });
  }

  /**
   * @internal
   * @returns {HieroProto.proto.ICryptoAllowance}
   */
  _toProtobuf() {
    return {
      owner: this.ownerAccountId != null ? this.ownerAccountId._toProtobuf() : null,
      spender: this.spenderAccountId != null ? this.spenderAccountId._toProtobuf() : null,
      amount: this.amount != null ? this.amount.toTinybars() : null
    };
  }

  /**
   * @param {Client} client
   */
  _validateChecksums(client) {
    if (this.spenderAccountId != null) {
      this.spenderAccountId.validateChecksum(client);
    }
    if (this.spenderAccountId != null) {
      this.spenderAccountId.validateChecksum(client);
    }
  }

  /**
   * @returns {object}
   */
  toJSON() {
    return {
      ownerAccountId: this.ownerAccountId != null ? this.ownerAccountId.toString() : null,
      spenderAccountId: this.spenderAccountId != null ? this.spenderAccountId.toString() : null,
      amount: this.amount != null ? this.amount.toString() : null
    };
  }
}
exports.default = HbarAllowance;