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
 * @typedef {import("./file/FileId.js").default} FileId
 * @typedef {import("./channel/Channel.js").default} Channel
 * @typedef {import("./channel/MirrorChannel.js").default} MirrorChannel
 * @typedef {import("./client/Client.js").default<*, *>} Client
 * @typedef {import("./Timestamp.js").default} Timestamp
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 * @typedef {import("./transaction/TransactionResponse.js").default} TransactionResponse
 * @typedef {import("long")} Long
 */
/**
 * Create a new Hedera™ transaction wrapped ethereum transaction.
 * @deprecated - use EthereumTransaction instead. With the introduction of jumbo transactions, it should always be less cost and more efficient to use EthereumTransaction instead.
 */
export default class EthereumFlow {
    /**
     * @param {object} [props]
     * @param {Uint8Array} [props.ethereumData]
     * @param {FileId} [props.callData]
     * @param {number | string | Long | BigNumber | Hbar} [props.maxGasAllowance]
     */
    constructor(props?: {
        ethereumData?: Uint8Array<ArrayBufferLike> | undefined;
        callData?: import("./file/FileId.js").default | undefined;
        maxGasAllowance?: string | number | import("long") | import("bignumber.js").BigNumber | Hbar | undefined;
    });
    /**
     * @private
     * @type {?EthereumTransactionData}
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
    _maxChunks: number | null;
    /**
     * @returns {number | null}
     */
    get maxChunks(): number | null;
    /**
     * @param {number} maxChunks
     * @returns {this}
     */
    setMaxChunks(maxChunks: number): this;
    /**
     * @returns {?EthereumTransactionData}
     */
    get ethereumData(): EthereumTransactionData | null;
    /**
     * The raw Ethereum transaction (RLP encoded type 0, 1, and 2). Complete
     * unless the callData field is set.
     *
     * @param {EthereumTransactionData | Uint8Array} ethereumData
     * @returns {this}
     */
    setEthereumData(ethereumData: EthereumTransactionData | Uint8Array): this;
    /**
     * @returns {?Hbar}
     */
    get maxGasAllowance(): Hbar | null;
    /**
     * @deprecated - use masGasAllowanceHbar instead.
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
     * @template {Channel} ChannelT
     * @template {MirrorChannel} MirrorChannelT
     * @param {import("./client/Client.js").default<ChannelT, MirrorChannelT>} client
     * @returns {Promise<TransactionResponse>}
     */
    execute<ChannelT extends Channel, MirrorChannelT extends MirrorChannel>(client: import("./client/Client.js").default<ChannelT, MirrorChannelT>): Promise<TransactionResponse>;
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
export type FileId = import("./file/FileId.js").default;
export type Channel = import("./channel/Channel.js").default;
export type MirrorChannel = import("./channel/MirrorChannel.js").default;
export type Client = import("./client/Client.js").default<any, any>;
export type Timestamp = import("./Timestamp.js").default;
export type TransactionId = import("./transaction/TransactionId.js").default;
export type TransactionResponse = import("./transaction/TransactionResponse.js").default;
export type Long = import("long");
import EthereumTransactionData from "./EthereumTransactionData.js";
import Hbar from "./Hbar.js";
