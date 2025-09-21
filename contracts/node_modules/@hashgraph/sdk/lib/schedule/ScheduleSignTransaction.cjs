"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _ScheduleId = _interopRequireDefault(require("./ScheduleId.cjs"));
var _Hbar = _interopRequireDefault(require("../Hbar.cjs"));
var _Transaction = _interopRequireWildcard(require("../transaction/Transaction.cjs"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @typedef {object} ProtoSignaturePair
 * @property {(Uint8Array | null)=} pubKeyPrefix
 * @property {(Uint8Array | null)=} ed25519
 */

/**
 * @typedef {object} ProtoSigMap
 * @property {(ProtoSignaturePair[] | null)=} sigPair
 */

/**
 * @typedef {object} ProtoSignedTransaction
 * @property {(Uint8Array | null)=} bodyBytes
 * @property {(ProtoSigMap | null)=} sigMap
 */

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.IScheduleSignTransactionBody} HieroProto.proto.IScheduleSignTransactionBody
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 * @typedef {import("@hashgraph/proto").proto.ISignatureMap} HieroProto.proto.ISignatureMap
 */

/**
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("@hashgraph/cryptography").Key} Key
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../Timestamp.js").default} Timestamp
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../account/AccountId.js").default} AccountId
 * @typedef {import("@hashgraph/cryptography").PublicKey} PublicKey
 */

/**
 * Create a new Hedera™ crypto-currency account.
 */
class ScheduleSignTransaction extends _Transaction.default {
  /**
   * @param {object} [props]
   * @param {ScheduleId | string} [props.scheduleId]
   */
  constructor(props = {}) {
    super();

    /**
     * @private
     * @type {?ScheduleId}
     */
    this._scheduleId = null;
    if (props.scheduleId != null) {
      this.setScheduleId(props.scheduleId);
    }
    this._defaultMaxTransactionFee = new _Hbar.default(5);
  }

  /**
   * @internal
   * @param {HieroProto.proto.ITransaction[]} transactions
   * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
   * @param {TransactionId[]} transactionIds
   * @param {AccountId[]} nodeIds
   * @param {HieroProto.proto.ITransactionBody[]} bodies
   * @returns {ScheduleSignTransaction}
   */
  static _fromProtobuf(transactions, signedTransactions, transactionIds, nodeIds, bodies) {
    const body = bodies[0];
    const sign = /** @type {HieroProto.proto.IScheduleSignTransactionBody} */
    body.scheduleSign;
    return _Transaction.default._fromProtobufTransactions(new ScheduleSignTransaction({
      scheduleId: sign.scheduleID != null ? _ScheduleId.default._fromProtobuf(sign.scheduleID) : undefined
    }), transactions, signedTransactions, transactionIds, nodeIds, bodies);
  }

  /**
   * @returns {?ScheduleId}
   */
  get scheduleId() {
    return this._scheduleId;
  }

  /**
   * @param {ScheduleId | string} scheduleId
   * @returns {this}
   */
  setScheduleId(scheduleId) {
    this._requireNotFrozen();
    this._scheduleId = typeof scheduleId === "string" ? _ScheduleId.default.fromString(scheduleId) : scheduleId.clone();
    return this;
  }

  /**
   * @param {Client} client
   */
  _validateChecksums(client) {
    if (this._scheduleId != null) {
      this._scheduleId.validateChecksum(client);
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
    return channel.schedule.signSchedule(request);
  }

  /**
   * @override
   * @protected
   * @returns {NonNullable<HieroProto.proto.TransactionBody["data"]>}
   */
  _getTransactionDataCase() {
    return "scheduleSign";
  }

  /**
   * @override
   * @protected
   * @returns {HieroProto.proto.IScheduleSignTransactionBody}
   */
  _makeTransactionData() {
    return {
      scheduleID: this._scheduleId != null ? this._scheduleId._toProtobuf() : null
    };
  }

  /**
   * @returns {string}
   */
  _getLogId() {
    const timestamp = /** @type {import("../Timestamp.js").default} */
    this._transactionIds.current.validStart;
    return `ScheduleSignTransaction:${timestamp.toString()}`;
  }
}
exports.default = ScheduleSignTransaction;
_Transaction.TRANSACTION_REGISTRY.set("scheduleSign",
// eslint-disable-next-line @typescript-eslint/unbound-method
ScheduleSignTransaction._fromProtobuf);