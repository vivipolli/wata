/**
 * Response when the client sends the node CryptoGetVersionInfoQuery.
 */
export default class NetworkVersionInfo {
    /**
     * @internal
     * @param {HieroProto.proto.INetworkGetVersionInfoResponse} info
     * @returns {NetworkVersionInfo}
     */
    static _fromProtobuf(info: HieroProto.proto.INetworkGetVersionInfoResponse): NetworkVersionInfo;
    /**
     * @param {Uint8Array} bytes
     * @returns {NetworkVersionInfo}
     */
    static fromBytes(bytes: Uint8Array): NetworkVersionInfo;
    /**
     * @private
     * @param {object} props
     * @param {SemanticVersion} props.protobufVersion
     * @param {SemanticVersion} props.servicesVersion
     */
    private constructor();
    /**
     * The account ID for which this information applies.
     *
     * @readonly
     */
    readonly protobufVersion: SemanticVersion;
    /**
     * The account ID for which this information applies.
     *
     * @readonly
     */
    readonly servicesVersion: SemanticVersion;
    /**
     * @internal
     * @returns {HieroProto.proto.INetworkGetVersionInfoResponse}
     */
    _toProtobuf(): HieroProto.proto.INetworkGetVersionInfoResponse;
    /**
     * @returns {Uint8Array}
     */
    toBytes(): Uint8Array;
}
import SemanticVersion from "./SemanticVersion.js";
import * as HieroProto from "@hashgraph/proto";
