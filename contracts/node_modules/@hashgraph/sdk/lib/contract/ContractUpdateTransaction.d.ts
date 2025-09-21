/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.IContractUpdateTransactionBody} HieroProto.proto.IContractUpdateTransactionBody
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 * @typedef {import("@hashgraph/proto").proto.IContractID} HieroProto.proto.IContractID
 * @typedef {import("@hashgraph/proto").proto.IFileID} HieroProto.proto.IFileID
 */
/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */
/**
 * Modify a smart contract.<br/>
 * Any change other than updating the expiration time requires that the
 * contract be modifiable (has a valid `adminKey`) and that the
 * transaction be signed by the `adminKey`
 * <p>
 * Fields _not set_ on the request SHALL NOT be modified.
 */
export default class ContractUpdateTransaction extends Transaction {
    /**
     * @internal
     * @param {HieroProto.proto.ITransaction[]} transactions
     * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {ContractUpdateTransaction}
     */
    static _fromProtobuf(transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): ContractUpdateTransaction;
    /**
     * @param {object} props
     * @param {ContractId | string} [props.contractId]
     * @param {FileId | string} [props.bytecodeFileId]
     * @param {Timestamp | Date} [props.expirationTime]
     * @param {Key} [props.adminKey]
     * @param {AccountId | string} [props.proxyAccountId]
     * @param {Duration | Long | number} [props.autoRenewPeriod]
     * @param {string} [props.contractMemo]
     * @param {number} [props.maxAutomaticTokenAssociations]
     * @param {AccountId | string} [props.stakedAccountId]
     * @param {Long | number} [props.stakedNodeId]
     * @param {boolean} [props.declineStakingReward]
     * @param {AccountId} [props.autoRenewAccountId]
     */
    constructor(props?: {
        contractId?: string | ContractId | undefined;
        bytecodeFileId?: string | FileId | undefined;
        expirationTime?: Date | Timestamp | undefined;
        adminKey?: Key | undefined;
        proxyAccountId?: string | AccountId | undefined;
        autoRenewPeriod?: number | Long | Duration | undefined;
        contractMemo?: string | undefined;
        maxAutomaticTokenAssociations?: number | undefined;
        stakedAccountId?: string | AccountId | undefined;
        stakedNodeId?: number | Long | undefined;
        declineStakingReward?: boolean | undefined;
        autoRenewAccountId?: AccountId | undefined;
    });
    /**
     * @private
     * @type {?ContractId}
     */
    private _contractId;
    /**
     * @private
     * @type {?Timestamp}
     */
    private _expirationTime;
    /**
     * @private
     * @type {?Key}
     */
    private _adminKey;
    /**
     * @private
     * @type {?AccountId}
     */
    private _proxyAccountId;
    /**
     * @private
     * @type {?Duration}
     */
    private _autoRenewPeriod;
    /**
     * @private
     * @type {?FileId}
     */
    private _bytecodeFileId;
    /**
     * @private
     * @type {?string}
     */
    private _contractMemo;
    /**
     * @private
     * @type {?number}
     */
    private _maxAutomaticTokenAssociations;
    /**
     * @private
     * @type {?AccountId}
     */
    private _stakedAccountId;
    /**
     * @private
     * @type {?Long}
     */
    private _stakedNodeId;
    /**
     * @private
     * @type {?boolean}
     */
    private _declineStakingReward;
    /**
     * @type {?AccountId}
     */
    _autoRenewAccountId: AccountId | null;
    /**
     * @returns {?ContractId}
     */
    get contractId(): ContractId | null;
    /**
     * Sets the contract ID which is being deleted in this transaction.
     *
     * @param {ContractId | string} contractId
     * @returns {ContractUpdateTransaction}
     */
    setContractId(contractId: ContractId | string): ContractUpdateTransaction;
    /**
     * @returns {?Timestamp}
     */
    get expirationTime(): Timestamp | null;
    /**
     * Sets the contract ID which is being deleted in this transaction.
     *
     * @param {Timestamp | Date} expirationTime
     * @returns {ContractUpdateTransaction}
     */
    setExpirationTime(expirationTime: Timestamp | Date): ContractUpdateTransaction;
    /**
     * @returns {?Key}
     */
    get adminKey(): Key | null;
    /**
     * @param {Key} adminKey
     * @returns {this}
     */
    setAdminKey(adminKey: Key): this;
    /**
     * @deprecated
     * @returns {?AccountId}
     */
    get proxyAccountId(): AccountId | null;
    /**
     * @deprecated
     * @param {AccountId | string} proxyAccountId
     * @returns {this}
     */
    setProxyAccountId(proxyAccountId: AccountId | string): this;
    /**
     * @returns {?Duration}
     */
    get autoRenewPeriod(): Duration | null;
    /**
     * @param {Duration | Long | number} autoRenewPeriod
     * @returns {this}
     */
    setAutoRenewPeriod(autoRenewPeriod: Duration | Long | number): this;
    /**
     * @returns {?FileId}
     */
    get bytecodeFileId(): FileId | null;
    /**
     * @param {FileId | string} bytecodeFileId
     * @returns {this}
     */
    setBytecodeFileId(bytecodeFileId: FileId | string): this;
    /**
     * @returns {?string}
     */
    get contractMemo(): string | null;
    /**
     * @param {string} contractMemo
     * @returns {this}
     */
    setContractMemo(contractMemo: string): this;
    /**
     * @returns {this}
     */
    clearContractMemo(): this;
    /**
     * @returns {number | null}
     */
    get maxAutomaticTokenAssociations(): number | null;
    /**
     * @param {number} maxAutomaticTokenAssociations
     * @returns {this}
     */
    setMaxAutomaticTokenAssociations(maxAutomaticTokenAssociations: number): this;
    /**
     * @returns {?AccountId}
     */
    get stakedAccountId(): AccountId | null;
    /**
     * @param {AccountId | string} stakedAccountId
     * @returns {this}
     */
    setStakedAccountId(stakedAccountId: AccountId | string): this;
    /**
     * @returns {?Long}
     */
    get stakedNodeId(): Long | null;
    /**
     * @param {Long | number} stakedNodeId
     * @returns {this}
     */
    setStakedNodeId(stakedNodeId: Long | number): this;
    /**
     * @returns {?boolean}
     */
    get declineStakingRewards(): boolean | null;
    /**
     * @param {boolean} declineStakingReward
     * @returns {this}
     */
    setDeclineStakingReward(declineStakingReward: boolean): this;
    /**
     * @returns {?AccountId}
     */
    get autoRenewAccountId(): AccountId | null;
    /**
     * If set to the sentinel <tt>0.0.0</tt> AccountID, this field removes the contract's auto-renew
     * account. Otherwise it updates the contract's auto-renew account to the referenced account.
     *
     * @param {string | AccountId} autoRenewAccountId
     * @returns {this}
     */
    setAutoRenewAccountId(autoRenewAccountId: string | AccountId): this;
    /**
     * @returns {this}
     */
    clearAutoRenewAccountId(): this;
    /**
     * @override
     * @protected
     * @returns {HieroProto.proto.IContractUpdateTransactionBody}
     */
    protected override _makeTransactionData(): HieroProto.proto.IContractUpdateTransactionBody;
}
export namespace HieroProto {
    namespace proto {
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
        type ISignedTransaction = import("@hashgraph/proto").proto.ISignedTransaction;
        type TransactionBody = import("@hashgraph/proto").proto.TransactionBody;
        type ITransactionBody = import("@hashgraph/proto").proto.ITransactionBody;
        type ITransactionResponse = import("@hashgraph/proto").proto.ITransactionResponse;
        type IContractUpdateTransactionBody = import("@hashgraph/proto").proto.IContractUpdateTransactionBody;
        type IAccountID = import("@hashgraph/proto").proto.IAccountID;
        type IContractID = import("@hashgraph/proto").proto.IContractID;
        type IFileID = import("@hashgraph/proto").proto.IFileID;
    }
}
export type Channel = import("../channel/Channel.js").default;
export type Client = import("../client/Client.js").default<any, any>;
export type TransactionId = import("../transaction/TransactionId.js").default;
import Transaction from "../transaction/Transaction.js";
import AccountId from "../account/AccountId.js";
import ContractId from "./ContractId.js";
import Timestamp from "../Timestamp.js";
import Key from "../Key.js";
import Duration from "../Duration.js";
import Long from "long";
import FileId from "../file/FileId.js";
