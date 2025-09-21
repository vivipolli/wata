/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IConsensusUpdateTopicTransactionBody} HieroProto.proto.IConsensusUpdateTopicTransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 */
/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */
/**
 * Update a topic.
 *
 * If there is no adminKey, the only authorized update (available to anyone) is to extend the expirationTime.
 * Otherwise transaction must be signed by the adminKey.
 *
 * If an adminKey is updated, the transaction must be signed by the pre-update adminKey and post-update adminKey.
 *
 * If a new autoRenewAccount is specified (not just being removed), that account must also sign the transaction.
 */
export default class TopicUpdateTransaction extends Transaction {
    /**
     * @internal
     * @param {HieroProto.proto.ITransaction[]} transactions
     * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {TopicUpdateTransaction}
     */
    static _fromProtobuf(transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): TopicUpdateTransaction;
    /**
     * @param {object} props
     * @param {TopicId | string} [props.topicId]
     * @param {Key} [props.adminKey]
     * @param {Key} [props.submitKey]
     * @param {Key} [props.feeScheduleKey]
     * @param {Key[]} [props.feeExemptKeys]
     * @param {Duration | Long | number} [props.autoRenewPeriod]
     * @param {AccountId | string} [props.autoRenewAccountId]
     * @param {CustomFixedFee[]} [props.customFees]
     * @param {?string} [props.topicMemo]
     * @param {Timestamp | Date} [props.expirationTime]
     */
    constructor(props?: {
        topicId?: string | TopicId | undefined;
        adminKey?: Key | undefined;
        submitKey?: Key | undefined;
        feeScheduleKey?: Key | undefined;
        feeExemptKeys?: Key[] | undefined;
        autoRenewPeriod?: number | import("long") | Duration | undefined;
        autoRenewAccountId?: string | AccountId | undefined;
        customFees?: CustomFixedFee[] | undefined;
        topicMemo?: string | null | undefined;
        expirationTime?: Date | Timestamp | undefined;
    });
    /**
     * @private
     * @type {?TopicId}
     */
    private _topicId;
    /**
     * @private
     * @type {?string}
     */
    private _topicMemo;
    /**
     * @private
     * @type {?Key}
     */
    private _submitKey;
    /**
     * @private
     * @type {?Key}
     */
    private _adminKey;
    /**
     * @private
     * @type {?Key}
     */
    private _feeScheduleKey;
    /**
     * @private
     * @type {?Key[]}
     */
    private _feeExemptKeys;
    /**
     * @private
     * @type {?AccountId}
     */
    private _autoRenewAccountId;
    /**
     * @private
     * @type {?Duration}
     */
    private _autoRenewPeriod;
    /**
     * @private
     * @type {?CustomFixedFee[]}
     */
    private _customFees;
    /**
     * @private
     * @type {?Timestamp}
     */
    private _expirationTime;
    /**
     * @returns {?Timestamp}
     */
    get expirationTime(): Timestamp | null;
    /**
     * @param {Timestamp | Date | null} expirationTime
     * @returns {TopicUpdateTransaction}
     */
    setExpirationTime(expirationTime: Timestamp | Date | null): TopicUpdateTransaction;
    /**
     * @returns {?TopicId}
     */
    get topicId(): TopicId | null;
    /**
     * @param {TopicId | string} topicId
     * @returns {TopicUpdateTransaction}
     */
    setTopicId(topicId: TopicId | string): TopicUpdateTransaction;
    /**
     * @returns {TopicUpdateTransaction}
     */
    clearTopicId(): TopicUpdateTransaction;
    /**
     * @returns {?string}
     */
    get topicMemo(): string | null;
    /**
     * @param {string} topicMemo
     * @returns {TopicUpdateTransaction}
     */
    setTopicMemo(topicMemo: string): TopicUpdateTransaction;
    /**
     * @returns {TopicUpdateTransaction}
     */
    clearTopicMemo(): TopicUpdateTransaction;
    /**
     * @returns {?Key}
     */
    get adminKey(): Key | null;
    /**
     * @param {Key} adminKey
     * @returns {TopicUpdateTransaction}
     */
    setAdminKey(adminKey: Key): TopicUpdateTransaction;
    /**
     * @returns {TopicUpdateTransaction}
     */
    clearAdminKey(): TopicUpdateTransaction;
    /**
     * @returns {?Key}
     */
    get submitKey(): Key | null;
    /**
     * @param {Key} submitKey
     * @returns {TopicUpdateTransaction}
     */
    setSubmitKey(submitKey: Key): TopicUpdateTransaction;
    /**
     * @returns {TopicUpdateTransaction}
     */
    clearSubmitKey(): TopicUpdateTransaction;
    /**
     * Returns the key which allows updates to the new topic’s fees.
     * @returns {?Key}
     */
    getFeeScheduleKey(): Key | null;
    /**
     * Sets the key which allows updates to the new topic’s fees.
     * @param {Key} feeScheduleKey
     * @returns {this}
     */
    setFeeScheduleKey(feeScheduleKey: Key): this;
    /**
     * @returns {TopicUpdateTransaction}
     */
    clearFeeScheduleKey(): TopicUpdateTransaction;
    /**
     * Returns the keys that will be exempt from paying fees.
     * @returns {?Key[]}
     */
    getFeeExemptKeys(): Key[] | null;
    /**
     * Sets the keys that will be exempt from paying fees.
     * @param {Key[]} feeExemptKeys
     * @returns {this}
     */
    setFeeExemptKeys(feeExemptKeys: Key[]): this;
    /**
     * Adds a key that will be exempt from paying fees.
     * @param {Key} key
     * @returns {this}
     */
    addFeeExemptKey(key: Key): this;
    /**
     * Clears all keys that will be exempt from paying fees, effectively removing them from the network state.
     * @returns {this}
     */
    clearFeeExemptKeys(): this;
    /**
     * @returns {?AccountId}
     */
    get autoRenewAccountId(): AccountId | null;
    /**
     * @param {AccountId | string} autoRenewAccountId
     * @returns {TopicUpdateTransaction}
     */
    setAutoRenewAccountId(autoRenewAccountId: AccountId | string): TopicUpdateTransaction;
    /**
     * @returns {TopicUpdateTransaction}
     */
    clearAutoRenewAccountId(): TopicUpdateTransaction;
    /**
     * @returns {?Duration}
     */
    get autoRenewPeriod(): Duration | null;
    /**
     * Set the auto renew period for this account.
     *
     * @param {Duration | Long | number} autoRenewPeriod
     * @returns {TopicUpdateTransaction}
     */
    setAutoRenewPeriod(autoRenewPeriod: Duration | Long | number): TopicUpdateTransaction;
    /**
     * Returns the fixed fees to assess when a message is submitted to the new topic.
     * @returns {?CustomFixedFee[]}
     */
    getCustomFees(): CustomFixedFee[] | null;
    /**
     * Sets the fixed fees to assess when a message is submitted to the new topic.
     *
     * @param {CustomFixedFee[]} customFees
     * @returns {this}
     */
    setCustomFees(customFees: CustomFixedFee[]): this;
    /**
     * Adds fixed fee to assess when a message is submitted to the new topic.
     *
     * @param {CustomFixedFee} customFee
     * @returns {this}
     */
    addCustomFee(customFee: CustomFixedFee): this;
    /**
     * Clears fixed fees, effectively removing them from the network state.
     *
     * @returns {this}
     */
    clearCustomFees(): this;
    /**
     * @override
     * @protected
     * @returns {HieroProto.proto.IConsensusUpdateTopicTransactionBody}
     */
    protected override _makeTransactionData(): HieroProto.proto.IConsensusUpdateTopicTransactionBody;
}
export namespace HieroProto {
    namespace proto {
        type IConsensusUpdateTopicTransactionBody = import("@hashgraph/proto").proto.IConsensusUpdateTopicTransactionBody;
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
        type ISignedTransaction = import("@hashgraph/proto").proto.ISignedTransaction;
        type TransactionBody = import("@hashgraph/proto").proto.TransactionBody;
        type ITransactionBody = import("@hashgraph/proto").proto.ITransactionBody;
        type ITransactionResponse = import("@hashgraph/proto").proto.ITransactionResponse;
    }
}
export type Channel = import("../channel/Channel.js").default;
export type Client = import("../client/Client.js").default<any, any>;
export type TransactionId = import("../transaction/TransactionId.js").default;
import Transaction from "../transaction/Transaction.js";
import Timestamp from "../Timestamp.js";
import TopicId from "./TopicId.js";
import Key from "../Key.js";
import AccountId from "../account/AccountId.js";
import Duration from "../Duration.js";
import CustomFixedFee from "../token/CustomFixedFee.js";
