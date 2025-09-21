"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _TokenId = _interopRequireDefault(require("./TokenId.cjs"));
var _AccountId = _interopRequireDefault(require("../account/AccountId.cjs"));
var _Transaction = _interopRequireWildcard(require("../transaction/Transaction.cjs"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.ITokenUnfreezeAccountTransactionBody} HieroProto.proto.ITokenUnfreezeAccountTransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HieroProto.proto.ITokenID
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

/**
 * Unfreeze a new Hedera™ crypto-currency token.
 */
class TokenUnfreezeTransaction extends _Transaction.default {
  /**
   * @param {object} [props]
   * @param {TokenId | string} [props.tokenId]
   * @param {AccountId | string} [props.accountId]
   */
  constructor(props = {}) {
    super();

    /**
     * @private
     * @type {?TokenId}
     */
    this._tokenId = null;

    /**
     * @private
     * @type {?AccountId}
     */
    this._accountId = null;
    if (props.tokenId != null) {
      this.setTokenId(props.tokenId);
    }
    if (props.accountId != null) {
      this.setAccountId(props.accountId);
    }
  }

  /**
   * @internal
   * @param {HieroProto.proto.ITransaction[]} transactions
   * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
   * @param {TransactionId[]} transactionIds
   * @param {AccountId[]} nodeIds
   * @param {HieroProto.proto.ITransactionBody[]} bodies
   * @returns {TokenUnfreezeTransaction}
   */
  static _fromProtobuf(transactions, signedTransactions, transactionIds, nodeIds, bodies) {
    const body = bodies[0];
    const unfreezeToken = /** @type {HieroProto.proto.ITokenUnfreezeAccountTransactionBody} */
    body.tokenUnfreeze;
    return _Transaction.default._fromProtobufTransactions(new TokenUnfreezeTransaction({
      tokenId: unfreezeToken.token != null ? _TokenId.default._fromProtobuf(unfreezeToken.token) : undefined,
      accountId: unfreezeToken.account != null ? _AccountId.default._fromProtobuf(unfreezeToken.account) : undefined
    }), transactions, signedTransactions, transactionIds, nodeIds, bodies);
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
    this._requireNotFrozen();
    this._tokenId = typeof tokenId === "string" ? _TokenId.default.fromString(tokenId) : tokenId.clone();
    return this;
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
    this._requireNotFrozen();
    this._accountId = typeof accountId === "string" ? _AccountId.default.fromString(accountId) : accountId.clone();
    return this;
  }

  /**
   * @param {Client} client
   */
  _validateChecksums(client) {
    if (this._tokenId != null) {
      this._tokenId.validateChecksum(client);
    }
    if (this._accountId != null) {
      this._accountId.validateChecksum(client);
    }
  }

  /**
   * @override
   * @internal
   * @param {Channel} channel
   * @param {HieroProto.proto.ITransaction} request
   * @returns {Promise<HieroProto.proto.ITransactionResponse>}
   */
  _execute(channel, request) {
    return channel.token.unfreezeTokenAccount(request);
  }

  /**
   * @override
   * @protected
   * @returns {NonNullable<HieroProto.proto.TransactionBody["data"]>}
   */
  _getTransactionDataCase() {
    return "tokenUnfreeze";
  }

  /**
   * @override
   * @protected
   * @returns {HieroProto.proto.ITokenUnfreezeAccountTransactionBody}
   */
  _makeTransactionData() {
    return {
      token: this._tokenId != null ? this._tokenId._toProtobuf() : null,
      account: this._accountId != null ? this._accountId._toProtobuf() : null
    };
  }

  /**
   * @returns {string}
   */
  _getLogId() {
    const timestamp = /** @type {import("../Timestamp.js").default} */
    this._transactionIds.current.validStart;
    return `TokenUnfreezeTransaction:${timestamp.toString()}`;
  }
}
exports.default = TokenUnfreezeTransaction;
_Transaction.TRANSACTION_REGISTRY.set("tokenUnfreeze",
// eslint-disable-next-line @typescript-eslint/unbound-method
TokenUnfreezeTransaction._fromProtobuf);