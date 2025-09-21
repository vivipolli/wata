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
export default class LiveHashDeleteTransaction extends Transaction {
    /**
     * @internal
     * @param {HieroProto.proto.ITransaction[]} transactions
     * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {LiveHashDeleteTransaction}
     */
    static _fromProtobuf(transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): LiveHashDeleteTransaction;
    /**
     * @param {object} [props]
     * @param {Uint8Array} [props.hash]
     * @param {AccountId | string} [props.accountId]
     */
    constructor(props?: {
        hash?: Uint8Array<ArrayBufferLike> | undefined;
        accountId?: string | AccountId | undefined;
    });
    /**
     * @private
     * @type {?Uint8Array}
     */
    private _hash;
    /**
     * @private
     * @type {?AccountId}
     */
    private _accountId;
    /**
     * @returns {?Uint8Array}
     */
    get hash(): Uint8Array | null;
    /**
     * @param {Uint8Array} hash
     * @returns {LiveHashDeleteTransaction}
     */
    setHash(hash: Uint8Array): LiveHashDeleteTransaction;
    /**
     * @returns {?AccountId}
     */
    get accountId(): AccountId | null;
    /**
     * @param {AccountId | string} accountId
     * @returns {LiveHashDeleteTransaction}
     */
    setAccountId(accountId: AccountId | string): LiveHashDeleteTransaction;
    /**
     * @override
     * @protected
     * @returns {HieroProto.proto.ICryptoDeleteLiveHashTransactionBody}
     */
    protected override _makeTransactionData(): HieroProto.proto.ICryptoDeleteLiveHashTransactionBody;
}
export namespace HieroProto {
    namespace proto {
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
        type ISignedTransaction = import("@hashgraph/proto").proto.ISignedTransaction;
        type TransactionBody = import("@hashgraph/proto").proto.TransactionBody;
        type ITransactionBody = import("@hashgraph/proto").proto.ITransactionBody;
        type ITransactionResponse = import("@hashgraph/proto").proto.ITransactionResponse;
        type ICryptoDeleteLiveHashTransactionBody = import("@hashgraph/proto").proto.ICryptoDeleteLiveHashTransactionBody;
    }
}
export type Channel = import("../channel/Channel.js").default;
export type Client = import("../client/Client.js").default<any, any>;
export type TransactionId = import("../transaction/TransactionId.js").default;
import Transaction from "../transaction/Transaction.js";
import AccountId from "./AccountId.js";
