/**
 * @typedef {import("./transaction/Transaction.js").default} Transaction
 * @typedef {import("./account/AccountId.js").default} AccountId
 */
/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IKey} HieroProto.proto.IKey
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignaturePair} HieroProto.proto.ISignaturePair
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 */
export default class PublicKey extends Key {
    /**
     * @param {Uint8Array} data
     * @returns {PublicKey}
     */
    static fromBytes(data: Uint8Array): PublicKey;
    /**
     * @param {Uint8Array} data
     * @returns {PublicKey}
     */
    static fromBytesED25519(data: Uint8Array): PublicKey;
    /**
     * @param {Uint8Array} data
     * @returns {PublicKey}
     */
    static fromBytesECDSA(data: Uint8Array): PublicKey;
    /**
     * Parse a public key from a string of hexadecimal digits.
     *
     * The public key may optionally be prefixed with
     * the DER header.
     *
     * @param {string} text
     * @returns {PublicKey}
     */
    static fromString(text: string): PublicKey;
    /**
     * Parse an ECDSA public key from a string of hexadecimal digits.
     *
     * @param {string} text
     * @returns {PublicKey}
     */
    static fromStringECDSA(text: string): PublicKey;
    /**
     * Parse an ED25519 public key from a string of hexadecimal digits.
     *
     * @param {string} text
     * @returns {PublicKey}
     */
    static fromStringED25519(text: string): PublicKey;
    /**
     * Returns an "unusable" public key.
     * “Unusable” refers to a key such as an Ed25519 0x00000... public key,
     * since it is (presumably) impossible to find the 32-byte string whose SHA-512 hash begins with 32 bytes of zeros.
     *
     * @returns {PublicKey}
     */
    static unusableKey(): PublicKey;
    /**
     * @internal
     * @hideconstructor
     * @param {PublicKeyCrypto} key
     */
    constructor(key: PublicKeyCrypto);
    _key: PublicKeyCrypto;
    /**
     * Verify a signature on a message with this public key.
     *
     * @param {Uint8Array} message
     * @param {Uint8Array} signature
     * @returns {boolean}
     */
    verify(message: Uint8Array, signature: Uint8Array): boolean;
    /**
     * Reports whether this key signed the given transaction.
     * @param {Transaction} transaction
     * @returns {boolean}
     */
    verifyTransaction(transaction: Transaction): boolean;
    /**
     * @returns {Uint8Array}
     */
    toBytes(): Uint8Array;
    /**
     * @returns {Uint8Array}
     */
    toBytesDer(): Uint8Array;
    /**
     * @returns {Uint8Array}
     */
    toBytesRaw(): Uint8Array;
    /**
     * @deprecated Use `toEvmAddress()` instead.
     * @returns {string}
     */
    toEthereumAddress(): string;
    /**
     * @returns {string}
     */
    toEvmAddress(): string;
    /**
     * @returns {string}
     */
    toStringDer(): string;
    /**
     * @returns {string}
     */
    toStringRaw(): string;
    /**
     * @param {PublicKey} other
     * @returns {boolean}
     */
    equals(other: PublicKey): boolean;
    /**
     * @param {Uint8Array} signature
     * @returns {HieroProto.proto.ISignaturePair}
     */
    _toProtobufSignature(signature: Uint8Array): HieroProto.proto.ISignaturePair;
    /**
     * @returns {string}
     */
    get type(): string;
    /**
     * @param {Long | number} shard
     * @param {Long | number} realm
     * @returns {AccountId}
     */
    toAccountId(shard: Long | number, realm: Long | number): AccountId;
}
export type Transaction = import("./transaction/Transaction.js").default;
export type AccountId = import("./account/AccountId.js").default;
export namespace HieroProto {
    namespace proto {
        type IKey = import("@hashgraph/proto").proto.IKey;
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
        type ISignaturePair = import("@hashgraph/proto").proto.ISignaturePair;
        type ISignedTransaction = import("@hashgraph/proto").proto.ISignedTransaction;
    }
}
import Key from "./Key.js";
import { PublicKey as PublicKeyCrypto } from "@hashgraph/cryptography";
