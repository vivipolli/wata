/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITimestamp} HieroProto.proto.ITimestamp
 */
/**
 * @namespace com
 * @typedef {import("@hashgraph/proto").com.hedera.mirror.api.proto.IConsensusTopicResponse} com.hedera.mirror.api.proto.IConsensusTopicResponse
 */
export default class TopicMessageChunk {
    /**
     * @internal
     * @param {com.hedera.mirror.api.proto.IConsensusTopicResponse} response
     * @returns {TopicMessageChunk}
     */
    static _fromProtobuf(response: com.hedera.mirror.api.proto.IConsensusTopicResponse): TopicMessageChunk;
    /**
     * @private
     * @param {object} props
     * @param {Timestamp} props.consensusTimestamp
     * @param {Uint8Array} props.contents
     * @param {Uint8Array} props.runningHash
     * @param {Long} props.sequenceNumber
     */
    private constructor();
    /** @readonly */
    readonly consensusTimestamp: Timestamp;
    /** @readonly */
    readonly contents: Uint8Array<ArrayBufferLike>;
    /** @readonly */
    readonly runningHash: Uint8Array<ArrayBufferLike>;
    /** @readonly */
    readonly sequenceNumber: Long;
    /**
     * @internal
     * @returns {com.hedera.mirror.api.proto.IConsensusTopicResponse}
     */
    _toProtobuf(): com.hedera.mirror.api.proto.IConsensusTopicResponse;
}
export namespace HieroProto {
    namespace proto {
        type ITimestamp = import("@hashgraph/proto").proto.ITimestamp;
    }
}
export namespace com {
    namespace hedera {
        namespace mirror {
            namespace api {
                namespace proto {
                    type IConsensusTopicResponse = import("@hashgraph/proto").com.hedera.mirror.api.proto.IConsensusTopicResponse;
                }
            }
        }
    }
}
import Timestamp from "../Timestamp.js";
import Long from "long";
