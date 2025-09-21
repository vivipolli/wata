/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IQuery} HieroProto.proto.IQuery
 * @typedef {import("@hashgraph/proto").proto.IQueryHeader} HieroProto.proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").proto.IResponse} HieroProto.proto.IResponse
 * @typedef {import("@hashgraph/proto").proto.IResponseHeader} HieroProto.proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").proto.IConsensusGetTopicInfoResponse} HieroProto.proto.IConsensusGetTopicInfoResponse
 * @typedef {import("@hashgraph/proto").proto.IConsensusGetTopicInfoQuery} HieroProto.proto.IConsensusGetTopicInfoQuery
 */
/**
 * @namespace com
 * @typedef {import("@hashgraph/proto").com.hedera.mirror.api.proto.IConsensusTopicResponse} com.hedera.mirror.api.proto.IConsensusTopicResponse
 */
/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../account/AccountId.js").default} AccountId
 */
/**
 * Retrieve the latest state of a topic.
 *
 * @augments {Query<TopicInfo>}
 */
export default class TopicInfoQuery extends Query<TopicInfo> {
    /**
     * @internal
     * @param {HieroProto.proto.IQuery} query
     * @returns {TopicInfoQuery}
     */
    static _fromProtobuf(query: HieroProto.proto.IQuery): TopicInfoQuery;
    /**
     * @param {object} [props]
     * @param {TopicId | string} [props.topicId]
     */
    constructor(props?: {
        topicId?: string | TopicId | undefined;
    });
    /**
     * @private
     * @type {?TopicId}
     */
    private _topicId;
    /**
     * @returns {?TopicId}
     */
    get topicId(): TopicId | null;
    /**
     * Set the topic ID for which the info is being requested.
     *
     * @param {TopicId | string} topicId
     * @returns {TopicInfoQuery}
     */
    setTopicId(topicId: TopicId | string): TopicInfoQuery;
}
export namespace HieroProto {
    namespace proto {
        type IQuery = import("@hashgraph/proto").proto.IQuery;
        type IQueryHeader = import("@hashgraph/proto").proto.IQueryHeader;
        type IResponse = import("@hashgraph/proto").proto.IResponse;
        type IResponseHeader = import("@hashgraph/proto").proto.IResponseHeader;
        type IConsensusGetTopicInfoResponse = import("@hashgraph/proto").proto.IConsensusGetTopicInfoResponse;
        type IConsensusGetTopicInfoQuery = import("@hashgraph/proto").proto.IConsensusGetTopicInfoQuery;
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
export type Channel = import("../channel/Channel.js").default;
export type Client = import("../client/Client.js").default<any, any>;
export type AccountId = import("../account/AccountId.js").default;
import TopicInfo from "./TopicInfo.js";
import Query from "../query/Query.js";
import TopicId from "./TopicId.js";
