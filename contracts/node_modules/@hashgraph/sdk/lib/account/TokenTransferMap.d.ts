/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenTransferList} HieroProto.proto.ITokenTransferList
 * @typedef {import("@hashgraph/proto").proto.IAccountAmount} HieroProto.proto.IAccountAmount
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HieroProto.proto.ITokenID
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 */
/**
 * @augments {ObjectMap<TokenId, TokenTransferAccountMap>}
 */
export default class TokenTransferMap extends ObjectMap<TokenId, TokenTransferAccountMap> {
    /**
     * @param {HieroProto.proto.ITokenTransferList[]} transfers
     * @returns {TokenTransferMap}
     */
    static _fromProtobuf(transfers: HieroProto.proto.ITokenTransferList[]): TokenTransferMap;
    constructor();
    /**
     * @internal
     * @param {TokenId} tokenId
     * @param {AccountId} accountId
     * @param {Long} amount
     */
    __set(tokenId: TokenId, accountId: AccountId, amount: Long): void;
    /**
     * @returns {HieroProto.proto.ITokenTransferList[]}
     */
    _toProtobuf(): HieroProto.proto.ITokenTransferList[];
}
export namespace HieroProto {
    namespace proto {
        type ITokenTransferList = import("@hashgraph/proto").proto.ITokenTransferList;
        type IAccountAmount = import("@hashgraph/proto").proto.IAccountAmount;
        type ITokenID = import("@hashgraph/proto").proto.ITokenID;
        type IAccountID = import("@hashgraph/proto").proto.IAccountID;
    }
}
import TokenId from "../token/TokenId.js";
import TokenTransferAccountMap from "./TokenTransferAccountMap.js";
import ObjectMap from "../ObjectMap.js";
import AccountId from "../account/AccountId.js";
