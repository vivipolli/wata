/**
 * @typedef {import("../account/AccountId.js").default} AccountId
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */
/**
 * Get the receipt of a transaction, given its transaction ID.
 *
 * <p>Once a transaction reaches consensus, then information about whether it succeeded or failed
 * will be available until the end of the receipt period.
 *
 * <p>This query is free.
 * @augments {Query<TransactionReceipt>}
 */
export default class TransactionReceiptQuery extends Query<TransactionReceipt> {
    /**
     * @internal
     * @param {HieroProto.proto.IQuery} query
     * @returns {TransactionReceiptQuery}
     */
    static _fromProtobuf(query: HieroProto.proto.IQuery): TransactionReceiptQuery;
    /**
     * @param {object} [props]
     * @param {TransactionId | string} [props.transactionId]
     * @param {boolean} [props.includeDuplicates]
     * @param {boolean} [props.includeChildren]
     * @param {boolean} [props.validateStatus]
     */
    constructor(props?: {
        transactionId?: string | TransactionId | undefined;
        includeDuplicates?: boolean | undefined;
        includeChildren?: boolean | undefined;
        validateStatus?: boolean | undefined;
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
    _validateStatus: boolean;
    /**
     * @returns {?TransactionId}
     */
    get transactionId(): TransactionId | null;
    /**
     * Set the transaction ID for which the receipt is being requested.
     *
     * @param {TransactionId | string} transactionId
     * @returns {this}
     */
    setTransactionId(transactionId: TransactionId | string): this;
    /**
     * @param {boolean} includeDuplicates
     * @returns {TransactionReceiptQuery}
     */
    setIncludeDuplicates(includeDuplicates: boolean): TransactionReceiptQuery;
    /**
     * @returns {boolean}
     */
    get includeDuplicates(): boolean;
    /**
     * @param {boolean} includeChildren
     * @returns {TransactionReceiptQuery}
     */
    setIncludeChildren(includeChildren: boolean): TransactionReceiptQuery;
    /**
     * @returns {boolean}
     */
    get includeChildren(): boolean;
    /**
     * @param {boolean} validateStatus
     * @returns {this}
     */
    setValidateStatus(validateStatus: boolean): this;
    /**
     * @returns {boolean}
     */
    get validateStatus(): boolean;
}
export type AccountId = import("../account/AccountId.js").default;
export type Channel = import("../channel/Channel.js").default;
export type Client = import("../client/Client.js").default<any, any>;
import TransactionReceipt from "./TransactionReceipt.js";
import Query from "../query/Query.js";
import TransactionId from "./TransactionId.js";
import * as HieroProto from "@hashgraph/proto";
