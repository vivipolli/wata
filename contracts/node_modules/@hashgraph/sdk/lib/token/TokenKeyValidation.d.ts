/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.TokenKeyValidation} HieroProto.proto.TokenKeyValidation
 */
/** Types of validation strategies for token keys. */
declare class TokenKeyValidation {
    /**
     * @internal
     * @param {number} code
     * @returns {TokenKeyValidation}
     */
    static _fromCode(code: number): TokenKeyValidation;
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
     * @returns {HieroProto.proto.TokenKeyValidation}
     */
    valueOf(): HieroProto.proto.TokenKeyValidation;
}
declare namespace TokenKeyValidation {
    let FullValidation: TokenKeyValidation;
    let NoValidation: TokenKeyValidation;
}
export default TokenKeyValidation;
export namespace HieroProto {
    namespace proto {
        type TokenKeyValidation = import("@hashgraph/proto").proto.TokenKeyValidation;
    }
}
