/**
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("./Transaction.js").default} Transaction
 * @typedef {import("./TransactionReceipt.js").default} TransactionReceipt
 * @typedef {import("./TransactionRecord.js").default} TransactionRecord
 * @typedef {import("../Signer.js").Signer} Signer
 * @typedef {import("../logger/Logger.js").default} Logger
 */
/**
 * @typedef {object} TransactionResponseJSON
 * @property {string} nodeId
 * @property {string} transactionHash
 * @property {string} transactionId
 */
/**
 * When the client sends the node a transaction of any kind, the node
 * replies with this, which simply says that the transaction passed
 * the pre-check (so the node will submit it to the network) or it failed
 * (so it won't). To learn the consensus result, the client should later
 * obtain a receipt (free), or can buy a more detailed record (not free).
 * <br>
 * See <a href="https://docs.hedera.com/guides/docs/hedera-api/miscellaneous/transactionresponse">Hedera Documentation</a>
 */
export default class TransactionResponse {
    /**
     * @param {TransactionResponseJSON} json
     * @returns {TransactionResponse}
     */
    static fromJSON(json: TransactionResponseJSON): TransactionResponse;
    /**
     * @internal
     * @param {object} props
     * @param {AccountId} props.nodeId
     * @param {Uint8Array} props.transactionHash
     * @param {TransactionId} props.transactionId
     * @param {Transaction} [props.transaction]
     * @param {Logger | null} [props.logger]
     */
    constructor(props: {
        nodeId: AccountId;
        transactionHash: Uint8Array;
        transactionId: TransactionId;
        transaction?: import("./Transaction.js").default | undefined;
        logger?: import("../logger/Logger.js").default | null | undefined;
    });
    /** @readonly */
    readonly nodeId: AccountId;
    /** @readonly */
    readonly transactionHash: Uint8Array<ArrayBufferLike>;
    transactionId: TransactionId;
    transaction: import("./Transaction.js").default | undefined;
    logger: import("../logger/Logger.js").default | null | undefined;
    /**
     * @param {Client} client
     * @returns {Promise<TransactionReceipt>}
     */
    getReceipt(client: Client): Promise<TransactionReceipt>;
    /**
     * getRecord is calling getReceipt and in case the receipt status code is not OK, only the receipt is returned.
     *
     * @param {Client} client
     * @returns {Promise<TransactionRecord>}
     */
    getRecord(client: Client): Promise<TransactionRecord>;
    /**
     * getVerboseRecord is calling getReceipt and in case the receipt status code is not OK, the record is returned.
     *
     * @param {Client} client
     * @returns {Promise<TransactionRecord>}
     */
    getVerboseRecord(client: Client): Promise<TransactionRecord>;
    /**
     * @param {Signer} signer
     * @returns {Promise<TransactionReceipt>}
     */
    getReceiptWithSigner(signer: Signer): Promise<TransactionReceipt>;
    /**
     * @param {Signer} signer
     * @returns {Promise<TransactionRecord>}
     */
    getRecordWithSigner(signer: Signer): Promise<TransactionRecord>;
    /**
     * @returns {TransactionReceiptQuery}
     */
    getReceiptQuery(): TransactionReceiptQuery;
    /**
     * @returns {TransactionRecordQuery}
     */
    getRecordQuery(): TransactionRecordQuery;
    /**
     * @returns {TransactionResponseJSON}
     */
    toJSON(): TransactionResponseJSON;
    /**
     *
     * @param {Client} client
     * @returns {Promise<TransactionReceipt>}
     */
    _retryTransaction(client: Client): Promise<TransactionReceipt>;
    /**
     * @returns {string}
     */
    toString(): string;
}
export type Client = import("../client/Client.js").default<any, any>;
export type Transaction = import("./Transaction.js").default;
export type TransactionReceipt = import("./TransactionReceipt.js").default;
export type TransactionRecord = import("./TransactionRecord.js").default;
export type Signer = import("../Signer.js").Signer;
export type Logger = import("../logger/Logger.js").default;
export type TransactionResponseJSON = {
    nodeId: string;
    transactionHash: string;
    transactionId: string;
};
import AccountId from "../account/AccountId.js";
import TransactionId from "./TransactionId.js";
import TransactionReceiptQuery from "./TransactionReceiptQuery.js";
import TransactionRecordQuery from "./TransactionRecordQuery.js";
