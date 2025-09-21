"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _PendingAirdropId = _interopRequireDefault(require("../token/PendingAirdropId.cjs"));
var _Transaction = _interopRequireWildcard(require("../transaction/Transaction.cjs"));
var _AirdropPendingTransaction = _interopRequireDefault(require("./AirdropPendingTransaction.cjs"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITokenCancelAirdropTransactionBody} HieroProto.proto.ITokenCancelAirdropTransactionBody
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../account/AccountId.js").default} AccountId
 */

/**
 * A transaction that allows the cancellation of pending airdrops.
 * This transaction can be used by authorized accounts to cancel airdrop operations
 * that have been initiated but not yet claimed by recipients.
 */
class TokenCancelAirdropTransaction extends _AirdropPendingTransaction.default {
  /**
   * @param {object} props
   * @param {PendingAirdropId[]} [props.pendingAirdropIds]
   */
  constructor(props = {}) {
    super(props);
  }

  /**
   * @override
   * @internal
   * @returns {HieroProto.proto.ITokenCancelAirdropTransactionBody}
   */
  _makeTransactionData() {
    return {
      pendingAirdrops: this.pendingAirdropIds.map(pendingAirdropId => pendingAirdropId.toBytes())
    };
  }

  /**
   * @override
   * @internal
   * @param {Channel} channel
   * @param {HieroProto.proto.ITransaction} request
   * @returns {Promise<HieroProto.proto.ITransactionResponse>}
   */
  _execute(channel, request) {
    return channel.token.cancelAirdrop(request);
  }

  /**
   * @override
   * @protected
   * @returns {NonNullable<HieroProto.proto.TransactionBody["data"]>}
   */
  _getTransactionDataCase() {
    return "tokenCancelAirdrop";
  }

  /**
   * @internal
   * @param {HieroProto.proto.ITransaction[]} transactions
   * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
   * @param {TransactionId[]} transactionIds
   * @param {AccountId[]} nodeIds
   * @param {HieroProto.proto.ITransactionBody[]} bodies
   * @returns {TokenCancelAirdropTransaction}
   */
  static _fromProtobuf(transactions, signedTransactions, transactionIds, nodeIds, bodies) {
    const body = bodies[0];
    const {
      pendingAirdrops
    } = /** @type {HieroProto.proto.ITokenCancelAirdropTransactionBody} */
    body.tokenCancelAirdrop;
    return _Transaction.default._fromProtobufTransactions(new TokenCancelAirdropTransaction({
      pendingAirdropIds: pendingAirdrops?.map(pendingAirdrop => {
        return _PendingAirdropId.default.fromBytes(pendingAirdrop);
      })
    }), transactions, signedTransactions, transactionIds, nodeIds, bodies);
  }

  /**
   * @returns {string}
   */
  _getLogId() {
    const timestamp = /** @type {import("../Timestamp.js").default} */
    this._transactionIds.current.validStart;
    return `TokenCancelAirdrop:${timestamp.toString()}`;
  }
}
exports.default = TokenCancelAirdropTransaction;
_Transaction.TRANSACTION_REGISTRY.set("tokenCancelAirdrop",
// eslint-disable-next-line @typescript-eslint/unbound-method
TokenCancelAirdropTransaction._fromProtobuf);