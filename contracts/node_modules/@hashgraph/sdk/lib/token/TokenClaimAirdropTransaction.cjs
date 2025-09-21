"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _PendingAirdropId = _interopRequireDefault(require("../token/PendingAirdropId.cjs"));
var _AirdropPendingTransaction = _interopRequireDefault(require("./AirdropPendingTransaction.cjs"));
var _Transaction = _interopRequireWildcard(require("../transaction/Transaction.cjs"));
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
 * @typedef {import("@hashgraph/proto").proto.ITokenClaimAirdropTransactionBody} HieroProto.proto.ITokenClaimAirdropTransactionBody
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../account/AccountId.js").default} AccountId
 */

/**
 * A transaction that allows an account to claim tokens from a pending airdrop.
 * This transaction is used to finalize the receipt of tokens that were distributed
 * through an airdrop mechanism but require explicit claiming by the recipient.
 */
class TokenClaimAirdropTransaction extends _AirdropPendingTransaction.default {
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
   * @param {Channel} channel
   * @param {HieroProto.proto.ITransaction} request
   * @returns {Promise<HieroProto.proto.ITransactionResponse>}
   */
  _execute(channel, request) {
    return channel.token.claimAirdrop(request);
  }

  /**
   * @override
   * @internal
   * @returns {HieroProto.proto.ITokenClaimAirdropTransactionBody}
   */
  _makeTransactionData() {
    return {
      pendingAirdrops: this.pendingAirdropIds.map(pendingAirdropId => pendingAirdropId.toBytes())
    };
  }

  /**
   * @internal
   * @param {HieroProto.proto.ITransaction[]} transactions
   * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
   * @param {TransactionId[]} transactionIds
   * @param {AccountId[]} nodeIds
   * @param {HieroProto.proto.ITransactionBody[]} bodies
   * @returns {TokenClaimAirdropTransaction}
   */
  static _fromProtobuf(transactions, signedTransactions, transactionIds, nodeIds, bodies) {
    const body = bodies[0];
    const {
      pendingAirdrops
    } = /** @type {HieroProto.proto.ITokenClaimAirdropTransactionBody} */
    body.tokenClaimAirdrop;
    return _Transaction.default._fromProtobufTransactions(new TokenClaimAirdropTransaction({
      pendingAirdropIds: pendingAirdrops?.map(pendingAirdrop => {
        return _PendingAirdropId.default.fromBytes(pendingAirdrop);
      })
    }), transactions, signedTransactions, transactionIds, nodeIds, bodies);
  }

  /**
   * @override
   * @protected
   * @returns {NonNullable<HieroProto.proto.TransactionBody["data"]>}
   */
  _getTransactionDataCase() {
    return "tokenClaimAirdrop";
  }

  /**
   * @returns {string}
   */
  _getLogId() {
    const timestamp = /** @type {import("../Timestamp.js").default} */
    this._transactionIds.current.validStart;
    return `TokenClaimAirdropTransaction:${timestamp.toString()}`;
  }
}
exports.default = TokenClaimAirdropTransaction;
_Transaction.TRANSACTION_REGISTRY.set("tokenClaimAirdrop",
// eslint-disable-next-line @typescript-eslint/unbound-method
TokenClaimAirdropTransaction._fromProtobuf);