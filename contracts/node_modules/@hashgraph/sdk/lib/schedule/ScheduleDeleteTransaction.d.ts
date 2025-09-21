/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.IScheduleDeleteTransactionBody} HieroProto.proto.IScheduleDeleteTransactionBody
 * @typedef {import("@hashgraph/proto").proto.IScheduleID} HieroProto.proto.IScheduleID
 */
/**
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("@hashgraph/cryptography").Key} Key
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../Timestamp.js").default} Timestamp
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../account/AccountId.js").default} AccountId
 */
/**
 * Create a new Hedera™ crypto-currency account.
 */
export default class ScheduleDeleteTransaction extends Transaction {
    /**
     * @internal
     * @param {HieroProto.proto.ITransaction[]} transactions
     * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {ScheduleDeleteTransaction}
     */
    static _fromProtobuf(transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): ScheduleDeleteTransaction;
    /**
     * @param {object} [props]
     * @param {ScheduleId | string} [props.scheduleId]
     */
    constructor(props?: {
        scheduleId?: string | ScheduleId | undefined;
    });
    /**
     * @private
     * @type {?ScheduleId}
     */
    private _scheduleId;
    /**
     * @returns {?ScheduleId}
     */
    get scheduleId(): ScheduleId | null;
    /**
     * @param {ScheduleId | string} scheduleId
     * @returns {this}
     */
    setScheduleId(scheduleId: ScheduleId | string): this;
    /**
     * @override
     * @protected
     * @returns {HieroProto.proto.IScheduleDeleteTransactionBody}
     */
    protected override _makeTransactionData(): HieroProto.proto.IScheduleDeleteTransactionBody;
}
export namespace HieroProto {
    namespace proto {
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
        type ISignedTransaction = import("@hashgraph/proto").proto.ISignedTransaction;
        type TransactionBody = import("@hashgraph/proto").proto.TransactionBody;
        type ITransactionBody = import("@hashgraph/proto").proto.ITransactionBody;
        type ITransactionResponse = import("@hashgraph/proto").proto.ITransactionResponse;
        type IScheduleDeleteTransactionBody = import("@hashgraph/proto").proto.IScheduleDeleteTransactionBody;
        type IScheduleID = import("@hashgraph/proto").proto.IScheduleID;
    }
}
export type BigNumber = import("bignumber.js").default;
export type Key = import("@hashgraph/cryptography").Key;
export type Channel = import("../channel/Channel.js").default;
export type Client = import("../client/Client.js").default<any, any>;
export type Timestamp = import("../Timestamp.js").default;
export type TransactionId = import("../transaction/TransactionId.js").default;
export type AccountId = import("../account/AccountId.js").default;
import Transaction from "../transaction/Transaction.js";
import ScheduleId from "./ScheduleId.js";
