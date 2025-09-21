/**
 * @typedef {import("bignumber.js").default} BigNumber
 */
/**
 * @typedef {import("../schedule/ScheduleCreateTransaction.js").default} ScheduleCreateTransaction
 * @typedef {import("../PrivateKey.js").default} PrivateKey
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../Signer.js").Signer} Signer
 */
export const DEFAULT_AUTO_RENEW_PERIOD: Long;
export const DEFAULT_RECORD_THRESHOLD: Hbar;
export const CHUNK_SIZE: 1024;
/**
 * @type {Map<NonNullable<HieroProto.proto.TransactionBody["data"]>, (transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.TransactionBody[]) => Transaction>}
 */
export const TRANSACTION_REGISTRY: Map<NonNullable<HieroProto.proto.TransactionBody["data"]>, (transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.TransactionBody[]) => Transaction>;
/**
 * Base class for all transactions that may be submitted to Hedera.
 *
 * @abstract
 * @augments {Executable<HieroProto.proto.ITransaction, HieroProto.proto.ITransactionResponse, TransactionResponse>}
 */
export default class Transaction extends Executable<HieroProto.proto.ITransaction, HieroProto.proto.ITransactionResponse, TransactionResponse> {
    /**
     * Deserialize a transaction from bytes. The bytes can either be a `proto.Transaction` or
     * `proto.TransactionList`.
     *
     * @param {Uint8Array} bytes
     * @returns {Transaction}
     */
    static fromBytes(bytes: Uint8Array): Transaction;
    /**
     * This method is called by each `*Transaction._fromProtobuf()` method. It does
     * all the finalization before the user gets hold of a complete `Transaction`
     *
     * @template {Transaction} TransactionT
     * @param {TransactionT} transaction
     * @param {HieroProto.proto.ITransaction[]} transactions
     * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {TransactionT}
     */
    static _fromProtobufTransactions<TransactionT extends Transaction>(transaction: TransactionT, transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): TransactionT;
    constructor();
    /**
     * List of proto transactions that have been built from this SDK
     * transaction.
     *
     * This is a 2-D array built into one, meaning to
     * get to the next row you'd index into this array `row * rowLength + column`
     * where `rowLength` is `nodeAccountIds.length`
     *
     * @internal
     * @type {List<HieroProto.proto.ITransaction | null>}
     */
    _transactions: List<HieroProto.proto.ITransaction | null>;
    /**
     * List of proto transactions that have been built from this SDK
     * transaction.
     *
     * This is a 2-D array built into one, meaning to
     * get to the next row you'd index into this array `row * rowLength + column`
     * where `rowLength` is `nodeAccountIds.length`
     *
     * @internal
     * @type {List<HieroProto.proto.ISignedTransaction>}
     */
    _signedTransactions: List<HieroProto.proto.ISignedTransaction>;
    /**
     * Set of public keys (as string) who have signed this transaction so
     * we do not allow them to sign it again.
     *
     * @internal
     * @type {Set<string>}
     */
    _signerPublicKeys: Set<string>;
    /**
     * The transaction valid duration
     *
     * @private
     * @type {number}
     */
    private _transactionValidDuration;
    /**
     * The default max transaction fee for this particular transaction type.
     * Most transactions use the default of 2 Hbars, but some requests such
     * as `TokenCreateTransaction` need to use a different default value.
     *
     * @protected
     * @type {Hbar}
     */
    protected _defaultMaxTransactionFee: Hbar;
    /**
     * The maximum custom fee that the user is willing to pay for the message. If left empty, the user is willing to pay any custom fee.
     * If used with a transaction type that does not support custom fee limits, the transaction will fail.
     * @type {CustomFeeLimit[]}
     */
    _customFeeLimits: CustomFeeLimit[];
    /**
     * The max transaction fee on the request. This field is what users are able
     * to set, not the `defaultMaxTransactionFee`. The purpose of this field is
     * to allow us to determine if the user set the field explicitly, or if we're
     * using the default max transation fee for the request.
     *
     * @private
     * @type {Hbar | null}
     */
    private _maxTransactionFee;
    /**
     * The transaction's memo
     *
     * @private
     * @type {string}
     */
    private _transactionMemo;
    /**
     * The list of transaction IDs. This list will almost always be of length 1.
     * The only time this list will be a different length is for chunked transactions.
     * The only two chunked transactions supported right now are `FileAppendTransaction`
     * and `TopicMessageSubmitTransaction`
     *
     * @protected
     * @type {List<TransactionId>}
     */
    protected _transactionIds: List<TransactionId>;
    /**
     * A list of public keys that will be added to the requests signatures
     *
     * @private
     * @type {PublicKey[]}
     */
    private _publicKeys;
    /**
     * The list of signing function 1-1 with `_publicKeys` which sign the request.
     * The reason this list allows `null` is because if we go from bytes into
     * a transaction, then we know the public key, but we don't have the signing function.
     *
     * @private
     * @type {(((message: Uint8Array) => Promise<Uint8Array>) | null)[]}
     */
    private _transactionSigners;
    /**
     * Determine if we should regenerate transaction IDs when we receive `TRANSACITON_EXPIRED`
     *
     * @private
     * @type {?boolean}
     */
    private _regenerateTransactionId;
    /**
     * The key used to sign the batch transaction
     *
     * @private
     * @type {Key | null}
     */
    private _batchKey;
    /**
     * Whether the transaction is throttled
     *
     * @private
     * @type {boolean}
     */
    private _isThrottled;
    /**
     * Convert this transaction a `ScheduleCreateTransaction`
     *
     * @returns {ScheduleCreateTransaction}
     */
    schedule(): ScheduleCreateTransaction;
    /**
     * @description Batchify method is used to mark a transaction as part of a batch transaction or make it so-called inner transaction.
     * The Transaction will be frozen and signed by the operator of the client.
     *
     * @param {import("../client/Client.js").default<Channel, *>} client
     * @param {Key} batchKey
     * @returns {Promise<this>}
     */
    batchify(client: import("../client/Client.js").default<Channel, any>, batchKey: Key): Promise<this>;
    /**
     * Set the node account IDs
     *
     * @override
     * @param {AccountId[]} nodeIds
     * @returns {this}
     */
    override setNodeAccountIds(nodeIds: AccountId[]): this;
    /**
     * Get the transaction valid duration
     *
     * @returns {number}
     */
    get transactionValidDuration(): number;
    /**
     *  Protobuf encoding has specific rules about how data is serialized
     *  Different fields take different amounts of space depending on their values
     *  The actual wire format size can only be determined after encoding
     *
     * @returns {Promise<number>}
     */
    get size(): Promise<number>;
    /**
     * Get the transaction body size
     * Protobuf encoding has specific rules about how data is serialized
     * Different fields take different amounts of space depending on their values
     * The actual wire format size can only be determined after encoding
     *
     * @returns {number}
     */
    get bodySize(): number;
    /**
     * Sets the duration (in seconds) that this transaction is valid for.
     *
     * This is defaulted to 120 seconds (from the time its executed).
     *
     * @param {number} validDuration
     * @returns {this}
     */
    setTransactionValidDuration(validDuration: number): this;
    /**
     * Get the max transaction fee
     *
     * @returns {?Hbar}
     */
    get maxTransactionFee(): Hbar | null;
    /**
     * Set the maximum transaction fee the operator (paying account)
     * is willing to pay.
     *
     * @param {number | string | Long | BigNumber | Hbar} maxTransactionFee
     * @returns {this}
     */
    setMaxTransactionFee(maxTransactionFee: number | string | Long | BigNumber | Hbar): this;
    /**
     * Is transaction ID regeneration enabled
     *
     * @returns {?boolean}
     */
    get regenerateTransactionId(): boolean | null;
    /**
     * Set the maximum transaction fee the operator (paying account)
     * is willing to pay.
     *
     * @param {boolean} regenerateTransactionId
     * @returns {this}
     */
    setRegenerateTransactionId(regenerateTransactionId: boolean): this;
    /**
     * Get the transaction memo
     *
     * @returns {string}
     */
    get transactionMemo(): string;
    /**
     * Set a note or description to be recorded in the transaction
     * record (maximum length of 100 bytes).
     *
     * @param {string} transactionMemo
     * @returns {this}
     */
    setTransactionMemo(transactionMemo: string): this;
    /**
     * Get the curent transaction ID
     *
     * @returns {?TransactionId}
     */
    get transactionId(): TransactionId | null;
    /**
     * Set the ID for this transaction.
     *
     * The transaction ID includes the operator's account ( the account paying the transaction
     * fee). If two transactions have the same transaction ID, they won't both have an effect. One
     * will complete normally and the other will fail with a duplicate transaction status.
     *
     * Normally, you should not use this method. Just before a transaction is executed, a
     * transaction ID will be generated from the operator on the client.
     *
     * @param {TransactionId} transactionId
     * @returns {this}
     */
    setTransactionId(transactionId: TransactionId): this;
    /**
     * How many chunk sizes are expected
     * @abstract
     * @internal
     * @returns {number}
     */
    getRequiredChunks(): number;
    /**
     * Get the body sizes for all chunks in a Chunked transaction.
     * For transactions with multiple chunks (like large topic message submissions),
     * this returns an array containing the size of each chunk's transaction body.
     * The size is calculated by encoding the transaction body to protobuf format.
     *
     * @returns {number[]} An array of body sizes, where each element represents
     * the size in bytes of a chunk's transaction body
     *
     */
    get bodySizeAllChunks(): number[];
    /**
     * Sign the transaction with the private key
     * **NOTE**: This is a thin wrapper around `.signWith()`
     *
     * @param {PrivateKey} privateKey
     * @returns {Promise<this>}
     */
    sign(privateKey: PrivateKey): Promise<this>;
    /**
     * Sign the transaction with the public key and signer function
     *
     * If sign on demand is enabled no signing will be done immediately, instead
     * the private key signing function and public key are saved to be used when
     * a user calls an exit condition method (not sure what a better name for this is)
     * such as `toBytes[Async]()`, `getTransactionHash[PerNode]()` or `execute()`.
     *
     * @param {PublicKey} publicKey
     * @param {(message: Uint8Array) => Promise<Uint8Array>} transactionSigner
     * @returns {Promise<this>}
     */
    signWith(publicKey: PublicKey, transactionSigner: (message: Uint8Array) => Promise<Uint8Array>): Promise<this>;
    /**
     * Sign the transaction with the client operator. This is a thin wrapper
     * around `.signWith()`
     *
     * **NOTE**: If client does not have an operator set, this method will throw
     *
     * @param {import("../client/Client.js").default<Channel, *>} client
     * @returns {Promise<this>}
     */
    signWithOperator(client: import("../client/Client.js").default<Channel, any>): Promise<this>;
    /**
     * Resets the transaction to its initial state
     * @param {Client} client
     */
    _resetTransaction(client: Client): void;
    /**
     * @deprecated - Using uint8array and uint8array[] as signaturemap is deprecated,
     * use SignatureMap insted.
     * @overload
     * @param { PublicKey } publicKey
     * @param { Uint8Array | Uint8Array[] } signatureMap
     * @returns {this}
     */
    addSignature(publicKey: PublicKey, signatureMap: Uint8Array | Uint8Array[]): this;
    /**
     * @overload
     * @param {PublicKey} publicKey
     * @param { SignatureMap } signatureMap
     * @returns {this}
     */
    addSignature(publicKey: PublicKey, signatureMap: SignatureMap): this;
    /**
     * Add a signature explicitly
     * This method supports both single and multiple signatures. A single signature will be applied to all transactions,
     *
     * While an array of signatures must correspond to each transaction individually.
     *
     * @param {PublicKey} publicKey
     * @param {Uint8Array | Uint8Array[]} signature
     * @returns {this}
     */
    _addSignatureLegacy(publicKey: PublicKey, signature: Uint8Array | Uint8Array[]): this;
    /**
     * Get the current signatures on the request
     * **NOTE**: Does NOT support sign on demand
     * @returns {SignatureMapLegacy}
     */
    getSignaturesLegacy(): SignatureMapLegacy;
    /**
     * This method removes all signatures from the transaction based on the public key provided.
     *
     * @param {PublicKey} publicKey - The public key associated with the signature to remove.
     * @returns {Uint8Array[]} The removed signatures.
     */
    removeSignature(publicKey: PublicKey): Uint8Array[];
    /**
     * This method clears all signatures from the transaction and returns them in a specific format.
     *
     * It will call collectSignatures to get the removed signatures, then clear all signatures
     * from the internal tracking.
     *
     * @returns { Map<PublicKey, Uint8Array[] | Uint8Array> } The removed signatures in the specified format.
     */
    removeAllSignatures(): Map<PublicKey, Uint8Array[] | Uint8Array>;
    /**
     * @deprecated - Use the legacy=flag instead to use the modern approach
     * @overload
     * @param {true} legacy
     * @returns {SignatureMapLegacy}
     */
    getSignatures(legacy: true): SignatureMapLegacy;
    /**
     * @overload
     * @param {false} [legacy]
     * @returns {SignatureMap}
     */
    getSignatures(legacy?: false | undefined): SignatureMap;
    /**
     * Get the current signatures on the request
     *
     * **NOTE**: Supports sign on demand
     *
     * @returns {Promise<SignatureMap>}
     */
    getSignaturesAsync(): Promise<SignatureMap>;
    /**
     * Not sure why this is called `setTransactionId()` when it doesn't set anything...
     * FIXME: Remove this?
     */
    _setTransactionId(): void;
    /**
     * Set the node account IDs using the client
     *
     * @param {?import("../client/Client.js").default<Channel, *>} client
     */
    _setNodeAccountIds(client: import("../client/Client.js").default<Channel, any> | null): void;
    /**
     * @description Set the key that will sign the batch of which this Transaction is a part of.
     * @param {Key} batchKey
     * @returns {this}
     */
    setBatchKey(batchKey: Key): this;
    /**
     * @description Get the key that will sign the batch of which this Transaction is a part of.
     * @returns {Key | null | undefined}
     */
    get batchKey(): Key | null | undefined;
    /**
     * Returns a List of SignableNodeTransactionBodyBytes for each node the transaction is intended for.
     * These are the canonical bytes that must be signed externally (e.g., via HSM).
     *
     * @returns {SignableNodeTransactionBodyBytes[]}
     */
    get signableNodeBodyBytesList(): SignableNodeTransactionBodyBytes[];
    /**
     * Build all the signed transactions from the node account IDs
     *
     * @private
     */
    private _buildSignedTransactions;
    /**
     * Build all the signed transactions from the node account IDs
     *
     * @internal
     */
    _buildIncompleteTransactions(): void;
    /**
     * Freeze this transaction from future modification to prepare for
     * signing or serialization.
     *
     * @returns {this}
     */
    freeze(): this;
    /**
     * @param {?AccountId} accountId
     */
    _freezeWithAccountId(accountId: AccountId | null): void;
    _operatorAccountId: AccountId | null | undefined;
    /**
     * Freeze this transaction from further modification to prepare for
     * signing or serialization.
     *
     * Will use the `Client`, if available, to generate a default Transaction ID and select 1/3
     * nodes to prepare this transaction for.
     *
     * @param {?import("../client/Client.js").default<Channel, *>} client
     * @returns {this}
     */
    freezeWith(client: import("../client/Client.js").default<Channel, any> | null): this;
    /**
     * Sign the transaction using a signer
     *
     * This is part of the signature provider feature
     *
     * @param {Signer} signer
     * @returns {Promise<this>}
     */
    signWithSigner(signer: Signer): Promise<this>;
    /**
     * Freeze the transaction using a signer
     *
     * This is part of the signature provider feature.
     *
     * @param {Signer} signer
     * @returns {Promise<this>}
     */
    freezeWithSigner(signer: Signer): Promise<this>;
    /**
     * Serialize the transaction into bytes
     *
     * **NOTE**: Supports sign on demand
     *
     * @returns {Promise<Uint8Array>}
     */
    toBytesAsync(): Promise<Uint8Array>;
    /**
     * Get the transaction hash
     *
     * @returns {Promise<Uint8Array>}
     */
    getTransactionHash(): Promise<Uint8Array>;
    /**
     * Get all the transaction hashes
     *
     * @returns {Promise<TransactionHashMap>}
     */
    getTransactionHashPerNode(): Promise<TransactionHashMap>;
    /**
     * Is transaction frozen
     *
     * @returns {boolean}
     */
    isFrozen(): boolean;
    /**
     * @param {Client} client
     */
    _validateChecksums(client: Client): void;
    /**
     * Sign a `proto.SignedTransaction` with all the keys
     *
     * @private
     * @returns {Promise<HieroProto.proto.ISignedTransaction>}
     */
    private _signTransaction;
    /**
     * Construct a new transaction ID at the current index
     *
     * @private
     */
    private _buildNewTransactionIdList;
    /**
     * Build each signed transaction in a loop
     *
     * @internal
     */
    _buildAllTransactions(): void;
    /**
     * Build and and sign each transaction in a loop
     *
     * This method is primary used in the exist condition methods
     * which are not `execute()`, e.g. `toBytesAsync()` and `getSignaturesAsync()`
     *
     * @private
     */
    private _buildAllTransactionsAsync;
    /**
     * Build a transaction at a particular index
     *
     * @internal
     * @param {number} index
     */
    _buildTransaction(index: number): void;
    /**
     * Build a trransaction using the current index, where the current
     * index is determined by `this._nodeAccountIds.index` and
     * `this._transactionIds.index`
     *
     * @private
     * @returns {Promise<HieroProto.proto.ITransaction>}
     */
    private _buildTransactionAsync;
    /**
     * Make a signed transaction given a node account ID
     *
     * @internal
     * @param {?AccountId} nodeId
     * @returns {HieroProto.proto.ISignedTransaction}
     */
    _makeSignedTransaction(nodeId: AccountId | null): HieroProto.proto.ISignedTransaction;
    /**
     * Make a protobuf transaction body
     *
     * @private
     * @param {?AccountId} nodeId
     * @returns {HieroProto.proto.ITransactionBody}
     */
    private _makeTransactionBody;
    /**
     * This method returns a key for the `data` field in a transaction body.
     * Each transaction overwrite this to make sure when we build the transaction body
     * we set the right data field.
     *
     * @abstract
     * @protected
     * @returns {NonNullable<HieroProto.proto.TransactionBody["data"]>}
     */
    protected _getTransactionDataCase(): NonNullable<HieroProto.proto.TransactionBody["data"]>;
    /**
     * Make a scheduled transaction body
     * FIXME: Should really call this `makeScheduledTransactionBody` to be consistent
     *
     * @internal
     * @returns {HieroProto.proto.ISchedulableTransactionBody}
     */
    _getScheduledTransactionBody(): HieroProto.proto.ISchedulableTransactionBody;
    /**
     * Make the transaction body data.
     *
     * @abstract
     * @protected
     * @returns {object}
     */
    protected _makeTransactionData(): object;
    /**
     * FIXME: Why do we have `isFrozen` and `_isFrozen()`?
     *
     * @protected
     * @returns {boolean}
     */
    protected _isFrozen(): boolean;
    /**
     * Require the transaction to NOT be frozen
     *
     * @internal
     */
    _requireNotFrozen(): void;
    /**
     * Require the transaction to have sign on demand disabled
     *
     * @internal
     */
    _requireNotSignOnDemand(): void;
    /**
     * Require the transaction to be frozen
     *
     * @internal
     */
    _requireFrozen(): void;
    /**
     * Require the transaction to have a single node account ID set
     *
     * @internal
     * @protected
     */
    protected _requireOneNodeAccountId(): void;
    /**
     * @param {HieroProto.proto.Transaction} request
     * @returns {Uint8Array}
     */
    _requestToBytes(request: HieroProto.proto.Transaction): Uint8Array;
    /**
     * @param {HieroProto.proto.TransactionResponse} response
     * @returns {Uint8Array}
     */
    _responseToBytes(response: HieroProto.proto.TransactionResponse): Uint8Array;
    /**
     * Removes all signatures from a transaction and collects the removed signatures.
     *
     * @param {HieroProto.proto.ISignedTransaction} transaction - The transaction object to process.
     * @param {string} publicKeyHex - The hexadecimal representation of the public key.
     * @returns {Uint8Array[]} An array of removed signatures.
     */
    _removeSignaturesFromTransaction(transaction: HieroProto.proto.ISignedTransaction, publicKeyHex: string): Uint8Array[];
    /**
     * Determines whether a signature should be removed based on the provided public key.
     *
     * @param {HieroProto.proto.ISignaturePair} sigPair - The signature pair object that contains
     *        the public key prefix and signature to be evaluated.
     * @param {string} publicKeyHex - The hexadecimal representation of the public key to compare against.
     * @returns {boolean} `true` if the public key prefix in the signature pair matches the provided public key,
     *          indicating that the signature should be removed; otherwise, `false`.
     */
    _shouldRemoveSignature: (sigPair: HieroProto.proto.ISignaturePair, publicKeyHex: string) => boolean;
    /**
     * Collects all signatures from signed transactions and returns them in a format keyed by PublicKey.
     *
     * @returns { Map<PublicKey, Uint8Array[]> } The collected signatures keyed by PublicKey.
     */
    _collectSignaturesByPublicKey(): Map<PublicKey, Uint8Array[]>;
}
/**
 * This is essentially a registry/cache for a callback that creates a `ScheduleCreateTransaction`
 *
 * @type {(() => ScheduleCreateTransaction)[]}
 */
export const SCHEDULE_CREATE_TRANSACTION: (() => ScheduleCreateTransaction)[];
export type BigNumber = import("bignumber.js").default;
export type ScheduleCreateTransaction = import("../schedule/ScheduleCreateTransaction.js").default;
export type PrivateKey = import("../PrivateKey.js").default;
export type Channel = import("../channel/Channel.js").default;
export type Client = import("../client/Client.js").default<any, any>;
export type Signer = import("../Signer.js").Signer;
import Long from "long";
import Hbar from "../Hbar.js";
import * as HieroProto from "@hashgraph/proto";
import TransactionId from "./TransactionId.js";
import AccountId from "../account/AccountId.js";
import TransactionResponse from "./TransactionResponse.js";
import Executable from "../Executable.js";
import List from "./List.js";
import CustomFeeLimit from "./CustomFeeLimit.js";
import Key from "../Key.js";
import PublicKey from "../PublicKey.js";
import SignatureMap from "./SignatureMap.js";
import SignatureMapLegacy from "./SignatureMapLegacy.js";
import SignableNodeTransactionBodyBytes from "./SignableNodeTransactionBodyBytes.js";
import TransactionHashMap from "./TransactionHashMap.js";
