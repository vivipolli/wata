/**
 * @typedef {import("../long.js").LongObject} LongObject
 * @typedef {import("bignumber.js").default} BigNumber
 */
/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.ICryptoTransferTransactionBody} HieroProto.proto.ICryptoTransferTransactionBody
 */
/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */
/**
 * @typedef {object} TransferTokensInput
 * @property {TokenId | string} tokenId
 * @property {AccountId | string} accountId
 * @property {Long | number} amount
 */
/**
 * @typedef {object} TransferTokenObject
 * @property {TokenId} tokenId
 * @property {AccountId} accountId
 * @property {Long} amount
 */
/**
 * @typedef {object} TransferHbarInput
 * @property {AccountId | string} accountId
 * @property {number | string | Long | BigNumber | Hbar} amount
 */
/**
 * @typedef {object} TransferNftInput
 * @property {TokenId | string} tokenId
 * @property {AccountId | string} sender
 * @property {AccountId | string} recipient
 * @property {Long | number} serial
 */
/**
 * Transfers a new Hedera™ crypto-currency token.
 */
export default class TransferTransaction extends AbstractTokenTransferTransaction {
    /**
     * @internal
     * @param {HieroProto.proto.ITransaction[]} transactions
     * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {TransferTransaction}
     */
    static _fromProtobuf(transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): TransferTransaction;
    /**
     * @param {object} [props]
     * @param {(TransferTokensInput)[]} [props.tokenTransfers]
     * @param {(TransferHbarInput)[]} [props.hbarTransfers]
     * @param {(TransferNftInput)[]} [props.nftTransfers]
     */
    constructor(props?: {
        tokenTransfers?: TransferTokensInput[] | undefined;
        hbarTransfers?: TransferHbarInput[] | undefined;
        nftTransfers?: TransferNftInput[] | undefined;
    });
    /**
     * @private
     * @type {Transfer[]}
     */
    private _hbarTransfers;
    /**
     * @returns {HbarTransferMap}
     */
    get hbarTransfers(): HbarTransferMap;
    /**
     * @returns {Transfer[]}
     */
    get hbarTransfersList(): Transfer[];
    /**
     * @internal
     * @param {AccountId | string} accountId
     * @param {number | string | Long | LongObject | BigNumber | Hbar} amount
     * @param {boolean} isApproved
     * @returns {TransferTransaction}
     */
    _addHbarTransfer(accountId: AccountId | string, amount: number | string | Long | LongObject | BigNumber | Hbar, isApproved: boolean): TransferTransaction;
    /**
     * @internal
     * @param {AccountId | string} accountId
     * @param {number | string | Long | LongObject | BigNumber | Hbar} amount
     * @returns {TransferTransaction}
     */
    addHbarTransfer(accountId: AccountId | string, amount: number | string | Long | LongObject | BigNumber | Hbar): TransferTransaction;
    /**
     * @internal
     * @param {AccountId | string} accountId
     * @param {number | string | Long | LongObject | BigNumber | Hbar} amount
     * @returns {TransferTransaction}
     */
    addApprovedHbarTransfer(accountId: AccountId | string, amount: number | string | Long | LongObject | BigNumber | Hbar): TransferTransaction;
    /**
     * @deprecated - Use `addApprovedHbarTransfer()` instead
     * @param {AccountId | string} accountId
     * @param {boolean} isApproved
     * @returns {TransferTransaction}
     */
    setHbarTransferApproval(accountId: AccountId | string, isApproved: boolean): TransferTransaction;
    /**
     * @deprecated - Use `addApprovedTokenTransfer()` instead
     * @param {TokenId | string} tokenId
     * @param {AccountId | string} accountId
     * @param {boolean} isApproved
     * @returns {TransferTransaction}
     */
    setTokenTransferApproval(tokenId: TokenId | string, accountId: AccountId | string, isApproved: boolean): TransferTransaction;
    /**
     * @deprecated - Use `addApprovedNftTransfer()` instead
     * @param {NftId | string} nftId
     * @param {boolean} isApproved
     * @returns {TransferTransaction}
     */
    setNftTransferApproval(nftId: NftId | string, isApproved: boolean): TransferTransaction;
    /**
     * @override
     * @protected
     * @returns {HieroProto.proto.ICryptoTransferTransactionBody}
     */
    protected override _makeTransactionData(): HieroProto.proto.ICryptoTransferTransactionBody;
}
export type LongObject = import("../long.js").LongObject;
export type BigNumber = import("bignumber.js").default;
export namespace HieroProto {
    namespace proto {
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
        type ISignedTransaction = import("@hashgraph/proto").proto.ISignedTransaction;
        type TransactionBody = import("@hashgraph/proto").proto.TransactionBody;
        type ITransactionBody = import("@hashgraph/proto").proto.ITransactionBody;
        type ITransactionResponse = import("@hashgraph/proto").proto.ITransactionResponse;
        type ICryptoTransferTransactionBody = import("@hashgraph/proto").proto.ICryptoTransferTransactionBody;
    }
}
export type Channel = import("../channel/Channel.js").default;
export type Client = import("../client/Client.js").default<any, any>;
export type TransactionId = import("../transaction/TransactionId.js").default;
export type TransferTokensInput = {
    tokenId: TokenId | string;
    accountId: AccountId | string;
    amount: Long | number;
};
export type TransferTokenObject = {
    tokenId: TokenId;
    accountId: AccountId;
    amount: Long;
};
export type TransferHbarInput = {
    accountId: AccountId | string;
    amount: number | string | Long | BigNumber | Hbar;
};
export type TransferNftInput = {
    tokenId: TokenId | string;
    sender: AccountId | string;
    recipient: AccountId | string;
    serial: Long | number;
};
import AbstractTokenTransferTransaction from "../token/AbstractTokenTransferTransaction.js";
import HbarTransferMap from "./HbarTransferMap.js";
import Transfer from "../Transfer.js";
import AccountId from "./AccountId.js";
import Hbar from "../Hbar.js";
import TokenId from "../token/TokenId.js";
import NftId from "../token/NftId.js";
