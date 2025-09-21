"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Transaction = _interopRequireWildcard(require("../transaction/Transaction.cjs"));
var _AccountId = _interopRequireDefault(require("./AccountId.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.ICryptoDeleteLiveHashTransactionBody} HieroProto.proto.ICryptoDeleteLiveHashTransactionBody
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

/**
 * @deprecated
 * This transaction is no longer supported.
 */
class LiveHashDeleteTransaction extends _Transaction.default {
  /**
   * @param {object} [props]
   * @param {Uint8Array} [props.hash]
   * @param {AccountId | string} [props.accountId]
   */
  constructor(props = {}) {
    super();

    /**
     * @private
     * @type {?Uint8Array}
     */
    this._hash = null;

    /**
     * @private
     * @type {?AccountId}
     */
    this._accountId = null;
    if (props.hash != null) {
      this.setHash(props.hash);
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
   * @returns {LiveHashDeleteTransaction}
   */
  static _fromProtobuf(transactions, signedTransactions, transactionIds, nodeIds, bodies) {
    const body = bodies[0];
    const hashes = /** @type {HieroProto.proto.ICryptoDeleteLiveHashTransactionBody} */
    body.cryptoDeleteLiveHash;
    return _Transaction.default._fromProtobufTransactions(
    // eslint-disable-next-line deprecation/deprecation
    new LiveHashDeleteTransaction({
      hash: hashes.liveHashToDelete != null ? hashes.liveHashToDelete : undefined,
      accountId: hashes.accountOfLiveHash != null ? _AccountId.default._fromProtobuf(hashes.accountOfLiveHash) : undefined
    }), transactions, signedTransactions, transactionIds, nodeIds, bodies);
  }

  /**
   * @returns {?Uint8Array}
   */
  get hash() {
    return this._hash;
  }

  /**
   * @param {Uint8Array} hash
   * @returns {LiveHashDeleteTransaction}
   */
  setHash(hash) {
    this._requireNotFrozen();
    this._hash = hash;
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
   * @returns {LiveHashDeleteTransaction}
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
  }

  /**
   * @override
   * @internal
   * @param {Channel} channel
   * @param {HieroProto.proto.ITransaction} request
   * @returns {Promise<HieroProto.proto.ITransactionResponse>}
   */
  _execute(channel, request) {
    return channel.crypto.deleteLiveHash(request);
  }

  /**
   * @override
   * @protected
   * @returns {NonNullable<HieroProto.proto.TransactionBody["data"]>}
   */
  _getTransactionDataCase() {
    return "cryptoDeleteLiveHash";
  }

  /**
   * @override
   * @protected
   * @returns {HieroProto.proto.ICryptoDeleteLiveHashTransactionBody}
   */
  _makeTransactionData() {
    return {
      liveHashToDelete: this._hash,
      accountOfLiveHash: this._accountId != null ? this._accountId._toProtobuf() : null
    };
  }

  /**
   * @returns {string}
   */
  _getLogId() {
    const timestamp = /** @type {import("../Timestamp.js").default} */
    this._transactionIds.current.validStart;
    return `LiveHashDeleteTransaction:${timestamp.toString()}`;
  }
}
exports.default = LiveHashDeleteTransaction;
_Transaction.TRANSACTION_REGISTRY.set("cryptoDeleteLiveHash",
// eslint-disable-next-line @typescript-eslint/unbound-method, deprecation/deprecation
LiveHashDeleteTransaction._fromProtobuf);