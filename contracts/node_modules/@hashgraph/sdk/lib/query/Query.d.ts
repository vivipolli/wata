/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../channel/MirrorChannel.js").default} MirrorChannel
 * @typedef {import("../PublicKey.js").default} PublicKey
 * @typedef {import("../client/Client.js").ClientOperator} ClientOperator
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../logger/Logger.js").default} Logger
 */
/**
 * This registry holds a bunch of callbacks for `fromProtobuf()` implementations
 * Since this is essentially aa cache, perhaps we should move this variable into the `Cache`
 * type for consistency?
 *
 * @type {Map<HieroProto.proto.Query["query"], (query: HieroProto.proto.IQuery) => Query<*>>}
 */
export const QUERY_REGISTRY: Map<HieroProto.proto.Query["query"], (query: HieroProto.proto.IQuery) => Query<any>>;
/**
 * Base class for all queries that can be submitted to Hedera.
 *
 * @abstract
 * @template OutputT
 * @augments {QueryBase<HieroProto.proto.IQuery, HieroProto.proto.IResponse, OutputT>}
 */
export default class Query<OutputT> extends QueryBase<HieroProto.proto.IQuery, HieroProto.proto.IResponse, OutputT> {
    /**
     * Deserialize a query from bytes. The bytes should be a `proto.Query`.
     *
     * @template T
     * @param {Uint8Array} bytes
     * @returns {Query<T>}
     */
    static fromBytes<T>(bytes: Uint8Array): Query<T>;
    constructor();
    /**
     * The payment transaction ID
     *
     * @type {?TransactionId}
     */
    _paymentTransactionId: TransactionId | null;
    /**
     * The payment transactions list where each index points to a different node
     *
     * @type {HieroProto.proto.ITransaction[]}
     */
    _paymentTransactions: HieroProto.proto.ITransaction[];
    /**
     * The amount being paid to the node for this query.
     * A user can set this field explicitly, or we'll query the value during execution.
     *
     * @type {?Hbar}
     */
    _queryPayment: Hbar | null;
    /**
     * The maximum query payment a user is willing to pay. Unlike `Transaction.maxTransactionFee`
     * this field only exists in the SDK; there is no protobuf field equivalent. If and when
     * we query the actual cost of the query and the cost is greater than the max query payment
     * we'll throw a `MaxQueryPaymentExceeded` error.
     *
     * @type {?Hbar}
     */
    _maxQueryPayment: Hbar | null;
    /**
     * This is strictly used for `_getLogId()` which requires a timestamp. The timestamp it typically
     * uses comes from the payment transaction ID, but that field is not set if this query is free.
     * For those occasions we use this timestamp field generated at query construction instead.
     *
     * @type {number}
     */
    _timestamp: number;
    /**
     * Set an explicit payment amount for this query.
     *
     * The client will submit exactly this amount for the payment of this query. Hedera
     * will not return any remainder.
     *
     * @param {Hbar} queryPayment
     * @returns {this}
     */
    setQueryPayment(queryPayment: Hbar): this;
    /**
     * Set the maximum payment allowable for this query.
     *
     * @param {Hbar} maxQueryPayment
     * @returns {this}
     */
    setMaxQueryPayment(maxQueryPayment: Hbar): this;
    /**
     * Fetch the cost of this query from a consensus node
     *
     * @param {import("../client/Client.js").default<Channel, *>} client
     * @returns {Promise<Hbar>}
     */
    getCost(client: import("../client/Client.js").default<Channel, any>): Promise<Hbar>;
    /**
     * Set he payment transaction explicitly
     *
     * @param {TransactionId} paymentTransactionId
     * @returns {this}
     */
    setPaymentTransactionId(paymentTransactionId: TransactionId): this;
    /**
     * Get the payment transaction ID
     *
     * @returns {?TransactionId}
     */
    get paymentTransactionId(): TransactionId | null;
    /**
     * Is payment required for this query. By default most queries require payment
     * so the default implementation returns true.
     *
     * @protected
     * @returns {boolean}
     */
    protected _isPaymentRequired(): boolean;
    /**
     * Validate checksums of the query.
     *
     * @param {Client} client
     */
    _validateChecksums(client: Client): void;
    /**
     * Before we proceed exeuction, we need to do a couple checks
     *
     * @template {MirrorChannel} MirrorChannelT
     * @param {import("../client/Client.js").default<Channel, MirrorChannelT>} client
     * @returns {Promise<void>}
     */
    _beforeExecute<MirrorChannelT extends MirrorChannel>(client: import("../client/Client.js").default<Channel, MirrorChannelT>): Promise<void>;
    /**
     * @abstract
     * @internal
     * @param {HieroProto.proto.IResponse} response
     * @returns {HieroProto.proto.IResponseHeader}
     */
    _mapResponseHeader(response: HieroProto.proto.IResponse): HieroProto.proto.IResponseHeader;
    /**
     * @protected
     * @returns {HieroProto.proto.IQueryHeader}
     */
    protected _makeRequestHeader(): HieroProto.proto.IQueryHeader;
    /**
     * @abstract
     * @internal
     * @param {HieroProto.proto.IQueryHeader} header
     * @returns {HieroProto.proto.IQuery}
     */
    _onMakeRequest(header: HieroProto.proto.IQueryHeader): HieroProto.proto.IQuery;
    /**
     * @internal
     * @returns {HieroProto.proto.IQuery}
     */
    _makeRequest(): HieroProto.proto.IQuery;
    /**
     * @param {HieroProto.proto.Query} request
     * @returns {Uint8Array}
     */
    _requestToBytes(request: HieroProto.proto.Query): Uint8Array;
    /**
     * @param {HieroProto.proto.Response} response
     * @returns {Uint8Array}
     */
    _responseToBytes(response: HieroProto.proto.Response): Uint8Array;
}
export type Channel = import("../channel/Channel.js").default;
export type MirrorChannel = import("../channel/MirrorChannel.js").default;
export type PublicKey = import("../PublicKey.js").default;
export type ClientOperator = import("../client/Client.js").ClientOperator;
export type Client = import("../client/Client.js").default<any, any>;
export type Logger = import("../logger/Logger.js").default;
import * as HieroProto from "@hashgraph/proto";
import QueryBase from "./QueryBase.js";
import TransactionId from "../transaction/TransactionId.js";
import Hbar from "../Hbar.js";
