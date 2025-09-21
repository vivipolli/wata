/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.IEthereumTransactionBody} HieroProto.proto.IEthereumTransactionBody
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 */
/**
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("./account/AccountId.js").default} AccountId
 * @typedef {import("./channel/Channel.js").default} Channel
 * @typedef {import("./client/Client.js").default<*, *>} Client
 * @typedef {import("./Timestamp.js").default} Timestamp
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 * @typedef {import("long")} Long
 */
/**
 * Create a new Hedera™ transaction wrapped ethereum transaction.
 */
export default class EthereumTransaction extends Transaction {
    /**
     * @internal
     * @param {HieroProto.proto.ITransaction[]} transactions
     * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {EthereumTransaction}
     */
    static _fromProtobuf(transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): EthereumTransaction;
    /**
     * @param {object} [props]
     * @param {Uint8Array} [props.ethereumData]
     * @param {FileId} [props.callData]
     * @param {FileId} [props.callDataFileId]
     * @param {number | string | Long | BigNumber | Hbar} [props.maxGasAllowance]
     */
    constructor(props?: {
        ethereumData?: Uint8Array<ArrayBufferLike> | undefined;
        callData?: FileId | undefined;
        callDataFileId?: FileId | undefined;
        maxGasAllowance?: string | number | import("long") | import("bignumber.js").BigNumber | Hbar | undefined;
    });
    /**
     * @private
     * @type {?Uint8Array}
     */
    private _ethereumData;
    /**
     * @private
     * @type {?FileId}
     */
    private _callDataFileId;
    /**
     * @private
     * @type {?Hbar}
     */
    private _maxGasAllowance;
    /**
     * @returns {?(Uint8Array | FileId)}
     */
    get ethereumData(): (Uint8Array | FileId) | null;
    /**
     * The raw Ethereum transaction (RLP encoded type 0, 1, and 2). Complete
     * unless the callData field is set.
     *
     * @param {Uint8Array} ethereumData
     * @returns {this}
     */
    setEthereumData(ethereumData: Uint8Array): this;
    /**
     * @deprecated - Use `callDataFileId` instead
     * @returns {?FileId}
     */
    get callData(): FileId | null;
    /**
     * @deprecated - Use `setCallDataFileId()` instead
     *
     * For large transactions (for example contract create) this is the callData
     * of the callData. The data in the callData will be re-written with
     * the callData element as a zero length string with the original contents in
     * the referenced file at time of execution. The callData will need to be
     * "rehydrated" with the callData for signature validation to pass.
     * @param {FileId} callDataFileId
     * @returns {this}
     */
    setCallData(callDataFileId: FileId): this;
    /**
     * @returns {?FileId}
     */
    get callDataFileId(): FileId | null;
    /**
     * For large transactions (for example contract create) this is the callData
     * of the callData. The data in the callData will be re-written with
     * the callData element as a zero length string with the original contents in
     * the referenced file at time of execution. The callData will need to be
     * "rehydrated" with the callData for signature validation to pass.
     *
     * @param {FileId} callDataFileId
     * @returns {this}
     */
    setCallDataFileId(callDataFileId: FileId): this;
    /**
     * @returns {?Hbar}
     */
    get maxGasAllowance(): Hbar | null;
    /**
     * @deprecated -- use setMaxGasAllowanceHbar instead
     * @param {number | string | Long | BigNumber | Hbar} maxGasAllowance
     * @returns {this}
     */
    setMaxGasAllowance(maxGasAllowance: number | string | Long | BigNumber | Hbar): this;
    /**
     * The maximum amount, in hbars, that the payer of the hedera transaction
     * is willing to pay to complete the transaction.
     *
     * Ordinarily the account with the ECDSA alias corresponding to the public
     * key that is extracted from the ethereum_data signature is responsible for
     * fees that result from the execution of the transaction. If that amount of
     * authorized fees is not sufficient then the payer of the transaction can be
     * charged, up to but not exceeding this amount. If the ethereum_data
     * transaction authorized an amount that was insufficient then the payer will
     * only be charged the amount needed to make up the difference. If the gas
     * price in the transaction was set to zero then the payer will be assessed
     * the entire fee.
     *
     * @param {number | string | Long | BigNumber | Hbar} maxGasAllowance
     * @returns {this}
     */
    setMaxGasAllowanceHbar(maxGasAllowance: number | string | Long | BigNumber | Hbar): this;
    /**
     * @override
     * @protected
     * @returns {HieroProto.proto.IEthereumTransactionBody}
     */
    protected override _makeTransactionData(): HieroProto.proto.IEthereumTransactionBody;
}
export namespace HieroProto {
    namespace proto {
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
        type ISignedTransaction = import("@hashgraph/proto").proto.ISignedTransaction;
        type TransactionBody = import("@hashgraph/proto").proto.TransactionBody;
        type ITransactionBody = import("@hashgraph/proto").proto.ITransactionBody;
        type ITransactionResponse = import("@hashgraph/proto").proto.ITransactionResponse;
        type IEthereumTransactionBody = import("@hashgraph/proto").proto.IEthereumTransactionBody;
        type IAccountID = import("@hashgraph/proto").proto.IAccountID;
    }
}
export type BigNumber = import("bignumber.js").default;
export type AccountId = import("./account/AccountId.js").default;
export type Channel = import("./channel/Channel.js").default;
export type Client = import("./client/Client.js").default<any, any>;
export type Timestamp = import("./Timestamp.js").default;
export type TransactionId = import("./transaction/TransactionId.js").default;
export type Long = import("long");
import Transaction from "./transaction/Transaction.js";
import FileId from "./file/FileId.js";
import Hbar from "./Hbar.js";
