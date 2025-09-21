/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IConsensusCreateTopicTransactionBody} HieroProto.proto.IConsensusCreateTopicTransactionBody
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
 * Create a topic to be used for consensus.
 */
export default class TopicCreateTransaction extends Transaction {
    /**
     * @internal
     * @param {HieroProto.proto.ITransaction[]} transactions
     * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {TopicCreateTransaction}
     */
    static _fromProtobuf(transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): TopicCreateTransaction;
    /**
     * @param {object} props
     * @param {Key} [props.adminKey]
     * @param {Key} [props.submitKey]
     * @param {Key} [props.feeScheduleKey]
     * @param {Duration | Long | number} [props.autoRenewPeriod]
     * @param {AccountId | string} [props.autoRenewAccountId]
     * @param {CustomFixedFee[]} [props.customFees]
     * @param {Key[]} [props.feeExemptKeys]
     * @param {string} [props.topicMemo]
     */
    constructor(props?: {
        adminKey?: Key | undefined;
        submitKey?: Key | undefined;
        feeScheduleKey?: Key | undefined;
        autoRenewPeriod?: number | import("long") | Duration | undefined;
        autoRenewAccountId?: string | AccountId | undefined;
        customFees?: CustomFixedFee[] | undefined;
        feeExemptKeys?: Key[] | undefined;
        topicMemo?: string | undefined;
    });
    /**
     * @private
     * @type {?Key}
     */
    private _adminKey;
    /**
     * @private
     * @type {?Key}
     */
    private _submitKey;
    /**
     * @private
     * @type {?Key}
     */
    private _feeScheduleKey;
    /**
     * @private
     * @type {Key[]}
     */
    private _feeExemptKeys;
    /**
     * @private
     * @type {?AccountId}
     */
    private _autoRenewAccountId;
    /**
     * @private
     * @type {Duration}
     */
    private _autoRenewPeriod;
    /**
     * @private
     * @type {CustomFixedFee[]}
     */
    private _customFees;
    /**
     * @private
     * @type {?string}
     */
    private _topicMemo;
    /**
     * @deprecated  - Use `getTopicMemo()` instead
     * @returns {?string}
     */
    get topicMemo(): string | null;
    /**
     * @returns {?string}
     */
    getTopicMemo(): string | null;
    /**
     * @param {string} topicMemo
     * @returns {this}
     */
    setTopicMemo(topicMemo: string): this;
    /**
     * @deprecated  - Use `getAdminKey()` instead
     * @returns {?Key}
     */
    get adminKey(): Key | null;
    /**
     * @returns {?Key}
     */
    getAdminKey(): Key | null;
    /**
     * @param {Key} adminKey
     * @returns {this}
     */
    setAdminKey(adminKey: Key): this;
    /**
     * @deprecated  - Use `getSubmitKey()` instead
     * @returns {?Key}
     */
    get submitKey(): Key | null;
    /**
     * @returns {?Key}
     */
    getSubmitKey(): Key | null;
    /**
     * @param {Key} submitKey
     * @returns {this}
     */
    setSubmitKey(submitKey: Key): this;
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
     * Returns the keys that will be exempt from paying fees.
     * @returns {Key[]}
     */
    getFeeExemptKeys(): Key[];
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
     * Clears all keys that will be exempt from paying fees.
     * @returns {this}
     */
    clearFeeExemptKeys(): this;
    /**
     * @deprecated  - Use `getAutoRenewAccountId()` instead
     * @returns {?AccountId}
     */
    get autoRenewAccountId(): AccountId | null;
    /**
     * @returns {?AccountId}
     */
    getAutoRenewAccountId(): AccountId | null;
    /**
     * @param {AccountId | string} autoRenewAccountId
     * @returns {this}
     */
    setAutoRenewAccountId(autoRenewAccountId: AccountId | string): this;
    /**
     * @deprecated  - Use `getAutoRenewPeriod()` instead
     * @returns {Duration}
     */
    get autoRenewPeriod(): Duration;
    /**
     * @returns {Duration}
     */
    getAutoRenewPeriod(): Duration;
    /**
     * Set the auto renew period for this account.
     *
     * @param {Duration | Long | number} autoRenewPeriod
     * @returns {this}
     */
    setAutoRenewPeriod(autoRenewPeriod: Duration | Long | number): this;
    /**
     * Returns the fixed fees to assess when a message is submitted to the new topic.
     * @returns {CustomFixedFee[]}
     */
    getCustomFees(): CustomFixedFee[];
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
     * Clears fixed fees.
     *
     * @returns {this}
     */
    clearCustomFees(): this;
    /**
     * @override
     * @param {?import("../client/Client.js").default<Channel, *>} client
     * @returns {this}
     */
    override freezeWith(client: import("../client/Client.js").default<Channel, any> | null): this;
    /**
     * @override
     * @protected
     * @returns {HieroProto.proto.IConsensusCreateTopicTransactionBody}
     */
    protected override _makeTransactionData(): HieroProto.proto.IConsensusCreateTopicTransactionBody;
}
export namespace HieroProto {
    namespace proto {
        type IConsensusCreateTopicTransactionBody = import("@hashgraph/proto").proto.IConsensusCreateTopicTransactionBody;
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
import Key from "../Key.js";
import AccountId from "../account/AccountId.js";
import Duration from "../Duration.js";
import CustomFixedFee from "../token/CustomFixedFee.js";
