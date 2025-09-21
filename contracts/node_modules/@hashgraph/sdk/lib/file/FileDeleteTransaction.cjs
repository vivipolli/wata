"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Transaction = _interopRequireWildcard(require("../transaction/Transaction.cjs"));
var _FileId = _interopRequireDefault(require("./FileId.cjs"));
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
 * @typedef {import("@hashgraph/proto").proto.IFileDeleteTransactionBody} HieroProto.proto.IFileDeleteTransactionBody
 */

/**
 * @typedef {import("@hashgraph/cryptography").Key} Key
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../account/AccountId.js").default} AccountId
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

/**
 * A transaction to delete a file on the Hedera network.
 *
 * When deleted, a file's contents are truncated to zero length and it can no longer be updated
 * or appended to, or its expiration time extended. FileContentsQuery and FileInfoQuery
 * will throw HederaPreCheckStatusException with a status of Status#FileDeleted.
 *
 * Only one of the file's keys needs to sign to delete the file, unless the key you have is part
 * of a KeyList.
 */
class FileDeleteTransaction extends _Transaction.default {
  /**
   * @param {object} [props]
   * @param {FileId | string} [props.fileId]
   */
  constructor(props = {}) {
    super();

    /**
     * @private
     * @type {?FileId}
     */
    this._fileId = null;
    if (props.fileId != null) {
      this.setFileId(props.fileId);
    }
  }

  /**
   * @internal
   * @param {HieroProto.proto.ITransaction[]} transactions
   * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
   * @param {TransactionId[]} transactionIds
   * @param {AccountId[]} nodeIds
   * @param {HieroProto.proto.ITransactionBody[]} bodies
   * @returns {FileDeleteTransaction}
   */
  static _fromProtobuf(transactions, signedTransactions, transactionIds, nodeIds, bodies) {
    const body = bodies[0];
    const fileDelete = /** @type {HieroProto.proto.IFileDeleteTransactionBody} */
    body.fileDelete;
    return _Transaction.default._fromProtobufTransactions(new FileDeleteTransaction({
      fileId: fileDelete.fileID != null ? _FileId.default._fromProtobuf(fileDelete.fileID) : undefined
    }), transactions, signedTransactions, transactionIds, nodeIds, bodies);
  }

  /**
   * @returns {?FileId}
   */
  get fileId() {
    return this._fileId;
  }

  /**
   * Set the file ID which is being deleted in this transaction.
   *
   * @param {FileId | string} fileId
   * @returns {FileDeleteTransaction}
   */
  setFileId(fileId) {
    this._requireNotFrozen();
    this._fileId = typeof fileId === "string" ? _FileId.default.fromString(fileId) : fileId.clone();
    return this;
  }

  /**
   * @param {Client} client
   */
  _validateChecksums(client) {
    if (this._fileId != null) {
      this._fileId.validateChecksum(client);
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
    return channel.file.deleteFile(request);
  }

  /**
   * @override
   * @protected
   * @returns {NonNullable<HieroProto.proto.TransactionBody["data"]>}
   */
  _getTransactionDataCase() {
    return "fileDelete";
  }

  /**
   * @override
   * @protected
   * @returns {HieroProto.proto.IFileDeleteTransactionBody}
   */
  _makeTransactionData() {
    return {
      fileID: this._fileId != null ? this._fileId._toProtobuf() : null
    };
  }

  /**
   * @returns {string}
   */
  _getLogId() {
    const timestamp = /** @type {import("../Timestamp.js").default} */
    this._transactionIds.current.validStart;
    return `FileDeleteTransaction:${timestamp.toString()}`;
  }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
exports.default = FileDeleteTransaction;
_Transaction.TRANSACTION_REGISTRY.set("fileDelete", FileDeleteTransaction._fromProtobuf);