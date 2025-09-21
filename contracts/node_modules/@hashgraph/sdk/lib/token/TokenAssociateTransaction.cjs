"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Hbar = _interopRequireDefault(require("../Hbar.cjs"));
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
 * @typedef {import("@hashgraph/proto").proto.ITokenAssociateTransactionBody} HieroProto.proto.ITokenAssociateTransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HieroProto.proto.ITokenID
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

/**
 * Associate a new Hedera™ crypto-currency token.
 */
class TokenAssociateTransaction extends _Transaction.default {
  /**
   * @param {object} [props]
   * @param {(TokenId | string)[]} [props.tokenIds]
   * @param {AccountId | string} [props.accountId]
   */
  constructor(props = {}) {
    super();

    /**
     * @private
     * @type {?TokenId[]}
     */
    this._tokenIds = null;

    /**
     * @private
     * @type {?AccountId}
     */
    this._accountId = null;
    this._defaultMaxTransactionFee = new _Hbar.default(5);
    if (props.tokenIds != null) {
      this.setTokenIds(props.tokenIds);
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
   * @returns {TokenAssociateTransaction}
   */
  static _fromProtobuf(transactions, signedTransactions, transactionIds, nodeIds, bodies) {
    const body = bodies[0];
    const associateToken = /** @type {HieroProto.proto.ITokenAssociateTransactionBody} */
    body.tokenAssociate;
    return _Transaction.default._fromProtobufTransactions(new TokenAssociateTransaction({
      tokenIds: associateToken.tokens != null ? associateToken.tokens.map(token => _TokenId.default._fromProtobuf(token)) : undefined,
      accountId: associateToken.account != null ? _AccountId.default._fromProtobuf(associateToken.account) : undefined
    }), transactions, signedTransactions, transactionIds, nodeIds, bodies);
  }

  /**
   * @returns {?TokenId[]}
   */
  get tokenIds() {
    return this._tokenIds;
  }

  /**
   * @param {(TokenId | string)[]} tokenIds
   * @returns {this}
   */
  setTokenIds(tokenIds) {
    this._requireNotFrozen();
    this._tokenIds = tokenIds.map(tokenId => typeof tokenId === "string" ? _TokenId.default.fromString(tokenId) : tokenId.clone());
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
    if (this._accountId != null) {
      this._accountId.validateChecksum(client);
    }
    for (const tokenId of this._tokenIds != null ? this._tokenIds : []) {
      if (tokenId != null) {
        tokenId.validateChecksum(client);
      }
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
    return channel.token.associateTokens(request);
  }

  /**
   * @override
   * @protected
   * @returns {NonNullable<HieroProto.proto.TransactionBody["data"]>}
   */
  _getTransactionDataCase() {
    return "tokenAssociate";
  }

  /**
   * @override
   * @protected
   * @returns {HieroProto.proto.ITokenAssociateTransactionBody}
   */
  _makeTransactionData() {
    return {
      tokens: this._tokenIds != null ? this._tokenIds.map(tokenId => tokenId._toProtobuf()) : null,
      account: this._accountId != null ? this._accountId._toProtobuf() : null
    };
  }

  /**
   * @returns {string}
   */
  _getLogId() {
    const timestamp = /** @type {import("../Timestamp.js").default} */
    this._transactionIds.current.validStart;
    return `TokenAssociateTransaction:${timestamp.toString()}`;
  }
}
exports.default = TokenAssociateTransaction;
_Transaction.TRANSACTION_REGISTRY.set("tokenAssociate",
// eslint-disable-next-line @typescript-eslint/unbound-method
TokenAssociateTransaction._fromProtobuf);