/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.IContractCreateTransactionBody} HieroProto.proto.IContractCreateTransactionBody
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 * @typedef {import("@hashgraph/proto").proto.IFileID} HieroProto.proto.IFileID
 */
/**
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */
/**
 * Create a new smart contract.
 *
 * If this transaction succeeds, the `ContractID` for the new smart contract
 * SHALL be set in the transaction receipt.<br/>
 * The contract is defined by the initial bytecode (or `initcode`). The
 * `initcode` SHALL be stored either in a previously created file, or in the
 * transaction body itself for very small contracts.
 *
 * As part of contract creation, the constructor defined for the new smart
 * contract SHALL run with the parameters provided in the
 * `constructorParameters` field.<br/>
 * The gas to "power" that constructor MUST be provided via the `gas` field,
 * and SHALL be charged to the payer for this transaction.<br/>
 * If the contract _constructor_ stores information, it is charged gas for that
 * storage. There is a separate fee in HBAR to maintain that storage until the
 * expiration, and that fee SHALL be added to this transaction as part of the
 * _transaction fee_, rather than gas.
 *
 */
export default class ContractCreateTransaction extends Transaction {
    /**
     * @internal
     * @param {HieroProto.proto.ITransaction[]} transactions
     * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {ContractCreateTransaction}
     */
    static _fromProtobuf(transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): ContractCreateTransaction;
    /**
     * @param {object} [props]
     * @param {FileId | string} [props.bytecodeFileId]
     * @param {Uint8Array} [props.bytecode]
     * @param {Key} [props.adminKey]
     * @param {number | Long} [props.gas]
     * @param {number | string | Long | BigNumber | Hbar} [props.initialBalance]
     * @param {AccountId | string} [props.proxyAccountId]
     * @param {Duration | Long | number} [props.autoRenewPeriod]
     * @param {Uint8Array} [props.constructorParameters]
     * @param {string} [props.contractMemo]
     * @param {number} [props.maxAutomaticTokenAssociations]
     * @param {AccountId | string} [props.stakedAccountId]
     * @param {Long | number} [props.stakedNodeId]
     * @param {boolean} [props.declineStakingReward]
     * @param {AccountId} [props.autoRenewAccountId]
     */
    constructor(props?: {
        bytecodeFileId?: string | FileId | undefined;
        bytecode?: Uint8Array<ArrayBufferLike> | undefined;
        adminKey?: Key | undefined;
        gas?: number | Long | undefined;
        initialBalance?: string | number | Long | import("bignumber.js").BigNumber | Hbar | undefined;
        proxyAccountId?: string | AccountId | undefined;
        autoRenewPeriod?: number | Long | Duration | undefined;
        constructorParameters?: Uint8Array<ArrayBufferLike> | undefined;
        contractMemo?: string | undefined;
        maxAutomaticTokenAssociations?: number | undefined;
        stakedAccountId?: string | AccountId | undefined;
        stakedNodeId?: number | Long | undefined;
        declineStakingReward?: boolean | undefined;
        autoRenewAccountId?: AccountId | undefined;
    });
    /**
     * @private
     * @type {?FileId}
     */
    private _bytecodeFileId;
    /**
     * @private
     * @type {?Uint8Array}
     */
    private _bytecode;
    /**
     * @private
     * @type {?Key}
     */
    private _adminKey;
    /**
     * @private
     * @type {?Long}
     */
    private _gas;
    /**
     * @private
     * @type {?Hbar}
     */
    private _initialBalance;
    /**
     * @private
     * @type {?AccountId}
     */
    private _proxyAccountId;
    /**
     * @private
     * @type {Duration}
     */
    private _autoRenewPeriod;
    /**
     * @private
     * @type {?Uint8Array}
     */
    private _constructorParameters;
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
     * @type {boolean}
     */
    private _declineStakingReward;
    /**
     * @type {?AccountId}
     */
    _autoRenewAccountId: AccountId | null;
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
     * @returns {?Uint8Array}
     */
    get bytecode(): Uint8Array | null;
    /**
     * @param {Uint8Array} bytecode
     * @returns {this}
     */
    setBytecode(bytecode: Uint8Array): this;
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
     * @returns {?Long}
     */
    get gas(): Long | null;
    /**
     * @param {number | Long} gas
     * @returns {this}
     */
    setGas(gas: number | Long): this;
    /**
     * @returns {?Hbar}
     */
    get initialBalance(): Hbar | null;
    /**
     * Set the initial amount to transfer into this contract.
     *
     * @param {number | string | Long | BigNumber | Hbar} initialBalance
     * @returns {this}
     */
    setInitialBalance(initialBalance: number | string | Long | BigNumber | Hbar): this;
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
     * @returns {Duration}
     */
    get autoRenewPeriod(): Duration;
    /**
     * An account to charge for auto-renewal of this contract. If not set, or set to an
     * account with zero hbar balance, the contract's own hbar balance will be used to
     * cover auto-renewal fees.
     *
     * @param {Duration | Long | number} autoRenewPeriod
     * @returns {this}
     */
    setAutoRenewPeriod(autoRenewPeriod: Duration | Long | number): this;
    /**
     * @returns {?Uint8Array}
     */
    get constructorParameters(): Uint8Array | null;
    /**
     * @param {Uint8Array | ContractFunctionParameters} constructorParameters
     * @returns {this}
     */
    setConstructorParameters(constructorParameters: Uint8Array | ContractFunctionParameters): this;
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
     * @returns {?number}
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
     * @returns {boolean}
     */
    get declineStakingRewards(): boolean;
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
     * @param {string | AccountId} autoRenewAccountId
     * @returns {this}
     */
    setAutoRenewAccountId(autoRenewAccountId: string | AccountId): this;
    /**
     * @override
     * @protected
     * @returns {HieroProto.proto.IContractCreateTransactionBody}
     */
    protected override _makeTransactionData(): HieroProto.proto.IContractCreateTransactionBody;
}
export namespace HieroProto {
    namespace proto {
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
        type ISignedTransaction = import("@hashgraph/proto").proto.ISignedTransaction;
        type TransactionBody = import("@hashgraph/proto").proto.TransactionBody;
        type ITransactionBody = import("@hashgraph/proto").proto.ITransactionBody;
        type ITransactionResponse = import("@hashgraph/proto").proto.ITransactionResponse;
        type IContractCreateTransactionBody = import("@hashgraph/proto").proto.IContractCreateTransactionBody;
        type IAccountID = import("@hashgraph/proto").proto.IAccountID;
        type IFileID = import("@hashgraph/proto").proto.IFileID;
    }
}
export type BigNumber = import("bignumber.js").default;
export type Channel = import("../channel/Channel.js").default;
export type Client = import("../client/Client.js").default<any, any>;
export type TransactionId = import("../transaction/TransactionId.js").default;
import Transaction from "../transaction/Transaction.js";
import AccountId from "../account/AccountId.js";
import FileId from "../file/FileId.js";
import Key from "../Key.js";
import Long from "long";
import Hbar from "../Hbar.js";
import Duration from "../Duration.js";
import ContractFunctionParameters from "./ContractFunctionParameters.js";
