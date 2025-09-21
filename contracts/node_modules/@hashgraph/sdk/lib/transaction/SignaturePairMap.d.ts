/**
 * @augments {ObjectMap<PublicKey, Uint8Array>}
 */
export default class SignaturePairMap extends ObjectMap<PublicKey, Uint8Array<ArrayBufferLike>> {
    /**
     * This function is used to create a SignaturePairMap from an already built transaction.
     * @param {import("@hashgraph/proto").proto.ISignatureMap} sigMap
     * @returns {SignaturePairMap}
     */
    static _fromTransactionSigMap(sigMap: import("@hashgraph/proto").proto.ISignatureMap): SignaturePairMap;
    constructor();
    /**
     *
     * @param {PublicKey} pubKey
     * @param {Uint8Array} signature
     * @returns {SignaturePairMap}
     */
    addSignature(pubKey: PublicKey, signature: Uint8Array): SignaturePairMap;
}
import PublicKey from "../PublicKey.js";
import ObjectMap from "../ObjectMap.js";
