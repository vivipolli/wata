/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../channel/MirrorChannel.js").default} MirrorChannel
 * @typedef {import("../channel/MirrorChannel.js").MirrorError} MirrorError
 */
/**
 * @template {Channel} ChannelT
 * @typedef {import("../client/Client.js").default<ChannelT, MirrorChannel>} Client<ChannelT, MirrorChannel>
 */
/**
 * Represents a class that you can use to subscribe to
 * different topics on Hedera network.
 * @augments {Query<TopicMessageQuery>}
 */
export default class TopicMessageQuery {
    /**
     * @param {object} props
     * @param {TopicId | string} [props.topicId]
     * @param {Timestamp} [props.startTime]
     * @param {Timestamp} [props.endTime]
     * @param {(message: TopicMessage | null, error: Error)=> void} [props.errorHandler]
     * @param {() => void} [props.completionHandler]
     * @param {(error: MirrorError | Error | null) => boolean} [props.retryHandler]
     * @param {Long | number} [props.limit]
     */
    constructor(props?: {
        topicId?: string | TopicId | undefined;
        startTime?: Timestamp | undefined;
        endTime?: Timestamp | undefined;
        errorHandler?: ((message: TopicMessage | null, error: Error) => void) | undefined;
        completionHandler?: (() => void) | undefined;
        retryHandler?: ((error: MirrorError | Error | null) => boolean) | undefined;
        limit?: number | Long | undefined;
    });
    /**
     * @private
     * @type {?TopicId}
     */
    private _topicId;
    /**
     * @private
     * @type {?Timestamp}
     */
    private _startTime;
    /**
     * @private
     * @type {?Timestamp}
     */
    private _endTime;
    /**
     * @private
     * @type {?Long}
     */
    private _limit;
    /**
     * @private
     * @type {(message: TopicMessage | null, error: Error) => void}
     */
    private _errorHandler;
    _listener: ((message: TopicMessage) => void) | null;
    /**
     * @private
     * @type {() => void}
     */
    private _completionHandler;
    _maxAttempts: number;
    /**
     * This is the request's max backoff
     *
     * @internal
     * @type {number}
     */
    _maxBackoff: number;
    /**
     * @private
     * @type {(error: MirrorError | Error | null) => boolean}
     */
    private _retryHandler;
    /**
     * @private
     * @type {number}
     */
    private _attempt;
    /**
     * @private
     * @type {SubscriptionHandle | null}
     */
    private _handle;
    /**
     * @returns {?TopicId}
     */
    get topicId(): TopicId | null;
    /**
     * @param {TopicId | string} topicId
     * @returns {TopicMessageQuery}
     */
    setTopicId(topicId: TopicId | string): TopicMessageQuery;
    /**
     * @returns {?Timestamp}
     */
    get startTime(): Timestamp | null;
    /**
     * @param {Timestamp | Date | number} startTime
     * @returns {TopicMessageQuery}
     */
    setStartTime(startTime: Timestamp | Date | number): TopicMessageQuery;
    /**
     * @returns {?Timestamp}
     */
    get endTime(): Timestamp | null;
    /**
     * @param {Timestamp | Date | number} endTime
     * @returns {TopicMessageQuery}
     */
    setEndTime(endTime: Timestamp | Date | number): TopicMessageQuery;
    /**
     * @returns {?Long}
     */
    get limit(): Long | null;
    /**
     * @param {Long | number} limit
     * @returns {TopicMessageQuery}
     */
    setLimit(limit: Long | number): TopicMessageQuery;
    /**
     * @param {(message: TopicMessage | null, error: Error)=> void} errorHandler
     * @returns {TopicMessageQuery}
     */
    setErrorHandler(errorHandler: (message: TopicMessage | null, error: Error) => void): TopicMessageQuery;
    /**
     * @param {() => void} completionHandler
     * @returns {TopicMessageQuery}
     */
    setCompletionHandler(completionHandler: () => void): TopicMessageQuery;
    /**
     * @param {number} attempts
     * @returns {this}
     */
    setMaxAttempts(attempts: number): this;
    /**
     * @param {number} backoff
     * @returns {this}
     */
    setMaxBackoff(backoff: number): this;
    /**
     * @param {Client<Channel>} client
     * @param {((message: TopicMessage | null, error: Error) => void) | null} errorHandler
     * @param {(message: TopicMessage) => void} listener
     * @returns {SubscriptionHandle}
     */
    subscribe(client: Client<Channel>, errorHandler: ((message: TopicMessage | null, error: Error) => void) | null, listener: (message: TopicMessage) => void): SubscriptionHandle;
    /**
     * Makes a server stream request to subscribe to topic messages
     * @private
     * @param {Client<Channel>} client
     * @returns {void}
     */
    private _makeServerStreamRequest;
    requireNotSubscribed(): void;
    /**
     * @private
     * @param {TopicMessage} topicMessage
     */
    private _passTopicMessage;
    /**
     * Builds the consensus topic query request
     * @private
     * @returns {Uint8Array} Encoded consensus topic query
     */
    private _buildConsensusRequest;
    /**
     * Handles an incoming message from the topic subscription
     * @private
     * @param {Uint8Array} data - Raw message data
     * @param {Map<string, HieroProto.com.hedera.mirror.api.proto.ConsensusTopicResponse[]>} list
     */
    private _handleMessage;
    /**
     * Handles a chunked message from the topic subscription
     * @private
     * @param {HieroProto.com.hedera.mirror.api.proto.ConsensusTopicResponse} message - The message response
     * @param {Map<string, HieroProto.com.hedera.mirror.api.proto.ConsensusTopicResponse[]>} list
     */
    private _handleChunkedMessage;
    /**
     * Handles errors from the topic subscription
     * @private
     * @param {MirrorError | Error} error - The error that occurred
     * @param {Client<Channel>} client - The client to use for retries
     * @returns {void}
     */
    private _handleError;
    /**
     * Determines if a retry should be attempted
     * @private
     * @param {MirrorError | Error} error - The error to check
     * @returns {boolean} - Whether to retry
     */
    private shouldRetry;
    /**
     * Schedules a retry of the server stream request
     * @private
     * @param {Client<Channel>} client - The client to use for the retry
     * @param {string} errorMessage - The error message for logging
     * @returns {void}
     */
    private _scheduleRetry;
}
export type Channel = import("../channel/Channel.js").default;
export type MirrorChannel = import("../channel/MirrorChannel.js").default;
export type MirrorError = import("../channel/MirrorChannel.js").MirrorError;
/**
 * <ChannelT, MirrorChannel>
 */
export type Client<ChannelT extends Channel> = import("../client/Client.js").default<ChannelT, MirrorChannel>;
import TopicMessage from "./TopicMessage.js";
import TopicId from "./TopicId.js";
import Timestamp from "../Timestamp.js";
import Long from "long";
import SubscriptionHandle from "./SubscriptionHandle.js";
