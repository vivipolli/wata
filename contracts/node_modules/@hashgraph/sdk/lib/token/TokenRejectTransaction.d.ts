/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITokenRejectTransactionBody} HieroProto.proto.ITokenRejectTransactionBody
 * @typedef {import("@hashgraph/proto").proto.TokenReference} HieroProto.proto.TokenReference
 */
/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../token/TokenId.js").default} TokenId
 * @typedef {import("../token/NftId.js").default} NftId
 */
/**
 * Reject a new Hedera™ crypto-currency token.
 */
export default class TokenRejectTransaction extends Transaction {
    /**
     * @internal
     * @param {HieroProto.proto.ITransaction[]} transactions
     * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {TokenRejectTransaction}
     */
    static _fromProtobuf(transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): TokenRejectTransaction;
    /**
     *
     * @param {object} [props]
     * @param {?AccountId} [props.owner]
     * @param {NftId[]} [props.nftIds]
     * @param {TokenId[]} [props.tokenIds]
     */
    constructor(props?: {
        owner?: AccountId | null | undefined;
        nftIds?: import("../token/NftId.js").default[] | undefined;
        tokenIds?: import("../token/TokenId.js").default[] | undefined;
    });
    /**
     * @private
     * @type {?AccountId}
     */
    private _owner;
    /**
     * @private
     * @type {TokenId[]}
     */
    private _tokenIds;
    /**
     * @private
     * @type {NftId[]}
     */
    private _nftIds;
    /**
     * @returns {TokenId[]}
     */
    get tokenIds(): TokenId[];
    /**
     * @param {TokenId[]} tokenIds
     * @returns {this}
     */
    setTokenIds(tokenIds: TokenId[]): this;
    /**
     * @param {TokenId} tokenId
     * @returns {this}
     */
    addTokenId(tokenId: TokenId): this;
    /**
     * @returns {NftId[]}
     *
     */
    get nftIds(): NftId[];
    /**
     *
     * @param {NftId[]} nftIds
     * @returns {this}
     */
    setNftIds(nftIds: NftId[]): this;
    /**
     * @param {NftId} nftId
     * @returns {this}
     */
    addNftId(nftId: NftId): this;
    /**
     * @returns {?AccountId}
     */
    get ownerId(): AccountId | null;
    /**
     * @param {AccountId} owner
     * @returns {this}
     */
    setOwnerId(owner: AccountId): this;
    /**
     * @returns {HieroProto.proto.ITokenRejectTransactionBody}
     */
    _makeTransactionData(): HieroProto.proto.ITokenRejectTransactionBody;
}
export namespace HieroProto {
    namespace proto {
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
        type ISignedTransaction = import("@hashgraph/proto").proto.ISignedTransaction;
        type ITransactionBody = import("@hashgraph/proto").proto.ITransactionBody;
        type ITransactionResponse = import("@hashgraph/proto").proto.ITransactionResponse;
        type TransactionBody = import("@hashgraph/proto").proto.TransactionBody;
        type ITokenRejectTransactionBody = import("@hashgraph/proto").proto.ITokenRejectTransactionBody;
        type TokenReference = import("@hashgraph/proto").proto.TokenReference;
    }
}
export type Channel = import("../channel/Channel.js").default;
export type Client = import("../client/Client.js").default<any, any>;
export type TransactionId = import("../transaction/TransactionId.js").default;
export type TokenId = import("../token/TokenId.js").default;
export type NftId = import("../token/NftId.js").default;
import Transaction from "../transaction/Transaction.js";
import AccountId from "../account/AccountId.js";
