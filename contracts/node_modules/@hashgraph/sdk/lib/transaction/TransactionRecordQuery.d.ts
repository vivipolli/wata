/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../account/AccountId.js").default} AccountId
 */
/**
 * Get the record for a transaction.
 * <p>
 * If the transaction requested a record, then the record lasts for one hour, and a state proof is available for it.
 * If the transaction created an account, file, or smart contract instance, then the record will contain the ID for
 * what it created. If the transaction called a smart contract function, then the record contains the result of
 * that call. If the transaction was a cryptocurrency transfer, then the record includes the TransferList
 * which gives the details of that transfer. If the transaction didn't return anything that should be
 * in the record, then the results field will be set to nothing.
 * @augments {Query<TransactionRecord>}
 */
export default class TransactionRecordQuery extends Query<TransactionRecord> {
    /**
     * @internal
     * @param {HieroProto.proto.IQuery} query
     * @returns {TransactionRecordQuery}
     */
    static _fromProtobuf(query: HieroProto.proto.IQuery): TransactionRecordQuery;
    /**
     * @param {object} [props]
     * @param {TransactionId} [props.transactionId]
     * @param {boolean} [props.includeChildren]
     * @param {boolean} [props.includeDuplicates]
     * @param {boolean} [props.validateReceiptStatus]
     */
    constructor(props?: {
        transactionId?: TransactionId | undefined;
        includeChildren?: boolean | undefined;
        includeDuplicates?: boolean | undefined;
        validateReceiptStatus?: boolean | undefined;
    });
    /**
     * @private
     * @type {?TransactionId}
     */
    private _transactionId;
    /**
     * @private
     * @type {?boolean}
     */
    private _includeChildren;
    /**
     * @private
     * @type {?boolean}
     */
    private _includeDuplicates;
    _validateReceiptStatus: boolean;
    /**
     * @returns {?TransactionId}
     */
    get transactionId(): TransactionId | null;
    /**
     * Set the transaction ID for which the record is being requested.
     *
     * @param {TransactionId | string} transactionId
     * @returns {TransactionRecordQuery}
     */
    setTransactionId(transactionId: TransactionId | string): TransactionRecordQuery;
    /**
     * @param {boolean} includeChildren
     * @returns {TransactionRecordQuery}
     */
    setIncludeChildren(includeChildren: boolean): TransactionRecordQuery;
    /**
     * @returns {boolean}
     */
    get includeChildren(): boolean;
    /**
     * @param {boolean} includeDuplicates
     * @returns {TransactionRecordQuery}
     */
    setIncludeDuplicates(includeDuplicates: boolean): TransactionRecordQuery;
    _duplicates: boolean | undefined;
    /**
     * @returns {boolean}
     */
    get includeDuplicates(): boolean;
    /**
     * @param {boolean} validateReceiptStatus
     * @returns {this}
     */
    setValidateReceiptStatus(validateReceiptStatus: boolean): this;
    /**
     * @returns {boolean}
     */
    get validateReceiptStatus(): boolean;
}
export type Channel = import("../channel/Channel.js").default;
export type Client = import("../client/Client.js").default<any, any>;
export type AccountId = import("../account/AccountId.js").default;
import TransactionRecord from "./TransactionRecord.js";
import Query from "../query/Query.js";
import TransactionId from "./TransactionId.js";
import * as HieroProto from "@hashgraph/proto";
