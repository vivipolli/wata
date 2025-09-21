/**
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.Transaction} HieroProto.proto.Transaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.SignedTransaction} HieroProto.proto.SignedTransaction
 * @typedef {import("@hashgraph/proto").proto.IUtilPrngTransactionBody } HieroProto.proto.IUtilPrngTransactionBody
 * @typedef {import("@hashgraph/proto").proto.UtilPrngTransactionBody} HieroProto.proto.UtilPrngTransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.TransactionResponse
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("./account/AccountId.js").default} AccountId
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 */
/**
 * @typedef {import("./client/Client.js").default<*, *>} Client
 *  @typedef {import("./channel/Channel.js").default} Channel
 */
/**
 * Gets a pseudorandom 32-bit number. Not cryptographically secure. See HIP-351 https://hips.hedera.com/hip/hip-351
 */
export default class PrngTransaction extends Transaction {
    /**
     * @internal
     * @param {HieroProto.proto.ITransaction[]} transactions
     * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {PrngTransaction}
     */
    static _fromProtobuf(transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): PrngTransaction;
    /**
     * @param {object} props
     * @param {?number } [props.range]
     */
    constructor(props?: {
        range?: number | null | undefined;
    });
    /**
     * @private
     * @type {?number}
     */
    private _range;
    /**
     * @param {number} newRange
     * @returns {this}
     */
    setRange(newRange: number): this;
    get range(): number | null;
    /**
     * @override
     * @protected
     * @returns {HieroProto.proto.IUtilPrngTransactionBody}
     */
    protected override _makeTransactionData(): HieroProto.proto.IUtilPrngTransactionBody;
}
export namespace HieroProto {
    namespace proto {
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
        type Transaction = import("@hashgraph/proto").proto.Transaction;
        type ISignedTransaction = import("@hashgraph/proto").proto.ISignedTransaction;
        type SignedTransaction = import("@hashgraph/proto").proto.SignedTransaction;
        type IUtilPrngTransactionBody = import("@hashgraph/proto").proto.IUtilPrngTransactionBody;
        type UtilPrngTransactionBody = import("@hashgraph/proto").proto.UtilPrngTransactionBody;
        type TransactionResponse = import("@hashgraph/proto").proto.ITransactionResponse;
        type TransactionBody = import("@hashgraph/proto").proto.TransactionBody;
        type ITransactionBody = import("@hashgraph/proto").proto.ITransactionBody;
    }
}
export type AccountId = import("./account/AccountId.js").default;
export type TransactionId = import("./transaction/TransactionId.js").default;
export type Client = import("./client/Client.js").default<any, any>;
export type Channel = import("./channel/Channel.js").default;
import Transaction from "./transaction/Transaction.js";
