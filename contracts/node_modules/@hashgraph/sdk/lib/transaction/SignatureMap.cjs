"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _NodeAccountIdSignatureMap = _interopRequireDefault(require("./NodeAccountIdSignatureMap.cjs"));
var _ObjectMap = _interopRequireDefault(require("../ObjectMap.cjs"));
var _AccountId = _interopRequireDefault(require("../account/AccountId.cjs"));
var _List = _interopRequireDefault(require("./List.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * Represents a mapping of account IDs to their corresponding signatures for transactions.
 *
 * The `SignatureMap` class is used to manage and store signatures associated with
 * different accounts in a transaction. It allows for adding signatures, retrieving
 * them, and converting the signature map to and from various formats.
 */

/**
 * @augments {ObjectMap<AccountId, NodeAccountIdSignatureMap>}
 */
class SignatureMap extends _ObjectMap.default {
  /**
   * @typedef {import("../transaction/TransactionId.js").default} TransactionId
   * @typedef {import("../transaction/SignaturePairMap.js").default} SignaturePairMap
   */
  constructor() {
    super(s => _AccountId.default.fromString(s));
  }

  /**
   * This function is used to create a SignatureMap from an already built transaction.
   * @param {import("./Transaction.js").default} transaction
   * @returns {SignatureMap}
   */
  static _fromTransaction(transaction) {
    const signatures = new SignatureMap();
    const rowLength = transaction._nodeAccountIds.length;
    const columns = transaction._signedTransactions.length / rowLength;

    /*
    this setup implies that the signed transactions are stored sequentially
    in the signed transactions list. This means that the first rowLength
    signed transactions are for the first node account id, the next rowLength
    signed transactions are for the second node account id and so on.
    */
    for (let row = 0; row < rowLength; row++) {
      /** @type { List<import("@hashgraph/proto").proto.ISignedTransaction> } */
      const signedTransactions = new _List.default();
      for (let col = 0; col < columns; col++) {
        signedTransactions.push(transaction._signedTransactions.get(col * rowLength + row));
      }
      signatures._set(transaction._nodeAccountIds.list[row], _NodeAccountIdSignatureMap.default._fromSignedTransactions(signedTransactions));
    }
    return signatures;
  }

  /**
   * Updates the signature map with the given signature.
   * by generating a new node account id signature map if it does not exist
   * or adding the signature to the existing node account id signature map.
   *
   * @param {AccountId} nodeId
   * @param {TransactionId} txId
   * @param {import("../SignerSignature.js").PublicKey} publicKey
   * @param {Uint8Array} signature
   * @returns {SignatureMap}
   */
  addSignature(nodeId, txId, publicKey, signature) {
    let nodeAccountIdSigdMap = this.get(nodeId);
    if (!nodeAccountIdSigdMap) {
      nodeAccountIdSigdMap = new _NodeAccountIdSignatureMap.default();
      this._set(nodeId, nodeAccountIdSigdMap);
    }
    nodeAccountIdSigdMap.addSignature(txId, publicKey, signature);
    this._set(nodeId, nodeAccountIdSigdMap);
    return this;
  }
  /**
   * @returns {SignaturePairMap[]}
   */
  getFlatSignatureList() {
    const flatSignatureList = [];
    for (const nodeAccountIdSignatureMap of this.values()) {
      for (const tx of nodeAccountIdSignatureMap.values()) {
        flatSignatureList.push(tx);
      }
    }
    return flatSignatureList;
  }
}
exports.default = SignatureMap;