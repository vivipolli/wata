"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Transaction = _interopRequireWildcard(require("./transaction/Transaction.cjs"));
var _util = require("./util.cjs");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.Transaction} HieroProto.proto.Transaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.SignedTransaction} HieroProto.proto.SignedTransaction
 * @typedef {import("@hashgraph/proto").proto.IUtilPrngTransactionBody } HieroProto.proto.IUtilPrngTransactionBody
 * @typedef {import("@hashgraph/proto").proto.UtilPrngTransactionBody} HieroProto.proto.UtilPrngTransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.TransactionResponse
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("./account/AccountId.js").default} AccountId
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 */

/**
 * @typedef {import("./client/Client.js").default<*, *>} Client
 *  @typedef {import("./channel/Channel.js").default} Channel
 */

/**
 * Gets a pseudorandom 32-bit number. Not cryptographically secure. See HIP-351 https://hips.hedera.com/hip/hip-351
 */
class PrngTransaction extends _Transaction.default {
  /**
   * @param {object} props
   * @param {?number } [props.range]
   */
  constructor(props = {}) {
    super();

    /**
     * @private
     * @type {?number}
     */
    this._range = null;
    if (props.range != null) {
      this.setRange(props.range);
    }
  }

  /**
   * @param {number} newRange
   * @returns {this}
   */
  setRange(newRange) {
    this._range = newRange;
    return this;
  }
  get range() {
    return this._range;
  }

  /**
   * @param {Client} client
   */
  _validateChecksums(client) {
    if (this._range != null && (0, _util.isNumber)(this._range)) {
      this._validateChecksums(client);
    }
  }

  /**
   * @override
   * @internal
   * @param {Channel} channel
   * @param {HieroProto.proto.ITransaction} request
   * @returns {Promise<HieroProto.proto.TransactionResponse>}
   */
  _execute(channel, request) {
    return channel.util.prng(request);
  }

  /**
   * @internal
   * @param {HieroProto.proto.ITransaction[]} transactions
   * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
   * @param {TransactionId[]} transactionIds
   * @param {AccountId[]} nodeIds
   * @param {HieroProto.proto.ITransactionBody[]} bodies
   * @returns {PrngTransaction}
   */
  static _fromProtobuf(transactions, signedTransactions, transactionIds, nodeIds, bodies) {
    const body = /** @type {HieroProto.proto.ITransactionBody} */
    bodies[0];
    const transactionRange = /** @type {HieroProto.proto.IUtilPrngTransactionBody} */
    body.utilPrng;
    return _Transaction.default._fromProtobufTransactions(new PrngTransaction({
      range: transactionRange.range
    }), transactions, signedTransactions, transactionIds, nodeIds, bodies);
  }

  /**
   * @override
   * @protected
   * @returns {NonNullable<HieroProto.proto.TransactionBody["data"]>}
   */
  _getTransactionDataCase() {
    return "utilPrng";
  }

  /**
   * @override
   * @protected
   * @returns {HieroProto.proto.IUtilPrngTransactionBody}
   */
  _makeTransactionData() {
    return {
      range: this.range
    };
  }

  /**
   * @returns {string}
   */
  _getLogId() {
    const timestamp = /** @type {import("./Timestamp.js").default} */
    this._transactionIds.current.validStart;
    return `RandomGenerate:${timestamp.toString()}`;
  }
}
exports.default = PrngTransaction;
_Transaction.TRANSACTION_REGISTRY.set("utilPrng",
// eslint-disable-next-line @typescript-eslint/unbound-method
PrngTransaction._fromProtobuf);