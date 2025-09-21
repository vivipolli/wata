/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.ITokenUpdateNftsTransactionBody} HieroProto.proto.ITokenUpdateNftsTransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HieroProto.proto.ITokenID
 */
/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../account/AccountId.js").default} AccountId
 */
/**
 * At consensus, updates an already created Non Fungible Token to the given values.
 *
 * If no value is given for a field, that field is left unchanged.
 * Only certain fields such as metadata can be updated.
 *
 * Updating the metadata of an NFT does not affect its ownership or transferability.
 * This operation is intended for updating attributes of individual NFTs in a collection.
 */
export default class TokenUpdateNftsTransaction extends Transaction {
    /**
     * @internal
     * @param {HieroProto.proto.ITransaction[]} transactions
     * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {TokenUpdateNftsTransaction}
     */
    static _fromProtobuf(transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): TokenUpdateNftsTransaction;
    /**
     * @param {object} [props]
     * @param {TokenId | string} [props.tokenId]
     * @param {Long[]} [props.serialNumbers]
     * @param {?Uint8Array} [props.metadata]
     */
    constructor(props?: {
        tokenId?: string | TokenId | undefined;
        serialNumbers?: import("long")[] | undefined;
        metadata?: Uint8Array<ArrayBufferLike> | null | undefined;
    });
    /**
     * @private
     * @type {?TokenId}
     */
    private _tokenId;
    /**
     * @private
     * @type {?Long[]}
     */
    private _serialNumbers;
    /**
     * @private
     * @type {?Uint8Array}
     */
    private _metadata;
    /**
     * @description Assign the token id.
     * @param {TokenId | string} tokenId
     * @returns {this}
     */
    setTokenId(tokenId: TokenId | string): this;
    /**
     * @description Assign the list of serial numbers.
     * @param {Long[]} serialNumbers
     * @returns {this}
     */
    setSerialNumbers(serialNumbers: Long[]): this;
    /**
     * @param {Uint8Array} metadata
     * @returns {this}
     */
    setMetadata(metadata: Uint8Array): this;
    /**
     * @override
     * @protected
     * @returns {HieroProto.proto.ITokenUpdateNftsTransactionBody}
     */
    protected override _makeTransactionData(): HieroProto.proto.ITokenUpdateNftsTransactionBody;
}
export namespace HieroProto {
    namespace proto {
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
        type ISignedTransaction = import("@hashgraph/proto").proto.ISignedTransaction;
        type TransactionBody = import("@hashgraph/proto").proto.TransactionBody;
        type ITransactionBody = import("@hashgraph/proto").proto.ITransactionBody;
        type ITransactionResponse = import("@hashgraph/proto").proto.ITransactionResponse;
        type ITokenUpdateNftsTransactionBody = import("@hashgraph/proto").proto.ITokenUpdateNftsTransactionBody;
        type ITokenID = import("@hashgraph/proto").proto.ITokenID;
    }
}
export type Channel = import("../channel/Channel.js").default;
export type Client = import("../client/Client.js").default<any, any>;
export type TransactionId = import("../transaction/TransactionId.js").default;
export type AccountId = import("../account/AccountId.js").default;
import Transaction from "../transaction/Transaction.js";
import TokenId from "./TokenId.js";
