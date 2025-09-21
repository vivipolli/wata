/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.ITokenCreateTransactionBody} HieroProto.proto.ITokenCreateTransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HieroProto.proto.ITokenID
 */
/**
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("./CustomFee.js").default} CustomFee
 */
/**
 * Create a new Hedera™ crypto-currency token.
 */
export default class TokenCreateTransaction extends Transaction {
    /**
     * @internal
     * @param {HieroProto.proto.ITransaction[]} transactions
     * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {TokenCreateTransaction}
     */
    static _fromProtobuf(transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): TokenCreateTransaction;
    /**
     * @param {object} [props]
     * @param {string} [props.tokenName]
     * @param {string} [props.tokenSymbol]
     * @param {Long | number} [props.decimals]
     * @param {Long | number} [props.initialSupply]
     * @param {AccountId | string} [props.treasuryAccountId]
     * @param {Key} [props.adminKey]
     * @param {Key} [props.kycKey]
     * @param {Key} [props.freezeKey]
     * @param {Key} [props.pauseKey]
     * @param {Key} [props.wipeKey]
     * @param {Key} [props.supplyKey]
     * @param {Key} [props.feeScheduleKey]
     * @param {boolean} [props.freezeDefault]
     * @param {AccountId | string} [props.autoRenewAccountId]
     * @param {Timestamp | Date} [props.expirationTime]
     * @param {Duration | Long | number} [props.autoRenewPeriod]
     * @param {string} [props.tokenMemo]
     * @param {CustomFee[]} [props.customFees]
     * @param {TokenType} [props.tokenType]
     * @param {TokenSupplyType} [props.supplyType]
     * @param {Long | number} [props.maxSupply]
     * @param {Key} [props.metadataKey]
     * @param {Uint8Array} [props.metadata]
     */
    constructor(props?: {
        tokenName?: string | undefined;
        tokenSymbol?: string | undefined;
        decimals?: number | Long | undefined;
        initialSupply?: number | Long | undefined;
        treasuryAccountId?: string | AccountId | undefined;
        adminKey?: Key | undefined;
        kycKey?: Key | undefined;
        freezeKey?: Key | undefined;
        pauseKey?: Key | undefined;
        wipeKey?: Key | undefined;
        supplyKey?: Key | undefined;
        feeScheduleKey?: Key | undefined;
        freezeDefault?: boolean | undefined;
        autoRenewAccountId?: string | AccountId | undefined;
        expirationTime?: Date | Timestamp | undefined;
        autoRenewPeriod?: number | Long | Duration | undefined;
        tokenMemo?: string | undefined;
        customFees?: import("./CustomFee.js").default[] | undefined;
        tokenType?: TokenType | undefined;
        supplyType?: TokenSupplyType | undefined;
        maxSupply?: number | Long | undefined;
        metadataKey?: Key | undefined;
        metadata?: Uint8Array<ArrayBufferLike> | undefined;
    });
    /**
     * @private
     * @type {?string}
     */
    private _tokenName;
    /**
     * @private
     * @type {?string}
     */
    private _tokenSymbol;
    /**
     * @private
     * @type {?Long}
     */
    private _decimals;
    /**
     * @private
     * @type {?Long}
     */
    private _initialSupply;
    /**
     * @private
     * @type {?AccountId}
     */
    private _treasuryAccountId;
    /**
     * @private
     * @type {?Key}
     */
    private _adminKey;
    /**
     * @private
     * @type {?Key}
     */
    private _kycKey;
    /**
     * @private
     * @type {?Key}
     */
    private _freezeKey;
    /**
     * @private
     * @type {?Key}
     */
    private _pauseKey;
    /**
     * @private
     * @type {?Key}
     */
    private _wipeKey;
    /**
     * @private
     * @type {?Key}
     */
    private _supplyKey;
    /**
     * @private
     * @type {?Key}
     */
    private _feeScheduleKey;
    /**
     * @private
     * @type {?boolean}
     */
    private _freezeDefault;
    /**
     * @private
     * @type {?AccountId}
     */
    private _autoRenewAccountId;
    /**
     * @private
     * @type {?Timestamp}
     */
    private _expirationTime;
    /**
     * @private
     * @type {?Duration}
     */
    private _autoRenewPeriod;
    /**
     * @private
     * @type {?string}
     */
    private _tokenMemo;
    /**
     * @private
     * @type {CustomFee[]}
     */
    private _customFees;
    /**
     * @private
     * @type {?TokenType}
     */
    private _tokenType;
    /**
     * @private
     * @type {?TokenSupplyType}
     */
    private _supplyType;
    /**
     * @private
     * @type {?Long}
     */
    private _maxSupply;
    /**
     * @private
     * @type {?Key}
     */
    private _metadataKey;
    /**
     * @private
     * @description Metadata of the created token definition.
     * @type {?Uint8Array}
     */
    private _metadata;
    /**
     * @returns {?string}
     */
    get tokenName(): string | null;
    /**
     * @param {string} name
     * @returns {this}
     */
    setTokenName(name: string): this;
    /**
     * @returns {?string}
     */
    get tokenSymbol(): string | null;
    /**
     * @param {string} symbol
     * @returns {this}
     */
    setTokenSymbol(symbol: string): this;
    /**
     * @returns {?Long}
     */
    get decimals(): Long | null;
    /**
     * @param {Long | number} decimals
     * @returns {this}
     */
    setDecimals(decimals: Long | number): this;
    /**
     * @returns {?Long}
     */
    get initialSupply(): Long | null;
    /**
     * @param {Long | number} initialSupply
     * @returns {this}
     */
    setInitialSupply(initialSupply: Long | number): this;
    /**
     * @returns {?AccountId}
     */
    get treasuryAccountId(): AccountId | null;
    /**
     * @param {AccountId | string} id
     * @returns {this}
     */
    setTreasuryAccountId(id: AccountId | string): this;
    /**
     * @returns {?Key}
     */
    get adminKey(): Key | null;
    /**
     * @param {Key} key
     * @returns {this}
     */
    setAdminKey(key: Key): this;
    /**
     * @returns {?Key}
     */
    get kycKey(): Key | null;
    /**
     * @param {Key} key
     * @returns {this}
     */
    setKycKey(key: Key): this;
    /**
     * @returns {?Key}
     */
    get freezeKey(): Key | null;
    /**
     * @override
     * @param {?import("../client/Client.js").default<Channel, *>} client
     * @returns {this}
     */
    override freezeWith(client: import("../client/Client.js").default<Channel, any> | null): this;
    /**
     * @param {Key} key
     * @returns {this}
     */
    setFreezeKey(key: Key): this;
    /**
     * @returns {?Key}
     */
    get pauseKey(): Key | null;
    /**
     * @param {Key} key
     * @returns {this}
     */
    setPauseKey(key: Key): this;
    /**
     * @returns {?Key}
     */
    get wipeKey(): Key | null;
    /**
     * @param {Key} key
     * @returns {this}
     */
    setWipeKey(key: Key): this;
    /**
     * @returns {?Key}
     */
    get supplyKey(): Key | null;
    /**
     * @param {Key} key
     * @returns {this}
     */
    setSupplyKey(key: Key): this;
    /**
     * @returns {?Key}
     */
    get feeScheduleKey(): Key | null;
    /**
     * @param {Key} key
     * @returns {this}
     */
    setFeeScheduleKey(key: Key): this;
    /**
     * @returns {?boolean}
     */
    get freezeDefault(): boolean | null;
    /**
     * @param {boolean} freeze
     * @returns {this}
     */
    setFreezeDefault(freeze: boolean): this;
    /**
     * @returns {?Timestamp}
     */
    get expirationTime(): Timestamp | null;
    /**
     * If autoRenewPeriod is set - this value will be ignored and the expiration time will be calculated based on the autoRenewPeriod + time.now()
     * Setting this value will clear the autoRenewPeriod as the autoRenewPeriod period has default value of 7890000 seconds and leaving it set will override the expiration time
     * @param {Timestamp | Date} time
     * @returns {this}
     */
    setExpirationTime(time: Timestamp | Date): this;
    /**
     * @returns {?AccountId}
     */
    get autoRenewAccountId(): AccountId | null;
    /**
     * @param {AccountId | string} id
     * @returns {this}
     */
    setAutoRenewAccountId(id: AccountId | string): this;
    /**
     * @returns {?Duration}
     */
    get autoRenewPeriod(): Duration | null;
    /**
     * If expirationTime is set - autoRenewPeriod will be effectively ignored and it's effect will be replaced by expirationTime
     *
     * @param {Duration | Long | number} autoRenewPeriod
     * @returns {this}
     */
    setAutoRenewPeriod(autoRenewPeriod: Duration | Long | number): this;
    /**
     * @returns {?string}
     */
    get tokenMemo(): string | null;
    /**
     * @param {string} memo
     * @returns {this}
     */
    setTokenMemo(memo: string): this;
    /**
     * @returns {CustomFee[]}
     */
    get customFees(): CustomFee[];
    /**
     * @param {CustomFee[]} customFees
     * @returns {this}
     */
    setCustomFees(customFees: CustomFee[]): this;
    /**
     * @returns {?TokenType}
     */
    get tokenType(): TokenType | null;
    /**
     * @param {TokenType} tokenType
     * @returns {this}
     */
    setTokenType(tokenType: TokenType): this;
    /**
     * @returns {?TokenSupplyType}
     */
    get supplyType(): TokenSupplyType | null;
    /**
     * @param {TokenSupplyType} supplyType
     * @returns {this}
     */
    setSupplyType(supplyType: TokenSupplyType): this;
    /**
     * @returns {?Long}
     */
    get maxSupply(): Long | null;
    /**
     * @param {Long | number} maxSupply
     * @returns {this}
     */
    setMaxSupply(maxSupply: Long | number): this;
    /**
     * @returns {?Key}
     */
    get metadataKey(): Key | null;
    /**
     * @param {Key} key
     * @returns {this}
     */
    setMetadataKey(key: Key): this;
    /**
     * @returns {?Uint8Array}
     */
    get metadata(): Uint8Array | null;
    /**
     * @param {Uint8Array} metadata
     * @returns {this}
     */
    setMetadata(metadata: Uint8Array): this;
    /**
     * @override
     * @protected
     * @returns {HieroProto.proto.ITokenCreateTransactionBody}
     */
    protected override _makeTransactionData(): HieroProto.proto.ITokenCreateTransactionBody;
}
export namespace HieroProto {
    namespace proto {
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
        type ISignedTransaction = import("@hashgraph/proto").proto.ISignedTransaction;
        type TransactionBody = import("@hashgraph/proto").proto.TransactionBody;
        type ITransactionBody = import("@hashgraph/proto").proto.ITransactionBody;
        type ITransactionResponse = import("@hashgraph/proto").proto.ITransactionResponse;
        type ITokenCreateTransactionBody = import("@hashgraph/proto").proto.ITokenCreateTransactionBody;
        type ITokenID = import("@hashgraph/proto").proto.ITokenID;
    }
}
export type BigNumber = import("bignumber.js").default;
export type Channel = import("../channel/Channel.js").default;
export type Client = import("../client/Client.js").default<any, any>;
export type TransactionId = import("../transaction/TransactionId.js").default;
export type CustomFee = import("./CustomFee.js").default;
import Transaction from "../transaction/Transaction.js";
import Long from "long";
import AccountId from "../account/AccountId.js";
import Key from "../Key.js";
import Timestamp from "../Timestamp.js";
import Duration from "../Duration.js";
import TokenType from "./TokenType.js";
import TokenSupplyType from "./TokenSupplyType.js";
