/**
 * @typedef {import("./PublicKey.js").default} PublicKey
 * @typedef {import("./account/AccountId.js").default} AccountId
 */
/**
 * Represents a signature associated with a signer in the Hedera network.
 *
 * The `SignerSignature` class encapsulates the public key, signature, and account ID
 * of a signer. It is used to manage and validate signatures in transactions, ensuring
 * that the correct signers are associated with the transaction data.
 */
export default class SignerSignature {
    /**
     * @param {object} props
     * @param {PublicKey} props.publicKey
     * @param {Uint8Array} props.signature
     * @param {AccountId} props.accountId
     */
    constructor(props: {
        publicKey: PublicKey;
        signature: Uint8Array;
        accountId: AccountId;
    });
    publicKey: import("./PublicKey.js").default;
    signature: Uint8Array<ArrayBufferLike>;
    accountId: import("./account/AccountId.js").default;
}
export type PublicKey = import("./PublicKey.js").default;
export type AccountId = import("./account/AccountId.js").default;
