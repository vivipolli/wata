/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenBalance} HieroProto.proto.ITokenBalance
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HieroProto.proto.ITokenID
 */
/**
 * @typedef {import("long")} Long
 */
/**
 * @augments {ObjectMap<TokenId, Long>}
 */
export default class TokenBalanceMap extends ObjectMap<TokenId, import("long")> {
    constructor();
}
export namespace HieroProto {
    namespace proto {
        type ITokenBalance = import("@hashgraph/proto").proto.ITokenBalance;
        type ITokenID = import("@hashgraph/proto").proto.ITokenID;
    }
}
export type Long = import("long");
import TokenId from "../token/TokenId.js";
import ObjectMap from "../ObjectMap.js";
