"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Transaction = _interopRequireWildcard(require("../transaction/Transaction.cjs"));
var _TopicId = _interopRequireDefault(require("./TopicId.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IConsensusDeleteTopicTransactionBody} HieroProto.proto.IConsensusDeleteTopicTransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../account/AccountId.js").default} AccountId
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

/**
 * Delete a topic.
 *
 * No more transactions or queries on the topic will succeed.
 *
 * If an adminKey is set, this transaction must be signed by that key.
 * If there is no adminKey, this transaction will fail with Status#Unautorized.
 */
class TopicDeleteTransaction extends _Transaction.default {
  /**
   * @param {object} props
   * @param {TopicId | string} [props.topicId]
   */
  constructor(props = {}) {
    super();

    /**
     * @private
     * @type {?TopicId}
     */
    this._topicId = null;
    if (props.topicId != null) {
      this.setTopicId(props.topicId);
    }
  }

  /**
   * @internal
   * @param {HieroProto.proto.ITransaction[]} transactions
   * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
   * @param {TransactionId[]} transactionIds
   * @param {AccountId[]} nodeIds
   * @param {HieroProto.proto.ITransactionBody[]} bodies
   * @returns {TopicDeleteTransaction}
   */
  static _fromProtobuf(transactions, signedTransactions, transactionIds, nodeIds, bodies) {
    const body = bodies[0];
    const topicDelete = /** @type {HieroProto.proto.IConsensusDeleteTopicTransactionBody} */
    body.consensusDeleteTopic;
    return _Transaction.default._fromProtobufTransactions(new TopicDeleteTransaction({
      topicId: topicDelete.topicID != null ? _TopicId.default._fromProtobuf(topicDelete.topicID) : undefined
    }), transactions, signedTransactions, transactionIds, nodeIds, bodies);
  }

  /**
   * @returns {?TopicId}
   */
  get topicId() {
    return this._topicId;
  }

  /**
   * Set the topic ID which is being deleted in this transaction.
   *
   * @param {TopicId | string} topicId
   * @returns {TopicDeleteTransaction}
   */
  setTopicId(topicId) {
    this._requireNotFrozen();
    this._topicId = typeof topicId === "string" ? _TopicId.default.fromString(topicId) : topicId.clone();
    return this;
  }

  /**
   * @param {Client} client
   */
  _validateChecksums(client) {
    if (this._topicId != null) {
      this._topicId.validateChecksum(client);
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
    return channel.consensus.deleteTopic(request);
  }

  /**
   * @override
   * @protected
   * @returns {NonNullable<HieroProto.proto.TransactionBody["data"]>}
   */
  _getTransactionDataCase() {
    return "consensusDeleteTopic";
  }

  /**
   * @override
   * @protected
   * @returns {HieroProto.proto.IConsensusDeleteTopicTransactionBody}
   */
  _makeTransactionData() {
    return {
      topicID: this._topicId != null ? this._topicId._toProtobuf() : null
    };
  }

  /**
   * @returns {string}
   */
  _getLogId() {
    const timestamp = /** @type {import("../Timestamp.js").default} */
    this._transactionIds.current.validStart;
    return `TopicDeleteTransaction:${timestamp.toString()}`;
  }
}
exports.default = TopicDeleteTransaction;
_Transaction.TRANSACTION_REGISTRY.set("consensusDeleteTopic",
// eslint-disable-next-line @typescript-eslint/unbound-method
TopicDeleteTransaction._fromProtobuf);