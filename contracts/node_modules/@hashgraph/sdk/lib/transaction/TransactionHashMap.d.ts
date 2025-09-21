/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 */
/**
 * @augments {ObjectMap<AccountId, Uint8Array>}
 */
export default class TransactionHashMap extends ObjectMap<AccountId, Uint8Array<ArrayBufferLike>> {
    /**
     * @param {import("./Transaction.js").default} transaction
     * @returns {Promise<TransactionHashMap>}
     */
    static _fromTransaction(transaction: import("./Transaction.js").default): Promise<TransactionHashMap>;
    constructor();
}
export namespace HieroProto {
    namespace proto {
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
    }
}
import AccountId from "../account/AccountId.js";
import ObjectMap from "../ObjectMap.js";
