/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.TokenType} HieroProto.proto.TokenType
 */
declare class TokenType {
    /**
     * @internal
     * @param {number} code
     * @returns {TokenType}
     */
    static _fromCode(code: number): TokenType;
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
     * @returns {HieroProto.proto.TokenType}
     */
    valueOf(): HieroProto.proto.TokenType;
}
declare namespace TokenType {
    let FungibleCommon: TokenType;
    let NonFungibleUnique: TokenType;
}
export default TokenType;
export namespace HieroProto {
    namespace proto {
        type TokenType = import("@hashgraph/proto").proto.TokenType;
    }
}
