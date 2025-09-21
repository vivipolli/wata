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
export default class SignatureMap extends ObjectMap<AccountId, NodeAccountIdSignatureMap> {
    /**
     * This function is used to create a SignatureMap from an already built transaction.
     * @param {import("./Transaction.js").default} transaction
     * @returns {SignatureMap}
     */
    static _fromTransaction(transaction: import("./Transaction.js").default): SignatureMap;
    /**
     * @typedef {import("../transaction/TransactionId.js").default} TransactionId
     * @typedef {import("../transaction/SignaturePairMap.js").default} SignaturePairMap
     */
    constructor();
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
    addSignature(nodeId: AccountId, txId: import("../transaction/TransactionId.js").default, publicKey: import("../SignerSignature.js").PublicKey, signature: Uint8Array): SignatureMap;
    /**
     * @returns {SignaturePairMap[]}
     */
    getFlatSignatureList(): import("../transaction/SignaturePairMap.js").default[];
}
import AccountId from "../account/AccountId.js";
import NodeAccountIdSignatureMap from "./NodeAccountIdSignatureMap.js";
import ObjectMap from "../ObjectMap.js";
