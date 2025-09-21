/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.TokenReference} HieroProto.proto.TokenReference
 */
export default class TokenReference {
    /**
     * @public
     * @param {HieroProto.proto.TokenReference} reference
     * @returns {TokenReference}
     */
    public static _fromProtobuf(reference: HieroProto.proto.TokenReference): TokenReference;
    /**
     * @public
     * @type {?TokenId}
     */
    public fungibleToken: TokenId | null;
    /**
     * @public
     * @type {?NftId}
     */
    public nft: NftId | null;
}
export namespace HieroProto {
    namespace proto {
        type TokenReference = import("@hashgraph/proto").proto.TokenReference;
    }
}
import TokenId from "./TokenId.js";
import NftId from "./NftId.js";
