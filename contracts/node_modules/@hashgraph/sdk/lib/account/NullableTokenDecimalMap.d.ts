/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenBalance} HieroProto.proto.ITokenBalance
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HieroProto.proto.ITokenID
 */
/**
 * @augments {ObjectMap<TokenId, number | null>}
 */
export default class NullableTokenDecimalMap extends ObjectMap<TokenId, number | null> {
    constructor();
}
export namespace HieroProto {
    namespace proto {
        type ITokenBalance = import("@hashgraph/proto").proto.ITokenBalance;
        type ITokenID = import("@hashgraph/proto").proto.ITokenID;
    }
}
import TokenId from "../token/TokenId.js";
import ObjectMap from "../ObjectMap.js";
