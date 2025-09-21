/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IServiceEndpoint} HieroProto.proto.IServiceEndpoint
 */
/**
 * @typedef {object} EndPointJson
 * @property {string | null} address
 * @property {string | null} port
 */
export default class EndPoint {
    /**
     * @internal
     * @param {HieroProto.proto.IServiceEndpoint} endpoint
     * @returns {EndPoint}
     */
    static _fromProtobuf(endpoint: HieroProto.proto.IServiceEndpoint): EndPoint;
    /**
     * @param {EndPointJson} json
     * @returns {EndPoint}
     */
    static fromJSON(json: EndPointJson): EndPoint;
    /**
     * @param {object} props
     * @param {IPv4Address | string} [props.address]
     * @param {number} [props.port]
     */
    constructor(props?: {
        address?: string | IPv4Address | undefined;
        port?: number | undefined;
    });
    /**
     * @type {IPv4Address | string | null}
     */
    _address: IPv4Address | string | null;
    /**
     * @type {number | null}
     */
    _port: number | null;
    /**
     * @returns {?IPv4Address | string}
     */
    get address(): (IPv4Address | string) | null;
    /**
     * @param {IPv4Address | string} address
     * @returns {this}
     */
    setAddress(address: IPv4Address | string): this;
    /**
     * @returns {?number}
     */
    get port(): number | null;
    /**
     * @param {number} port
     * @returns {this}
     */
    setPort(port: number): this;
    /**
     * @returns {HieroProto.proto.IServiceEndpoint}
     */
    _toProtobuf(): HieroProto.proto.IServiceEndpoint;
    /**
     * @returns {string}
     */
    toString(): string;
    /**
     * @returns {EndPointJson}
     */
    toJSON(): EndPointJson;
}
export namespace HieroProto {
    namespace proto {
        type IServiceEndpoint = import("@hashgraph/proto").proto.IServiceEndpoint;
    }
}
export type EndPointJson = {
    address: string | null;
    port: string | null;
};
import IPv4Address from "./IPv4Address.js";
