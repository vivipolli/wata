/**
 * @typedef {import("../account/AccountId.js").default} AccountId
 * @typedef {import("../file/FileId.js").default} FileId
 * @typedef {import("../Key.js").default} Key
 * @typedef {import("./ContractFunctionParameters.js").default} ContractFunctionParameters
 * @typedef {import("../Hbar.js").default} Hbar
 * @typedef {import("../Duration.js").default} Duration
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../channel/MirrorChannel.js").default} MirrorChannel
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../transaction/TransactionResponse.js").default} TransactionResponse
 * @typedef {import("../transaction/TransactionReceipt.js").default} TransactionReceipt
 * @typedef {import("../client/Client.js").ClientOperator} ClientOperator
 * @typedef {import("../Signer.js").Signer} Signer
 * @typedef {import("../PrivateKey.js").default} PrivateKey
 * @typedef {import("../transaction/Transaction.js").default} Transaction
 */
/**
 * @typedef {import("bignumber.js").BigNumber} BigNumber
 * @typedef {import("long")} Long
 */
/**
 * A convenience flow that handles the creation of a smart contract on the Hedera network.
 * This flow abstracts away the complexity of the contract creation process by:
 *
 * 1. Creating a file to store the contract bytecode
 * 2. Uploading the contract bytecode in chunks if necessary
 * 3. Creating the contract instance using the uploaded bytecode
 * 4. Cleaning up by deleting the bytecode file (if operator key is available)
 *
 * This flow is particularly useful when deploying large contracts that exceed the 2048 byte
 * limit of a single transaction.
 */
export default class ContractCreateFlow {
    /** @type {Uint8Array | null} */
    _bytecode: Uint8Array | null;
    _contractCreate: ContractCreateTransaction;
    /**
     * Read `Transaction._signerPublicKeys`
     *
     * @internal
     * @type {Set<string>}
     */
    _signerPublicKeys: Set<string>;
    /**
     * Read `Transaction._publicKeys`
     *
     * @private
     * @type {PublicKey[]}
     */
    private _publicKeys;
    /**
     * Read `Transaction._transactionSigners`
     *
     * @private
     * @type {((message: Uint8Array) => Promise<Uint8Array>)[]}
     */
    private _transactionSigners;
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
     * @returns {?Uint8Array}
     */
    get bytecode(): Uint8Array | null;
    /**
     * @param {string | Uint8Array} bytecode
     * @returns {this}
     */
    setBytecode(bytecode: string | Uint8Array): this;
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
    get maxAutomaticTokenAssociation(): number | null;
    /**
     * @param {number} maxAutomaticTokenAssociation
     * @returns {this}
     */
    setMaxAutomaticTokenAssociations(maxAutomaticTokenAssociation: number): this;
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
     * Sign the transaction with the private key
     * **NOTE**: This is a thin wrapper around `.signWith()`
     *
     * @param {PrivateKey} privateKey
     * @returns {this}
     */
    sign(privateKey: PrivateKey): this;
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
     * @returns {this}
     */
    signWith(publicKey: PublicKey, transactionSigner: (message: Uint8Array) => Promise<Uint8Array>): this;
    /**
     * @template {Channel} ChannelT
     * @template {MirrorChannel} MirrorChannelT
     * @param {import("../client/Client.js").default<ChannelT, MirrorChannelT>} client
     * @param {number=} requestTimeout
     * @returns {Promise<TransactionResponse>}
     */
    execute<ChannelT extends Channel, MirrorChannelT extends MirrorChannel>(client: import("../client/Client.js").default<ChannelT, MirrorChannelT>, requestTimeout?: number | undefined): Promise<TransactionResponse>;
    /**
     * @param {Signer} signer
     * @returns {Promise<TransactionResponse>}
     */
    executeWithSigner(signer: Signer): Promise<TransactionResponse>;
}
export type AccountId = import("../account/AccountId.js").default;
export type FileId = import("../file/FileId.js").default;
export type Key = import("../Key.js").default;
export type ContractFunctionParameters = import("./ContractFunctionParameters.js").default;
export type Hbar = import("../Hbar.js").default;
export type Duration = import("../Duration.js").default;
export type Channel = import("../channel/Channel.js").default;
export type MirrorChannel = import("../channel/MirrorChannel.js").default;
export type TransactionId = import("../transaction/TransactionId.js").default;
export type TransactionResponse = import("../transaction/TransactionResponse.js").default;
export type TransactionReceipt = import("../transaction/TransactionReceipt.js").default;
export type ClientOperator = import("../client/Client.js").ClientOperator;
export type Signer = import("../Signer.js").Signer;
export type PrivateKey = import("../PrivateKey.js").default;
export type Transaction = import("../transaction/Transaction.js").default;
export type BigNumber = import("bignumber.js").BigNumber;
export type Long = import("long");
import ContractCreateTransaction from "./ContractCreateTransaction.js";
import PublicKey from "../PublicKey.js";
