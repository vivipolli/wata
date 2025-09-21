/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.FreezeType} HieroProto.proto.FreezeType
 */
declare class FreezeType {
    /**
     * @internal
     * @param {number} code
     * @returns {FreezeType}
     */
    static _fromCode(code: number): FreezeType;
    /**
     * @hideconstructor
     * @internal
     * @param {number} code
     */
    constructor(code: number);
    /** @readonly */
    readonly _code: number;
    /**
     * @returns {string}
     */
    toString(): string;
    /**
     * @returns {HieroProto.proto.FreezeType}
     */
    valueOf(): HieroProto.proto.FreezeType;
}
declare namespace FreezeType {
    let UnknownFreezeType: FreezeType;
    let FreezeOnly: FreezeType;
    let PrepareUpgrade: FreezeType;
    let FreezeUpgrade: FreezeType;
    let FreezeAbort: FreezeType;
    let TelemetryUpgrade: FreezeType;
}
export default FreezeType;
export namespace HieroProto {
    namespace proto {
        type FreezeType = import("@hashgraph/proto").proto.FreezeType;
    }
}
