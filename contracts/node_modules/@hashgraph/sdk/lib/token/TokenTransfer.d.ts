/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenTransferList} HieroProto.proto.ITokenTransferList
 * @typedef {import("@hashgraph/proto").proto.IAccountAmount} HieroProto.proto.IAccountAmount
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HieroProto.proto.ITokenID
 */
/**
 * @typedef {import("bignumber.js").default} BigNumber
 */
/**
 * @typedef {object} TokenTransferJSON
 * @property {string} tokenId
 * @property {string} accountId
 * @property {?number} expectedDecimals
 * @property {string} amount
 * @property {boolean} isApproved
 */
/**
 * An account, and the amount that it sends or receives during a cryptocurrency tokentransfer.
 */
export default class TokenTransfer {
    /**
     * @internal
     * @param {HieroProto.proto.ITokenTransferList[]} tokenTransfers
     * @returns {TokenTransfer[]}
     */
    static _fromProtobuf(tokenTransfers: HieroProto.proto.ITokenTransferList[]): TokenTransfer[];
    /**
     * @internal
     * @param {object} props
     * @param {TokenId | string} props.tokenId
     * @param {AccountId | string} props.accountId
     * @param {number | null} props.expectedDecimals
     * @param {Long | number} props.amount
     * @param {boolean} props.isApproved
     */
    constructor(props: {
        tokenId: TokenId | string;
        accountId: AccountId | string;
        expectedDecimals: number | null;
        amount: Long | number;
        isApproved: boolean;
    });
    /**
     * The Token ID that sends or receives cryptocurrency.
     *
     * @readonly
     */
    readonly tokenId: TokenId;
    /**
     * The Account ID that sends or receives cryptocurrency.
     *
     * @readonly
     */
    readonly accountId: AccountId;
    expectedDecimals: number | null;
    amount: Long;
    isApproved: boolean;
    /**
     * @internal
     * @returns {HieroProto.proto.IAccountAmount}
     */
    _toProtobuf(): HieroProto.proto.IAccountAmount;
    /**
     * @returns {TokenTransferJSON}
     */
    toJSON(): TokenTransferJSON;
    /**
     * @returns {string}
     */
    toString(): string;
}
export namespace HieroProto {
    namespace proto {
        type ITokenTransferList = import("@hashgraph/proto").proto.ITokenTransferList;
        type IAccountAmount = import("@hashgraph/proto").proto.IAccountAmount;
        type IAccountID = import("@hashgraph/proto").proto.IAccountID;
        type ITokenID = import("@hashgraph/proto").proto.ITokenID;
    }
}
export type BigNumber = import("bignumber.js").default;
export type TokenTransferJSON = {
    tokenId: string;
    accountId: string;
    expectedDecimals: number | null;
    amount: string;
    isApproved: boolean;
};
import TokenId from "./TokenId.js";
import AccountId from "../account/AccountId.js";
import Long from "long";
