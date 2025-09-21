/**
 * Current state of a topic.
 */
export default class TopicInfo {
    /**
     * @internal
     * @param {HieroProto.proto.IConsensusGetTopicInfoResponse} infoResponse
     * @returns {TopicInfo}
     */
    static _fromProtobuf(infoResponse: HieroProto.proto.IConsensusGetTopicInfoResponse): TopicInfo;
    /**
     * @param {Uint8Array} bytes
     * @returns {TopicInfo}
     */
    static fromBytes(bytes: Uint8Array): TopicInfo;
    /**
     * @private
     * @param {object} props
     * @param {TopicId} props.topicId
     * @param {string} props.topicMemo
     * @param {Uint8Array} props.runningHash
     * @param {Long} props.sequenceNumber
     * @param {?Timestamp} props.expirationTime
     * @param {?Key} props.adminKey
     * @param {?Key} props.submitKey
     * @param {?Key} props.feeScheduleKey
     * @param {?Key[]} props.feeExemptKeys
     * @param {?Duration} props.autoRenewPeriod
     * @param {?AccountId} props.autoRenewAccountId
     * @param {?CustomFixedFee[]} props.customFees
     * @param {LedgerId|null} props.ledgerId
     */
    private constructor();
    /**
     * The ID of the topic for which information is requested.
     *
     * @readonly
     */
    readonly topicId: TopicId;
    /**
     * Short publicly visible memo about the topic. No guarantee of uniqueness.
     *
     * @readonly
     */
    readonly topicMemo: string;
    /**
     * SHA-384 running hash of (previousRunningHash, topicId, consensusTimestamp, sequenceNumber, message).
     *
     * @readonly
     */
    readonly runningHash: Uint8Array<ArrayBufferLike>;
    /**
     * Sequence number (starting at 1 for the first submitMessage) of messages on the topic.
     *
     * @readonly
     */
    readonly sequenceNumber: Long;
    /**
     * Effective consensus timestamp at (and after) which submitMessage calls will no longer succeed on the topic.
     *
     * @readonly
     */
    readonly expirationTime: Timestamp | null;
    /**
     * Access control for update/delete of the topic. Null if there is no key.
     *
     * @readonly
     */
    readonly adminKey: Key | null;
    /**
     * Access control for ConsensusService.submitMessage. Null if there is no key.
     *
     * @readonly
     */
    readonly submitKey: Key | null;
    /**
     * Access control for updating topic fees. Null If there is no key.
     *
     * @readonly
     */
    readonly feeScheduleKey: Key | null;
    /**
     * The keys that will are exempt from paying fees.
     * @readonly
     */
    readonly feeExemptKeys: Key[] | null;
    /**
     * @readonly
     */
    readonly autoRenewPeriod: Duration | null;
    /**
     * @readonly
     */
    readonly autoRenewAccountId: AccountId | null;
    /**
     * The fixed fees assessed when a message is submitted to the topic.
     * @readonly
     */
    readonly customFees: CustomFixedFee[] | null;
    ledgerId: LedgerId | null;
    /**
     * @internal
     * @returns {HieroProto.proto.IConsensusGetTopicInfoResponse}
     */
    _toProtobuf(): HieroProto.proto.IConsensusGetTopicInfoResponse;
    /**
     * @returns {Uint8Array}
     */
    toBytes(): Uint8Array;
}
import TopicId from "./TopicId.js";
import Long from "long";
import Timestamp from "../Timestamp.js";
import Key from "../Key.js";
import Duration from "../Duration.js";
import AccountId from "../account/AccountId.js";
import CustomFixedFee from "../token/CustomFixedFee.js";
import LedgerId from "../LedgerId.js";
import * as HieroProto from "@hashgraph/proto";
