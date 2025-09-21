"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _ObjectMap = _interopRequireDefault(require("../ObjectMap.cjs"));
var _TransactionId = _interopRequireDefault(require("./TransactionId.cjs"));
var _SignaturePairMap = _interopRequireDefault(require("./SignaturePairMap.cjs"));
var HieroProto = _interopRequireWildcard(require("@hashgraph/proto"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @augments {ObjectMap<TransactionId, SignaturePairMap>}
 */
class NodeAccountIdSignatureMap extends _ObjectMap.default {
  constructor() {
    super(s => _TransactionId.default.fromString(s));
  }

  /**
   * This function is used to create a NodeAccountIdSignaturemap from an already built transaction.
   * @param { import('./List.js').default<import("@hashgraph/proto").proto.ISignedTransaction>} signedTransactions
   * @returns {NodeAccountIdSignatureMap}
   */
  static _fromSignedTransactions(signedTransactions) {
    const signatures = new NodeAccountIdSignatureMap();
    for (const {
      bodyBytes,
      sigMap
    } of signedTransactions.list) {
      if (bodyBytes != null && sigMap != null) {
        const body = HieroProto.proto.TransactionBody.decode(bodyBytes);
        if (body.transactionID != null) {
          const transactionId = _TransactionId.default._fromProtobuf(body.transactionID);
          signatures._set(transactionId, _SignaturePairMap.default._fromTransactionSigMap(sigMap));
        }
      }
    }
    return signatures;
  }

  /**
   *
   * Adds a signature pair for this transaction id.
   * @param {TransactionId} txId
   * @param {import("../SignerSignature.js").PublicKey} publicKey
   * @param {Uint8Array} signature
   */
  addSignature(txId, publicKey, signature) {
    const sigPairMap = this.get(txId);
    if (sigPairMap) {
      sigPairMap.addSignature(publicKey, signature);
    } else {
      this._set(txId, new _SignaturePairMap.default().addSignature(publicKey, signature));
    }
  }
}
exports.default = NodeAccountIdSignatureMap;