/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IGrantedTokenAllowance} HieroProto.proto.IGrantedTokenAllowance
 * @typedef {import("@hashgraph/proto").proto.ITokenAllowance} HieroProto.proto.ITokenAllowance
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HieroProto.proto.ITokenID
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 */
/**
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */
/**
 * Represents a token allowance granted to a spender account by an owner account.
 *
 * The `TokenAllowance` class manages the permissions for one account to spend a specified
 * amount of tokens on behalf of another account. It includes details about the token, the
 * spender, the owner, and the amount allowed.
 */
export default class TokenAllowance {
    /**
     * @internal
     * @param {HieroProto.proto.ITokenAllowance} allowance
     * @returns {TokenAllowance}
     */
    static _fromProtobuf(allowance: HieroProto.proto.ITokenAllowance): TokenAllowance;
    /**
     * @internal
     * @param {HieroProto.proto.IGrantedTokenAllowance} allowance
     * @param {AccountId} ownerAccountId
     * @returns {TokenAllowance}
     */
    static _fromGrantedProtobuf(allowance: HieroProto.proto.IGrantedTokenAllowance, ownerAccountId: AccountId): TokenAllowance;
    /**
     * @internal
     * @param {object} props
     * @param {TokenId} props.tokenId
     * @param {AccountId | null} props.spenderAccountId
     * @param {AccountId | null} props.ownerAccountId
     * @param {Long | null} props.amount
     */
    constructor(props: {
        tokenId: TokenId;
        spenderAccountId: AccountId | null;
        ownerAccountId: AccountId | null;
        amount: Long | null;
    });
    /**
     * The token that the allowance pertains to.
     *
     * @readonly
     */
    readonly tokenId: TokenId;
    /**
     * The account ID of the spender of the hbar allowance.
     *
     * @readonly
     */
    readonly spenderAccountId: AccountId | null;
    /**
     * The account ID of the owner of the hbar allowance.
     *
     * @readonly
     */
    readonly ownerAccountId: AccountId | null;
    /**
     * The current balance of the spender's token allowance.
     * **NOTE**: If `null`, the spender has access to all of the account owner's NFT instances
     * (currently owned and any in the future).
     *
     * @readonly
     */
    readonly amount: Long | null;
    /**
     * @internal
     * @returns {HieroProto.proto.ITokenAllowance}
     */
    _toProtobuf(): HieroProto.proto.ITokenAllowance;
    /**
     * @param {Client} client
     */
    _validateChecksums(client: Client): void;
}
export namespace HieroProto {
    namespace proto {
        type IGrantedTokenAllowance = import("@hashgraph/proto").proto.IGrantedTokenAllowance;
        type ITokenAllowance = import("@hashgraph/proto").proto.ITokenAllowance;
        type ITokenID = import("@hashgraph/proto").proto.ITokenID;
        type IAccountID = import("@hashgraph/proto").proto.IAccountID;
    }
}
export type Client = import("../client/Client.js").default<any, any>;
import TokenId from "../token/TokenId.js";
import AccountId from "./AccountId.js";
import Long from "long";
