/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.ICryptoDeleteAllowanceTransactionBody} HieroProto.proto.ICryptoDeleteAllowanceTransactionBody
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 */
/**
 * @typedef {import("./HbarAllowance.js").default} HbarAllowance
 * @typedef {import("./TokenAllowance.js").default} TokenAllowance
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("../long.js").LongObject} LongObject
 */
/**
 * Change properties for the given account.
 */
export default class AccountAllowanceDeleteTransaction extends Transaction {
    /**
     * @internal
     * @param {HieroProto.proto.ITransaction[]} transactions
     * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {AccountAllowanceDeleteTransaction}
     */
    static _fromProtobuf(transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): AccountAllowanceDeleteTransaction;
    /**
     * @param {object} [props]
     * @param {HbarAllowance[]} [props.hbarAllowances]
     * @param {TokenAllowance[]} [props.tokenAllowances]
     * @param {TokenNftAllowance[]} [props.nftAllowances]
     */
    constructor(props?: {
        hbarAllowances?: import("./HbarAllowance.js").default[] | undefined;
        tokenAllowances?: import("./TokenAllowance.js").default[] | undefined;
        nftAllowances?: TokenNftAllowance[] | undefined;
    });
    /**
     * @private
     * @type {TokenNftAllowance[]}
     */
    private _nftAllowances;
    /**
     * @returns {TokenNftAllowance[]}
     */
    get tokenNftAllowanceDeletions(): TokenNftAllowance[];
    /**
     * @description If you want to remove allowance for all serials of a NFT
     *      - use AccountAllowanceApproveTransaction().deleteTokenNftAllowanceAllSerials()
     * @param {NftId | string} nftId
     * @param {AccountId | string} ownerAccountId
     * @returns {AccountAllowanceDeleteTransaction}
     */
    deleteAllTokenNftAllowances(nftId: NftId | string, ownerAccountId: AccountId | string): AccountAllowanceDeleteTransaction;
    /**
     * @override
     * @protected
     * @returns {HieroProto.proto.ICryptoDeleteAllowanceTransactionBody}
     */
    protected override _makeTransactionData(): HieroProto.proto.ICryptoDeleteAllowanceTransactionBody;
}
export namespace HieroProto {
    namespace proto {
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
        type ISignedTransaction = import("@hashgraph/proto").proto.ISignedTransaction;
        type TransactionBody = import("@hashgraph/proto").proto.TransactionBody;
        type ITransactionBody = import("@hashgraph/proto").proto.ITransactionBody;
        type ITransactionResponse = import("@hashgraph/proto").proto.ITransactionResponse;
        type ICryptoDeleteAllowanceTransactionBody = import("@hashgraph/proto").proto.ICryptoDeleteAllowanceTransactionBody;
        type IAccountID = import("@hashgraph/proto").proto.IAccountID;
    }
}
export type HbarAllowance = import("./HbarAllowance.js").default;
export type TokenAllowance = import("./TokenAllowance.js").default;
export type Channel = import("../channel/Channel.js").default;
export type Client = import("../client/Client.js").default<any, any>;
export type TransactionId = import("../transaction/TransactionId.js").default;
export type BigNumber = import("bignumber.js").default;
export type LongObject = import("../long.js").LongObject;
import Transaction from "../transaction/Transaction.js";
import TokenNftAllowance from "./TokenNftAllowance.js";
import NftId from "../token/NftId.js";
import AccountId from "./AccountId.js";
