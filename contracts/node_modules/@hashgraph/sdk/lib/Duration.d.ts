/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IDuration} HieroProto.proto.IDuration
 */
/**
 * A duration type.
 *
 * The main point of this tyope is for encapsulating the `[to|from]Protobuf()` implementations
 */
export default class Duration {
    /**
     * @internal
     * @param {HieroProto.proto.IDuration} duration
     * @returns {Duration}
     */
    static _fromProtobuf(duration: HieroProto.proto.IDuration): Duration;
    /**
     * @param {Long | number} seconds
     */
    constructor(seconds: Long | number);
    /**
     * @readonly
     * @type {Long}
     */
    readonly seconds: Long;
    /**
     * @internal
     * @returns {HieroProto.proto.IDuration}
     */
    _toProtobuf(): HieroProto.proto.IDuration;
}
export namespace HieroProto {
    namespace proto {
        type IDuration = import("@hashgraph/proto").proto.IDuration;
    }
}
import Long from "long";
