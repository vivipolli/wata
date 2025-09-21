/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IGrantedNftAllowance} HieroProto.proto.IGrantedNftAllowance
 * @typedef {import("@hashgraph/proto").proto.INftRemoveAllowance} HieroProto.proto.INftRemoveAllowance
 * @typedef {import("@hashgraph/proto").proto.INftAllowance} HieroProto.proto.INftAllowance
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HieroProto.proto.ITokenID
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 */
/**
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */
/**
 * The token that the allowance pertains to.
 */
export default class TokenNftAllowance {
    /**
     * @internal
     * @param {HieroProto.proto.INftAllowance} allowance
     * @returns {TokenNftAllowance}
     */
    static _fromProtobuf(allowance: HieroProto.proto.INftAllowance): TokenNftAllowance;
    /**
     * @internal
     * @param {HieroProto.proto.IGrantedNftAllowance} allowance
     * @param {AccountId} ownerAccountId
     * @returns {TokenNftAllowance}
     */
    static _fromGrantedProtobuf(allowance: HieroProto.proto.IGrantedNftAllowance, ownerAccountId: AccountId): TokenNftAllowance;
    /**
     * @internal
     * @param {HieroProto.proto.INftRemoveAllowance} allowance
     * @returns {TokenNftAllowance}
     */
    static _fromRemoveProtobuf(allowance: HieroProto.proto.INftRemoveAllowance): TokenNftAllowance;
    /**
     * @internal
     * @param {object} props
     * @param {TokenId} props.tokenId
     * @param {AccountId | null} props.spenderAccountId
     * @param {AccountId | null} props.ownerAccountId
     * @param {Long[] | null} props.serialNumbers
     * @param {boolean | null} props.allSerials
     * @param {AccountId | null} props.delegatingSpender
     */
    constructor(props: {
        tokenId: TokenId;
        spenderAccountId: AccountId | null;
        ownerAccountId: AccountId | null;
        serialNumbers: Long[] | null;
        allSerials: boolean | null;
        delegatingSpender: AccountId | null;
    });
    /**
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
    readonly serialNumbers: Long[] | null;
    /**
     * @readonly
     */
    readonly allSerials: boolean | null;
    /**
     * The account ID of the spender who is granted approvedForAll allowance and granting
     * approval on an NFT serial to another spender.
     *
     * @readonly
     */
    readonly delegatingSpender: AccountId | null;
    /**
     * @internal
     * @returns {HieroProto.proto.INftAllowance}
     */
    _toProtobuf(): HieroProto.proto.INftAllowance;
    /**
     * @param {Client} client
     */
    _validateChecksums(client: Client): void;
}
export namespace HieroProto {
    namespace proto {
        type IGrantedNftAllowance = import("@hashgraph/proto").proto.IGrantedNftAllowance;
        type INftRemoveAllowance = import("@hashgraph/proto").proto.INftRemoveAllowance;
        type INftAllowance = import("@hashgraph/proto").proto.INftAllowance;
        type ITokenID = import("@hashgraph/proto").proto.ITokenID;
        type IAccountID = import("@hashgraph/proto").proto.IAccountID;
    }
}
export type Client = import("../client/Client.js").default<any, any>;
import TokenId from "../token/TokenId.js";
import AccountId from "./AccountId.js";
import Long from "long";
