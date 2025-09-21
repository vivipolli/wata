/**
 * @augments {ObjectMap<TransactionId, SignaturePairMap>}
 */
export default class NodeAccountIdSignatureMap extends ObjectMap<TransactionId, SignaturePairMap> {
    /**
     * This function is used to create a NodeAccountIdSignaturemap from an already built transaction.
     * @param { import('./List.js').default<import("@hashgraph/proto").proto.ISignedTransaction>} signedTransactions
     * @returns {NodeAccountIdSignatureMap}
     */
    static _fromSignedTransactions(signedTransactions: import("./List.js").default<import("@hashgraph/proto").proto.ISignedTransaction>): NodeAccountIdSignatureMap;
    constructor();
    /**
     *
     * Adds a signature pair for this transaction id.
     * @param {TransactionId} txId
     * @param {import("../SignerSignature.js").PublicKey} publicKey
     * @param {Uint8Array} signature
     */
    addSignature(txId: TransactionId, publicKey: import("../SignerSignature.js").PublicKey, signature: Uint8Array): void;
}
import TransactionId from "./TransactionId.js";
import SignaturePairMap from "./SignaturePairMap.js";
import ObjectMap from "../ObjectMap.js";
