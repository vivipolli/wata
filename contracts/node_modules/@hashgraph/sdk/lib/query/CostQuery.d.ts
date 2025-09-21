/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../Status.js").default} Status
 * @typedef {import("../Executable.js").ExecutionState} ExecutionState
 */
/**
 * @template OutputT
 * @augments {QueryBase<HieroProto.proto.IQuery, HieroProto.proto.IResponse, Hbar>}
 */
export default class CostQuery<OutputT> extends QueryBase<HieroProto.proto.IQuery, HieroProto.proto.IResponse, Hbar> {
    /**
     * @param {import("./Query.js").default<OutputT>} query
     */
    constructor(query: import("./Query.js").default<OutputT>);
    _query: import("./Query.js").default<OutputT>;
    /**
     * @type {HieroProto.proto.IQueryHeader | null}
     */
    _header: HieroProto.proto.IQueryHeader | null;
    /**
     * @abstract
     * @protected
     * @param {import("../client/Client.js").default<*, *>} client
     * @returns {Promise<void>}
     */
    protected _beforeExecute(client: import("../client/Client.js").default<any, any>): Promise<void>;
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
export type Status = import("../Status.js").default;
export type ExecutionState = import("../Executable.js").ExecutionState;
import * as HieroProto from "@hashgraph/proto";
import Hbar from "../Hbar.js";
import QueryBase from "./QueryBase.js";
