/**
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/Transaction.js").default} Transaction
 * @typedef {import("../PublicKey.js").default} PublicKey
 * @typedef {import("./AccountId.js").default} AccountId
 * @typedef {import("../Signer.js").Signer} Signer
 */
/**
 * This class provides static methods to verify signatures and transactions by fetching the account's key
 * from the network. It supports both Client and Signer-based operations.
 *
 * The class provides methods to:
 * - Verify message signatures using account public key
 * - Verify transaction signatures using account public key
 * - Perform verifications using either a Client or Signer instance
 */
export default class AccountInfoFlow {
    /**
     * @param {Client} client
     * @param {AccountId | string} accountId
     * @param {Uint8Array} message
     * @param {Uint8Array} signature
     * @returns {Promise<boolean>}
     */
    static verifySignature(client: Client, accountId: AccountId | string, message: Uint8Array, signature: Uint8Array): Promise<boolean>;
    /**
     * @param {Client} client
     * @param {AccountId | string} accountId
     * @param {Transaction} transaction
     * @returns {Promise<boolean>}
     */
    static verifyTransaction(client: Client, accountId: AccountId | string, transaction: Transaction): Promise<boolean>;
    /**
     * @param {Signer} signer
     * @param {AccountId | string} accountId
     * @param {Uint8Array} message
     * @param {Uint8Array} signature
     * @returns {Promise<boolean>}
     */
    static verifySignatureWithSigner(signer: Signer, accountId: AccountId | string, message: Uint8Array, signature: Uint8Array): Promise<boolean>;
    /**
     * @param {Signer} signer
     * @param {AccountId | string} accountId
     * @param {Transaction} transaction
     * @returns {Promise<boolean>}
     */
    static verifyTransactionWithSigner(signer: Signer, accountId: AccountId | string, transaction: Transaction): Promise<boolean>;
}
export type Client = import("../client/Client.js").default<any, any>;
export type Transaction = import("../transaction/Transaction.js").default;
export type PublicKey = import("../PublicKey.js").default;
export type AccountId = import("./AccountId.js").default;
export type Signer = import("../Signer.js").Signer;
