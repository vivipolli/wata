"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _AccountId = _interopRequireDefault(require("../account/AccountId.cjs"));
var _TokenId = _interopRequireDefault(require("../token/TokenId.cjs"));
var _Hbar = _interopRequireDefault(require("../Hbar.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenAssociation} HieroProto.proto.ITokenAssociation
 */

/**
 * @typedef {object} TokenAssociationJSON
 * @property {?string} accountId
 * @property {?string} tokenId
 */

class TokenAssociation {
  /**
   * @param {object} props
   * @param {AccountId | string} [props.accountId]
   * @param {TokenId | string} [props.tokenId]
   */
  constructor(props = {}) {
    /**
     * @type {?AccountId}
     */
    this._accountId = null;
    if (props.accountId != null) {
      this.setAccountId(props.accountId);
    }

    /**
     * @type {?TokenId}
     */
    this._tokenId = null;
    if (props.tokenId != null) {
      this.setTokenId(props.tokenId);
    }
    this._defaultMaxTransactionFee = new _Hbar.default(5);
  }

  /**
   * @returns {?AccountId}
   */
  get accountId() {
    return this._accountId;
  }

  /**
   * @param {AccountId | string} accountId
   * @returns {this}
   */
  setAccountId(accountId) {
    this._accountId = typeof accountId === "string" ? _AccountId.default.fromString(accountId) : accountId;
    return this;
  }

  /**
   * @returns {?TokenId}
   */
  get tokenId() {
    return this._tokenId;
  }

  /**
   * @param {TokenId | string} tokenId
   * @returns {this}
   */
  setTokenId(tokenId) {
    this._tokenId = typeof tokenId === "string" ? _TokenId.default.fromString(tokenId) : tokenId;
    return this;
  }

  /**
   * @internal
   * @abstract
   * @param {HieroProto.proto.ITokenAssociation} association
   * @returns {TokenAssociation}
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static _fromProtobuf(association) {
    return new TokenAssociation({
      accountId: association.accountId != null ? _AccountId.default._fromProtobuf(association.accountId) : undefined,
      tokenId: association.tokenId != null ? _TokenId.default._fromProtobuf(association.tokenId) : undefined
    });
  }

  /**
   * @internal
   * @abstract
   * @returns {HieroProto.proto.ITokenAssociation}
   */
  _toProtobuf() {
    return {
      accountId: this._accountId != null ? this._accountId._toProtobuf() : undefined,
      tokenId: this._tokenId != null ? this._tokenId._toProtobuf() : undefined
    };
  }

  /**
   * @returns {TokenAssociationJSON}
   */
  toJSON() {
    return {
      accountId: this._accountId?.toString() || null,
      tokenId: this._tokenId?.toString() || null
    };
  }
}
exports.default = TokenAssociation;