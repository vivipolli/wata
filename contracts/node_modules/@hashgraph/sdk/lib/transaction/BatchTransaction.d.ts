/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 */
/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../account/AccountId.js").default} AccountId
 * @typedef {import("../Key.js").default} Key
 */
/**
 * @description Execute multiple transactions in a single consensus event. This allows for atomic execution of multiple
 * transactions, where they either all succeed or all fail together.
 * <p>
 * Requirements:
 * <ul>
 *     <li>All inner transactions must be frozen before being added to the batch</li>
 *     <li>All inner transactions must have a batch key set</li>
 *     <li>All inner transactions must be signed as required for each individual transaction</li>
 *     <li>The BatchTransaction must be signed by all batch keys of the inner transactions</li>
 *     <li>Certain transaction types (FreezeTransaction, BatchTransaction) are not allowed in a batch</li>
 * </ul>
 * <p>
 * Important notes:
 * <ul>
 *     <li>Fees are assessed for each inner transaction separately</li>
 *     <li>The maximum number of inner transactions in a batch is limited to 25</li>
 *     <li>Inner transactions cannot be scheduled transactions</li>
 * </ul>
 *
 */
export default class BatchTransaction extends Transaction {
    /**
     * @internal
     * @param {proto.ITransaction[]} transactions
     * @param {proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {BatchTransaction}
     */
    static _fromProtobuf(transactions: proto.ITransaction[], signedTransactions: proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): BatchTransaction;
    /**
     * @param {object} [options]
     * @param {Transaction[] | null} [options.transactions]
     */
    constructor(options?: {
        transactions?: Transaction[] | null | undefined;
    });
    _batchTransactions: Transaction[];
    /**
     * Set the list of transactions to be executed as part of this BatchTransaction.
     * <p>
     * Requirements for each inner transaction:
     * <ul>
     *     <li>Must be frozen (use {@link Transaction#freeze()} or {@link Transaction#freezeWith(Client)})</li>
     *     <li>Must have a batch key set (use {@link Transaction#setBatchKey(Key)}} or {@link Transaction#batchify(Client, Key)})</li>
     *     <li>Must not be a blacklisted transaction type</li>
     * </ul>
     * <p>
     * Note: This method creates a defensive copy of the provided list.
     *
     * @param {Transaction[]} txs
     * @returns {BatchTransaction}
     */
    setInnerTransactions(txs: Transaction[]): BatchTransaction;
    /**
     * Append a transaction to the list of transactions this BatchTransaction will execute.
     * <p>
     * Requirements for the inner transaction:
     * <ul>
     *     <li>Must be frozen (use {@link Transaction#freeze()} or {@link Transaction#freezeWith(Client)})</li>
     *     <li>Must have a batch key set (use {@link Transaction#setBatchKey(Key)}} or {@link Transaction#batchify(Client, Key)})</li>
     *     <li>Must not be a blacklisted transaction type</li>
     * </ul>
     *
     * @param {Transaction} tx
     * @returns {BatchTransaction}
     */
    addInnerTransaction(tx: Transaction): BatchTransaction;
    /**
     * Get the list of transactions this BatchTransaction is currently configured to execute.
     * <p>
     * Note: This returns the actual list of transactions. Modifications to this list will affect
     * the batch transaction if it is not frozen.
     *
     * @returns {Transaction[]}
     */
    get innerTransactions(): Transaction[];
    /**
     * Get the list of transaction IDs of each inner transaction of this BatchTransaction.
     * <p>
     * This method is particularly useful after execution to:
     * <ul>
     *     <li>Track individual transaction results</li>
     *     <li>Query receipts for specific inner transactions</li>
     *     <li>Monitor the status of each transaction in the batch</li>
     * </ul>
     * <p>
     * <b>NOTE:</b> Transaction IDs will only be meaningful after the batch transaction has been
     * executed or the IDs have been explicitly set on the inner transactions.
     *
     * @returns {(TransactionId | null)[]}
     */
    get innerTransactionIds(): (TransactionId | null)[];
    /**
     *
     * @returns {proto.AtomicBatchTransactionBody}
     */
    _makeTransactionData(): proto.AtomicBatchTransactionBody;
    /**
     * @description Validate the transaction
     * @param {Transaction} tx
     * @throws {Error} If the transaction is a batch or freeze transaction
     */
    _validateTransaction(tx: Transaction): void;
}
export namespace HieroProto {
    namespace proto {
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
        type ITransactionBody = import("@hashgraph/proto").proto.ITransactionBody;
        type TransactionBody = import("@hashgraph/proto").proto.TransactionBody;
        type ITransactionResponse = import("@hashgraph/proto").proto.ITransactionResponse;
    }
}
export type Channel = import("../channel/Channel.js").default;
export type TransactionId = import("../transaction/TransactionId.js").default;
export type AccountId = import("../account/AccountId.js").default;
export type Key = import("../Key.js").default;
import Transaction from "./Transaction.js";
import { proto } from "@hashgraph/proto";
