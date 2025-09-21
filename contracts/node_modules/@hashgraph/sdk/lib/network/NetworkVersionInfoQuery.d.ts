/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IQuery} HieroProto.proto.IQuery
 * @typedef {import("@hashgraph/proto").proto.IQueryHeader} HieroProto.proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").proto.IResponse} HieroProto.proto.IResponse
 * @typedef {import("@hashgraph/proto").proto.IResponseHeader} HieroProto.proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").proto.INetworkGetVersionInfoQuery} HieroProto.proto.INetworkGetVersionInfoQuery
 * @typedef {import("@hashgraph/proto").proto.INetworkGetVersionInfoResponse} HieroProto.proto.INetworkGetVersionInfoResponse
 */
/**
 * @typedef {import("../channel/Channel.js").default} Channel
 */
/**
 *
 * A query to retrieve version information about the Hedera network.
 *
 * This query returns information about the versions of both the Hedera Services software
 * and the protobuf schema in use by the network. This information is useful for ensuring
 * client-network compatibility and debugging version-related issues.
 *
 * @augments {Query<NetworkVersionInfo>}
 */
export default class NetworkVersionInfoQuery extends Query<NetworkVersionInfo> {
    /**
     * @param {HieroProto.proto.IQuery} query
     * @returns {NetworkVersionInfoQuery}
     */
    static _fromProtobuf(query: HieroProto.proto.IQuery): NetworkVersionInfoQuery;
    constructor();
    /**
     * @protected
     * @override
     * @param {HieroProto.proto.IResponse} response
     * @returns {Promise<NetworkVersionInfo>}
     */
    protected override _mapResponse(response: HieroProto.proto.IResponse): Promise<NetworkVersionInfo>;
}
export namespace HieroProto {
    namespace proto {
        type IQuery = import("@hashgraph/proto").proto.IQuery;
        type IQueryHeader = import("@hashgraph/proto").proto.IQueryHeader;
        type IResponse = import("@hashgraph/proto").proto.IResponse;
        type IResponseHeader = import("@hashgraph/proto").proto.IResponseHeader;
        type INetworkGetVersionInfoQuery = import("@hashgraph/proto").proto.INetworkGetVersionInfoQuery;
        type INetworkGetVersionInfoResponse = import("@hashgraph/proto").proto.INetworkGetVersionInfoResponse;
    }
}
export type Channel = import("../channel/Channel.js").default;
import NetworkVersionInfo from "./NetworkVersionInfo.js";
import Query from "../query/Query.js";
