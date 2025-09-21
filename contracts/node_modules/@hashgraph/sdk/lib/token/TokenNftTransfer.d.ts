/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenTransferList} HieroProto.proto.ITokenTransferList
 * @typedef {import("@hashgraph/proto").proto.IAccountAmount} HieroProto.proto.IAccountAmount
 * @typedef {import("@hashgraph/proto").proto.INftTransfer} HieroProto.proto.INftTransfer
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HieroProto.proto.ITokenID
 */
/**
 * @typedef {import("bignumber.js").default} BigNumber
 */
/**
 * An account, and the amount that it sends or receives during a cryptocurrency tokentransfer.
 */
export default class TokenNftTransfer {
    /**
     * @internal
     * @param {HieroProto.proto.ITokenTransferList[]} tokenTransfers
     * @returns {TokenNftTransfer[]}
     */
    static _fromProtobuf(tokenTransfers: HieroProto.proto.ITokenTransferList[]): TokenNftTransfer[];
    /**
     * @internal
     * @param {object} props
     * @param {TokenId | string} props.tokenId
     * @param {AccountId | string} props.senderAccountId
     * @param {AccountId | string} props.receiverAccountId
     * @param {Long | number} props.serialNumber
     * @param {boolean} props.isApproved
     */
    constructor(props: {
        tokenId: TokenId | string;
        senderAccountId: AccountId | string;
        receiverAccountId: AccountId | string;
        serialNumber: Long | number;
        isApproved: boolean;
    });
    /**
     * The Token ID that sends or receives cryptocurrency.
     */
    tokenId: TokenId;
    /**
     * The Account ID that sends or receives cryptocurrency.
     */
    senderAccountId: AccountId;
    /**
     * The Account ID that sends or receives cryptocurrency.
     */
    receiverAccountId: AccountId;
    serialNumber: Long;
    isApproved: boolean;
    /**
     * @internal
     * @returns {HieroProto.proto.INftTransfer}
     */
    _toProtobuf(): HieroProto.proto.INftTransfer;
}
export namespace HieroProto {
    namespace proto {
        type ITokenTransferList = import("@hashgraph/proto").proto.ITokenTransferList;
        type IAccountAmount = import("@hashgraph/proto").proto.IAccountAmount;
        type INftTransfer = import("@hashgraph/proto").proto.INftTransfer;
        type IAccountID = import("@hashgraph/proto").proto.IAccountID;
        type ITokenID = import("@hashgraph/proto").proto.ITokenID;
    }
}
export type BigNumber = import("bignumber.js").default;
import TokenId from "./TokenId.js";
import AccountId from "../account/AccountId.js";
import Long from "long";
