/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IConsensusSubmitMessageTransactionBody} HieroProto.proto.IConsensusSubmitMessageTransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.IConsensusMessageChunkInfo} HieroProto.proto.IConsensusMessageChunkInfo
 * @typedef {import("@hashgraph/proto").proto.IFixedFee} HieroProto.proto.IFixedFee
 * @typedef {import("@hashgraph/proto").proto.ICustomFeeLimit} HieroProto.proto.ICustomFeeLimit
 */
/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../token/CustomFixedFee.js").default} CustomFixedFee
 * @typedef {import("../account/AccountId.js").default} AccountId
 * @typedef {import("../transaction/TransactionResponse.js").default} TransactionResponse
 * @typedef {import("../schedule/ScheduleCreateTransaction.js").default} ScheduleCreateTransaction
 * @typedef {import("../transaction/CustomFeeLimit.js").default} CustomFeeLimit
 */
/**
 * <p>
 * Valid and authorized messages on valid topics will be ordered by the
 * consensus service, published in the block stream, and available to all
 * subscribers on this topic via the mirror nodes.<br/>
 * If this transaction succeeds the resulting TransactionReceipt SHALL
 * contain the latest topicSequenceNumber and topicRunningHash for the
 * topic.<br/>
 * If the topic has a `submitKey` then that key MUST sign this
 * transaction.<br/>
 */
export default class TopicMessageSubmitTransaction extends Transaction {
    /**
     * @internal
     * @param {HieroProto.proto.ITransaction[]} transactions
     * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {TopicMessageSubmitTransaction}
     */
    static _fromProtobuf(transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): TopicMessageSubmitTransaction;
    /**
     * @param {object} props
     * @param {TopicId | string} [props.topicId]
     * @param {Uint8Array | string} [props.message]
     * @param {number} [props.maxChunks]
     * @param {number} [props.chunkSize]
     */
    constructor(props?: {
        topicId?: string | TopicId | undefined;
        message?: string | Uint8Array<ArrayBufferLike> | undefined;
        maxChunks?: number | undefined;
        chunkSize?: number | undefined;
    });
    /**
     * @private
     * @type {?TopicId}
     */
    private _topicId;
    /**
     * @private
     * @type {?Uint8Array}
     */
    private _message;
    /**
     * @private
     * @type {number}
     * The maximum number of chunks a topic message can be split into.
     * Default max chunk size: 20
     * This value can be overridden with `setMaxChunks`
     */
    private _maxChunks;
    /**
     * @private
     * @type {number}
     * The size of each chunk for a given topic message in bytes.
     */
    private _chunkSize;
    /** @type {HieroProto.proto.IConsensusMessageChunkInfo | null} */
    _chunkInfo: HieroProto.proto.IConsensusMessageChunkInfo | null;
    /**
     * @returns {?TopicId}
     */
    get topicId(): TopicId | null;
    /**
     * @param {TopicId | string} topicId
     * @returns {this}
     */
    setTopicId(topicId: TopicId | string): this;
    /**
     * @deprecated  - Use `getMessage()` instead
     * @returns {?Uint8Array}
     */
    get message(): Uint8Array | null;
    /**
     * @returns {?Uint8Array}
     */
    getMessage(): Uint8Array | null;
    /**
     * @param {string | Uint8Array} message
     * @returns {this}
     */
    setMessage(message: string | Uint8Array): this;
    /**
     * Gets the maximum custom fee that the user is willing to pay for the message.
     * @returns {CustomFeeLimit[]}
     */
    getCustomFeeLimits(): CustomFeeLimit[];
    /**
     * Sets the maximum custom fee that the user is willing to pay for message submission.
     * @param {CustomFeeLimit[]} customFeeLimits
     * @returns {this}
     */
    setCustomFeeLimits(customFeeLimits: CustomFeeLimit[]): this;
    /**
     * Adds a maximum custom fee that the user is willing to pay for message submission.
     * @param {CustomFeeLimit} customFeeLimit
     * @returns {this}
     */
    addCustomFeeLimit(customFeeLimit: CustomFeeLimit): this;
    /**
     * @deprecated  - Use `getMaxChunks()` instead
     * @returns {?number}
     */
    get maxChunks(): number | null;
    /**
     * @returns {?number}
     */
    getMaxChunks(): number | null;
    /**
     * @param {number} maxChunks
     * @returns {this}
     */
    setMaxChunks(maxChunks: number): this;
    /**
     * @deprecated  - Use `getChunkSize()` instead
     * @returns {?number}
     */
    get chunkSize(): number | null;
    /**
     * @returns {?number}
     */
    getChunkSize(): number | null;
    /**
     * @param {number} chunkSize
     * @returns {this}
     */
    setChunkSize(chunkSize: number): this;
    /**
     * Freeze this transaction from further modification to prepare for
     * signing or serialization.
     *
     * Will use the `Client`, if available, to generate a default Transaction ID and select 1/3
     * nodes to prepare this transaction for.
     *
     * @param {?import("../client/Client.js").default<Channel, *>} client
     * @returns {this}
     */
    freezeWith(client: import("../client/Client.js").default<Channel, any> | null): this;
    /**
     * @param {import("../client/Client.js").default<Channel, *>} client
     * @param {number=} requestTimeout
     * @returns {Promise<TransactionResponse>}
     */
    execute(client: import("../client/Client.js").default<Channel, any>, requestTimeout?: number | undefined): Promise<TransactionResponse>;
    /**
     * @param {import("../client/Client.js").default<Channel, *>} client
     * @param {number=} requestTimeout
     * @returns {Promise<TransactionResponse[]>}
     */
    executeAll(client: import("../client/Client.js").default<Channel, any>, requestTimeout?: number | undefined): Promise<TransactionResponse[]>;
    /**
     * @override
     * @protected
     * @returns {HieroProto.proto.IConsensusSubmitMessageTransactionBody}
     */
    protected override _makeTransactionData(): HieroProto.proto.IConsensusSubmitMessageTransactionBody;
}
export namespace HieroProto {
    namespace proto {
        type IConsensusSubmitMessageTransactionBody = import("@hashgraph/proto").proto.IConsensusSubmitMessageTransactionBody;
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
        type ISignedTransaction = import("@hashgraph/proto").proto.ISignedTransaction;
        type TransactionBody = import("@hashgraph/proto").proto.TransactionBody;
        type ITransactionBody = import("@hashgraph/proto").proto.ITransactionBody;
        type ITransactionResponse = import("@hashgraph/proto").proto.ITransactionResponse;
        type IConsensusMessageChunkInfo = import("@hashgraph/proto").proto.IConsensusMessageChunkInfo;
        type IFixedFee = import("@hashgraph/proto").proto.IFixedFee;
        type ICustomFeeLimit = import("@hashgraph/proto").proto.ICustomFeeLimit;
    }
}
export type Channel = import("../channel/Channel.js").default;
export type CustomFixedFee = import("../token/CustomFixedFee.js").default;
export type AccountId = import("../account/AccountId.js").default;
export type TransactionResponse = import("../transaction/TransactionResponse.js").default;
export type ScheduleCreateTransaction = import("../schedule/ScheduleCreateTransaction.js").default;
export type CustomFeeLimit = import("../transaction/CustomFeeLimit.js").default;
import Transaction from "../transaction/Transaction.js";
import TopicId from "./TopicId.js";
import TransactionId from "../transaction/TransactionId.js";
