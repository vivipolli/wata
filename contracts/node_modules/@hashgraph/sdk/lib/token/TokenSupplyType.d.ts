/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.TokenSupplyType} HieroProto.proto.TokenSupplyType
 */
declare class TokenSupplyType {
    /**
     * @internal
     * @param {number} code
     * @returns {TokenSupplyType}
     */
    static _fromCode(code: number): TokenSupplyType;
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
     * @returns {HieroProto.proto.TokenSupplyType}
     */
    valueOf(): HieroProto.proto.TokenSupplyType;
}
declare namespace TokenSupplyType {
    let Infinite: TokenSupplyType;
    let Finite: TokenSupplyType;
}
export default TokenSupplyType;
export namespace HieroProto {
    namespace proto {
        type TokenSupplyType = import("@hashgraph/proto").proto.TokenSupplyType;
    }
}
