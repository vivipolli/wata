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
 * @typedef {import("@hashgraph/proto").proto.ITokenGrantKycTransactionBody} HieroProto.proto.ITokenGrantKycTransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HieroProto.proto.ITokenID
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

/**
 * GrantKyc a new Hedera™ crypto-currency token.
 */
class TokenGrantKycTransaction extends _Transaction.default {
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
   * @returns {TokenGrantKycTransaction}
   */
  static _fromProtobuf(transactions, signedTransactions, transactionIds, nodeIds, bodies) {
    const body = bodies[0];
    const grantKycToken = /** @type {HieroProto.proto.ITokenGrantKycTransactionBody} */
    body.tokenGrantKyc;
    return _Transaction.default._fromProtobufTransactions(new TokenGrantKycTransaction({
      tokenId: grantKycToken.token != null ? _TokenId.default._fromProtobuf(grantKycToken.token) : undefined,
      accountId: grantKycToken.account != null ? _AccountId.default._fromProtobuf(grantKycToken.account) : undefined
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
    return channel.token.grantKycToTokenAccount(request);
  }

  /**
   * @override
   * @protected
   * @returns {NonNullable<HieroProto.proto.TransactionBody["data"]>}
   */
  _getTransactionDataCase() {
    return "tokenGrantKyc";
  }

  /**
   * @override
   * @protected
   * @returns {HieroProto.proto.ITokenGrantKycTransactionBody}
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
    return `TokenGrantKycTransaction:${timestamp.toString()}`;
  }
}
exports.default = TokenGrantKycTransaction;
_Transaction.TRANSACTION_REGISTRY.set("tokenGrantKyc",
// eslint-disable-next-line @typescript-eslint/unbound-method
TokenGrantKycTransaction._fromProtobuf);