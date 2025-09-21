"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _TokenId = _interopRequireDefault(require("./TokenId.cjs"));
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
 * @typedef {import("@hashgraph/proto").proto.ITokenUpdateNftsTransactionBody} HieroProto.proto.ITokenUpdateNftsTransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HieroProto.proto.ITokenID
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../account/AccountId.js").default} AccountId
 */

/**
 * @deprecated - Use TokenUpdateNftsTransaction instead
 */
class TokenNftsUpdateTransaction extends _Transaction.default {
  /**
   * @param {object} [props]
   * @param {TokenId | string} [props.tokenId]
   * @param {Long[]} [props.serialNumbers]
   * @param {Uint8Array} [props.metadata]
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
     * @type {?Long[]}
     */
    this._serialNumbers = [];

    /**
     * @private
     * @type {?Uint8Array}
     */
    this._metadata = null;
    if (props.tokenId != null) {
      this.setTokenId(props.tokenId);
    }
    if (props.serialNumbers != null) {
      this.setSerialNumbers(props.serialNumbers);
    }
    if (props.metadata != null) {
      this.setMetadata(props.metadata);
    }
  }

  /**
   * @internal
   * @param {HieroProto.proto.ITransaction[]} transactions
   * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
   * @param {TransactionId[]} transactionIds
   * @param {AccountId[]} nodeIds
   * @param {HieroProto.proto.ITransactionBody[]} bodies
   * @returns {TokenNftsUpdateTransaction}
   */
  static _fromProtobuf(transactions, signedTransactions, transactionIds, nodeIds, bodies) {
    const body = bodies[0];
    const tokenUpdate = /** @type {HieroProto.proto.ITokenUpdateNftsTransactionBody} */
    body.tokenUpdate;
    return _Transaction.default._fromProtobufTransactions(
    // eslint-disable-next-line deprecation/deprecation
    new TokenNftsUpdateTransaction({
      tokenId: tokenUpdate.token != null ? _TokenId.default._fromProtobuf(tokenUpdate.token) : undefined,
      serialNumbers: tokenUpdate.serialNumbers != null ? tokenUpdate.serialNumbers : [],
      metadata: tokenUpdate.metadata != null ? tokenUpdate.metadata.value != null ? tokenUpdate.metadata.value : undefined : undefined
    }), transactions, signedTransactions, transactionIds, nodeIds, bodies);
  }

  /**
   * @description Assign the token id.
   * @param {TokenId | string} tokenId
   * @returns {this}
   */
  setTokenId(tokenId) {
    this._requireNotFrozen();
    this._tokenId = typeof tokenId === "string" ? _TokenId.default.fromString(tokenId) : tokenId.clone();
    return this;
  }

  /**
   * @description Assign the list of serial numbers.
   * @param {Long[]} serialNumbers
   * @returns {this}
   */
  setSerialNumbers(serialNumbers) {
    this._requireNotFrozen();
    this._serialNumbers = serialNumbers;
    return this;
  }

  /**
   * @param {Uint8Array} metadata
   * @returns {this}
   */
  setMetadata(metadata) {
    this._requireNotFrozen();
    this._metadata = metadata;
    return this;
  }

  /**
   * @param {Client} client
   */
  _validateChecksums(client) {
    if (this._tokenId != null) {
      this._tokenId.validateChecksum(client);
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
    return channel.token.pauseToken(request);
  }

  /**
   * @override
   * @protected
   * @returns {NonNullable<HieroProto.proto.TransactionBody["data"]>}
   */
  _getTransactionDataCase() {
    return "tokenUpdateNfts";
  }

  /**
   * @override
   * @protected
   * @returns {HieroProto.proto.ITokenUpdateNftsTransactionBody}
   */
  _makeTransactionData() {
    return {
      token: this._tokenId != null ? this._tokenId._toProtobuf() : null,
      serialNumbers: this._serialNumbers != null ? this._serialNumbers : [],
      ...(this._metadata != null ? {
        metadata: {
          value: this._metadata
        }
      } : null)
    };
  }

  /**
   * @returns {string}
   */
  _getLogId() {
    const timestamp = /** @type {import("../Timestamp.js").default} */
    this._transactionIds.current.validStart;
    return `TokenNftsUpdateTransaction:${timestamp.toString()}`;
  }
}
exports.default = TokenNftsUpdateTransaction;
_Transaction.TRANSACTION_REGISTRY.set("tokenUpdateNfts",
// eslint-disable-next-line deprecation/deprecation, @typescript-eslint/unbound-method
TokenNftsUpdateTransaction._fromProtobuf);