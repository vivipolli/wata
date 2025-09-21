/**
 * @typedef {import("../ExchangeRate.js").ExchangeRateJSON} ExchangeRateJSON
 */
/**
 * @typedef {object} TransactionReceiptJSON
 * @property {string} status
 * @property {?string} accountId
 * @property {?string} filedId
 * @property {?string} contractId
 * @property {?string} topicId
 * @property {?string} tokenId
 * @property {?string} scheduleId
 * @property {?ExchangeRateJSON} exchangeRate
 * @property {?ExchangeRateJSON} nextExchangeRate
 * @property {?string} topicSequenceNumber
 * @property {?string} topicRunningHash
 * @property {?string} totalSupply
 * @property {?string} scheduledTransactionId
 * @property {string[]} serials
 * @property {TransactionReceiptJSON[]} duplicates
 * @property {TransactionReceiptJSON[]} children
 * @property {?string} nodeId
 */
/**
 * The consensus result for a transaction, which might not be currently known,
 * or may succeed or fail.
 */
export default class TransactionReceipt {
    /**
     * @internal
     * @param {HieroProto.proto.ITransactionGetReceiptResponse} response
     * @returns {TransactionReceipt}
     */
    static _fromProtobuf(response: HieroProto.proto.ITransactionGetReceiptResponse): TransactionReceipt;
    /**
     * @param {Uint8Array} bytes
     * @returns {TransactionReceipt}
     */
    static fromBytes(bytes: Uint8Array): TransactionReceipt;
    /**
     * @private
     * @param {object} props
     * @param {Status} props.status
     * @param {?AccountId} props.accountId
     * @param {?FileId} props.fileId
     * @param {?ContractId} props.contractId
     * @param {?TopicId} props.topicId
     * @param {?TokenId} props.tokenId
     * @param {?ScheduleId} props.scheduleId
     * @param {?ExchangeRate} props.exchangeRate
     * @param {?ExchangeRate} props.nextExchangeRate
     * @param {?Long} props.topicSequenceNumber
     * @param {?Uint8Array} props.topicRunningHash
     * @param {?Long} props.totalSupply
     * @param {?TransactionId} props.scheduledTransactionId
     * @param {Long[]} props.serials
     * @param {TransactionReceipt[]} props.duplicates
     * @param {TransactionReceipt[]} props.children
     * @param {?Long} props.nodeId
     */
    private constructor();
    /**
     * Whether the transaction succeeded or failed (or is unknown).
     *
     * @readonly
     */
    readonly status: Status;
    /**
     * The account ID, if a new account was created.
     *
     * @readonly
     */
    readonly accountId: AccountId | null;
    /**
     * The file ID, if a new file was created.
     *
     * @readonly
     */
    readonly fileId: FileId | null;
    /**
     * The contract ID, if a new contract was created.
     *
     * @readonly
     */
    readonly contractId: ContractId | null;
    /**
     * The topic ID, if a new topic was created.
     *
     * @readonly
     */
    readonly topicId: TopicId | null;
    /**
     * The token ID, if a new token was created.
     *
     * @readonly
     */
    readonly tokenId: TokenId | null;
    /**
     * The schedule ID, if a new schedule was created.
     *
     * @readonly
     */
    readonly scheduleId: ScheduleId | null;
    /**
     * The exchange rate of Hbars to cents (USD).
     *
     * @readonly
     */
    readonly exchangeRate: ExchangeRate | null;
    /**
     * The next exchange rate of Hbars to cents (USD).
     *
     * @readonly
     */
    readonly nextExchangeRate: ExchangeRate | null;
    /**
     * Updated sequence number for a consensus service topic.
     *
     * @readonly
     */
    readonly topicSequenceNumber: Long | null;
    /**
     * Updated running hash for a consensus service topic.
     *
     * @readonly
     */
    readonly topicRunningHash: Uint8Array<ArrayBufferLike> | null;
    /**
     * Updated total supply for a token
     *
     * @readonly
     */
    readonly totalSupply: Long | null;
    scheduledTransactionId: TransactionId | null;
    serials: Long[];
    /**
     * @readonly
     */
    readonly duplicates: TransactionReceipt[];
    /**
     * @readonly
     */
    readonly children: TransactionReceipt[];
    /**
     * @readonly
     * @description In the receipt of a NodeCreate, NodeUpdate, NodeDelete, the id of the newly created node.
     * An affected node identifier.
     * This value SHALL be set following a `createNode` transaction.
     * This value SHALL be set following a `updateNode` transaction.
     * This value SHALL be set following a `deleteNode` transaction.
     * This value SHALL NOT be set following any other transaction.
     */
    readonly nodeId: Long | null;
    /**
     * @internal
     * @returns {HieroProto.proto.ITransactionGetReceiptResponse}
     */
    _toProtobuf(): HieroProto.proto.ITransactionGetReceiptResponse;
    /**
     * @returns {Uint8Array}
     */
    toBytes(): Uint8Array;
    /**
     * @returns {TransactionReceiptJSON}
     */
    toJSON(): TransactionReceiptJSON;
    /**
     * @returns {string}
     */
    toString(): string;
}
export type ExchangeRateJSON = import("../ExchangeRate.js").ExchangeRateJSON;
export type TransactionReceiptJSON = {
    status: string;
    accountId: string | null;
    filedId: string | null;
    contractId: string | null;
    topicId: string | null;
    tokenId: string | null;
    scheduleId: string | null;
    exchangeRate: ExchangeRateJSON | null;
    nextExchangeRate: ExchangeRateJSON | null;
    topicSequenceNumber: string | null;
    topicRunningHash: string | null;
    totalSupply: string | null;
    scheduledTransactionId: string | null;
    serials: string[];
    duplicates: TransactionReceiptJSON[];
    children: TransactionReceiptJSON[];
    nodeId: string | null;
};
import Status from "../Status.js";
import AccountId from "../account/AccountId.js";
import FileId from "../file/FileId.js";
import ContractId from "../contract/ContractId.js";
import TopicId from "../topic/TopicId.js";
import TokenId from "../token/TokenId.js";
import ScheduleId from "../schedule/ScheduleId.js";
import ExchangeRate from "../ExchangeRate.js";
import Long from "long";
import TransactionId from "../transaction/TransactionId.js";
import * as HieroProto from "@hashgraph/proto";
