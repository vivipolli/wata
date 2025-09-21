/**
 * @deprecated
 * @augments {ObjectMap<AccountId, NodeAccountIdSignatureMapLegacy>}
 */
export default class SignatureMap extends ObjectMap<AccountId, NodeAccountIdSignatureMapLegacy> {
    /**
     * @param {import("./Transaction.js").default} transaction
     * @returns {SignatureMap}
     */
    static _fromTransaction(transaction: import("./Transaction.js").default): SignatureMap;
    constructor();
}
import AccountId from "../account/AccountId.js";
import NodeAccountIdSignatureMapLegacy from "./NodeAccountIdSignatureMapLegacy.js";
import ObjectMap from "../ObjectMap.js";
