/**
 * @typedef {import("../PrivateKey.js").default} PrivateKey
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../Signer.js").default} Signer
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../transaction/Transaction.js").default} Transaction
 * @typedef {import("../transaction/TransactionResponse.js").default} TransactionResponse
 * @typedef {import("../token/TokenId.js").default} TokenId
 * @typedef {import("../token/NftId.js").default} NftId
 * @typedef {import("../PublicKey.js").default} PublicKey
 * @typedef {import("../account/AccountId.js").default} AccountId
 */
/**
 * Reject undesired token(s) and dissociate in a single flow.
 */
export default class TokenRejectFlow {
    /**
     * @private
     * @type {?AccountId}
     */
    private _ownerId;
    /**
     * @private
     * @type {TokenId[]}
     */
    private _tokenIds;
    /**
     * @private
     * @type {NftId[]}
     */
    private _nftIds;
    /**
     * @private
     * @type {?Client}
     */
    private _freezeWithClient;
    /**
     * @private
     * @type {?PrivateKey}
     */
    private _signPrivateKey;
    /**
     * @private
     * @type {?PublicKey}
     */
    private _signPublicKey;
    /**
     * @private
     * @type {?(message: Uint8Array) => Promise<Uint8Array>}
     */
    private _transactionSigner;
    /**
     *
     * @param {AccountId} ownerId
     * @returns {this}
     */
    setOwnerId(ownerId: AccountId): this;
    /**
     * @returns {?AccountId}
     */
    get ownerId(): AccountId | null;
    /**
     *
     * @param {TokenId[]} ids
     * @returns {this}
     */
    setTokenIds(ids: TokenId[]): this;
    /**
     *
     * @param {TokenId} id
     * @returns {this}
     */
    addTokenId(id: TokenId): this;
    /**
     *
     * @returns {TokenId[]}
     */
    get tokenIds(): TokenId[];
    /**
     *
     * @param {NftId[]} ids
     * @returns {this}
     */
    setNftIds(ids: NftId[]): this;
    /**
     *
     * @param {NftId} id
     * @returns {this}
     */
    addNftId(id: NftId): this;
    /**
     *
     * @returns {NftId[]}
     */
    get nftIds(): NftId[];
    /**
     *
     * @param {PrivateKey} privateKey
     * @returns {this}
     */
    sign(privateKey: PrivateKey): this;
    /**
     *
     * @param {PublicKey} publicKey
     * @param {((message: Uint8Array) => Promise<Uint8Array>)} signer
     * @returns {this}
     */
    signWith(publicKey: PublicKey, signer: ((message: Uint8Array) => Promise<Uint8Array>)): this;
    /**
     * @param {Client} client
     * @returns {this}
     */
    signWithOperator(client: Client): this;
    /**
     * @private
     * @param {Transaction} transaction
     */
    private fillOutTransaction;
    /**
     *
     * @param {Client} client
     * @returns {this}
     */
    freezeWith(client: Client): this;
    /**
     * @param {Client} client
     * @returns {Promise<TransactionResponse>}
     */
    execute(client: Client): Promise<TransactionResponse>;
    requireNotFrozen(): void;
}
export type PrivateKey = import("../PrivateKey.js").default;
export type Client = import("../client/Client.js").default<any, any>;
export type Signer = any;
export type TransactionId = import("../transaction/TransactionId.js").default;
export type Transaction = import("../transaction/Transaction.js").default;
export type TransactionResponse = import("../transaction/TransactionResponse.js").default;
export type TokenId = import("../token/TokenId.js").default;
export type NftId = import("../token/NftId.js").default;
export type PublicKey = import("../PublicKey.js").default;
export type AccountId = import("../account/AccountId.js").default;
