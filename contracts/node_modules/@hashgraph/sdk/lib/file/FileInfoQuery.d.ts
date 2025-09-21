/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IQuery} HieroProto.proto.IQuery
 * @typedef {import("@hashgraph/proto").proto.IQueryHeader} HieroProto.proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").proto.IResponse} HieroProto.proto.IResponse
 * @typedef {import("@hashgraph/proto").proto.IResponseHeader} HieroProto.proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").proto.IFileGetInfoQuery} HieroProto.proto.IFileGetInfoQuery
 * @typedef {import("@hashgraph/proto").proto.IFileGetInfoResponse} HieroProto.proto.IFileGetInfoResponse
 * @typedef {import("@hashgraph/proto").proto.FileGetInfoResponse.IFileInfo} HieroProto.proto.IFileInfo
 */
/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../account/AccountId.js").default} AccountId
 */
/**
 * @augments {Query<FileInfo>}
 * Retrieve the metadata for a file in HFS.<br/>
 * Note that this query does not retrieve the file _content_.
 */
export default class FileInfoQuery extends Query<FileInfo> {
    /**
     * @internal
     * @param {HieroProto.proto.IQuery} query
     * @returns {FileInfoQuery}
     */
    static _fromProtobuf(query: HieroProto.proto.IQuery): FileInfoQuery;
    /**
     * @param {object} [props]
     * @param {FileId | string} [props.fileId]
     */
    constructor(props?: {
        fileId?: string | FileId | undefined;
    });
    /**
     * @type {?FileId}
     * @private
     */
    private _fileId;
    /**
     * @returns {?FileId}
     */
    get fileId(): FileId | null;
    /**
     * Set the file ID for which the info is being requested.
     *
     * @param {FileId | string} fileId
     * @returns {FileInfoQuery}
     */
    setFileId(fileId: FileId | string): FileInfoQuery;
}
export namespace HieroProto {
    namespace proto {
        type IQuery = import("@hashgraph/proto").proto.IQuery;
        type IQueryHeader = import("@hashgraph/proto").proto.IQueryHeader;
        type IResponse = import("@hashgraph/proto").proto.IResponse;
        type IResponseHeader = import("@hashgraph/proto").proto.IResponseHeader;
        type IFileGetInfoQuery = import("@hashgraph/proto").proto.IFileGetInfoQuery;
        type IFileGetInfoResponse = import("@hashgraph/proto").proto.IFileGetInfoResponse;
        type IFileInfo = import("@hashgraph/proto").proto.FileGetInfoResponse.IFileInfo;
    }
}
export type Channel = import("../channel/Channel.js").default;
export type Client = import("../client/Client.js").default<any, any>;
export type AccountId = import("../account/AccountId.js").default;
import FileInfo from "./FileInfo.js";
import Query from "../query/Query.js";
import FileId from "./FileId.js";
