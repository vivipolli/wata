/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenTransferList} HieroProto.proto.ITokenTransferList
 * @typedef {import("@hashgraph/proto").proto.INftTransfer} HieroProto.proto.INftTransfer
 * @typedef {import("@hashgraph/proto").proto.IAccountAmount} HieroProto.proto.IAccountAmount
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HieroProto.proto.ITokenID
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 */
/**
 * @typedef {object} NftTransfer
 * @property {AccountId} sender
 * @property {AccountId} recipient
 * @property {Long} serial
 * @property {boolean} isApproved
 */
/**
 * @augments {ObjectMap<TokenId, NftTransfer[]>}
 */
export default class TokenNftTransferMap extends ObjectMap<TokenId, NftTransfer[]> {
    /**
     * @param {HieroProto.proto.ITokenTransferList[]} transfers
     * @returns {TokenNftTransferMap}
     */
    static _fromProtobuf(transfers: HieroProto.proto.ITokenTransferList[]): TokenNftTransferMap;
    constructor();
    /**
     * @internal
     * @param {TokenId} tokenId
     * @param {NftTransfer} nftTransfer
     */
    __set(tokenId: TokenId, nftTransfer: NftTransfer): void;
    /**
     * @returns {HieroProto.proto.ITokenTransferList[]}
     */
    _toProtobuf(): HieroProto.proto.ITokenTransferList[];
}
export namespace HieroProto {
    namespace proto {
        type ITokenTransferList = import("@hashgraph/proto").proto.ITokenTransferList;
        type INftTransfer = import("@hashgraph/proto").proto.INftTransfer;
        type IAccountAmount = import("@hashgraph/proto").proto.IAccountAmount;
        type ITokenID = import("@hashgraph/proto").proto.ITokenID;
        type IAccountID = import("@hashgraph/proto").proto.IAccountID;
    }
}
export type NftTransfer = {
    sender: AccountId;
    recipient: AccountId;
    serial: Long;
    isApproved: boolean;
};
import TokenId from "../token/TokenId.js";
import ObjectMap from "../ObjectMap.js";
import AccountId from "../account/AccountId.js";
import Long from "long";
