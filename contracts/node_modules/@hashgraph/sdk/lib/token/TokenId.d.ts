/**
 * @typedef {import("long")} Long
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */
/**
 * The ID for a crypto-currency token on Hedera.
 */
export default class TokenId {
    /**
     * @param {string} text
     * @returns {TokenId}
     */
    static fromString(text: string): TokenId;
    /**
     * @internal
     * @param {HieroProto.proto.ITokenID} id
     * @returns {TokenId}
     */
    static _fromProtobuf(id: HieroProto.proto.ITokenID): TokenId;
    /**
     * @param {Uint8Array} bytes
     * @returns {TokenId}
     */
    static fromBytes(bytes: Uint8Array): TokenId;
    /**
     * @param {string} address
     * @deprecated - Use `fromEvmAddress` instead
     * @returns {TokenId}
     */
    static fromSolidityAddress(address: string): TokenId;
    /**
     * @param {number} shard
     * @param {number} realm
     * @param {string} address
     * @returns {TokenId}
     */
    static fromEvmAddress(shard: number, realm: number, address: string): TokenId;
    /**
     * @param {number | Long | import("../EntityIdHelper").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     */
    constructor(props: number | Long | import("../EntityIdHelper").IEntityId, realm?: (number | Long) | undefined, num?: (number | Long) | undefined);
    shard: import("long");
    realm: import("long");
    num: import("long");
    /**
     * @type {string | null}
     */
    _checksum: string | null;
    /**
     * @returns {string | null}
     */
    get checksum(): string | null;
    /**
     * @deprecated - Use `validateChecksum` instead
     * @param {Client} client
     */
    validate(client: Client): void;
    /**
     * @param {Client} client
     */
    validateChecksum(client: Client): void;
    /**
     * @deprecated - Use `toEvmAddress` instead
     * @returns {string} solidity address
     */
    toSolidityAddress(): string;
    /**
     * @returns {string}
     */
    toEvmAddress(): string;
    /**
     * @internal
     * @returns {HieroProto.proto.ITokenID}
     */
    _toProtobuf(): HieroProto.proto.ITokenID;
    /**
     * @returns {string}
     */
    toString(): string;
    /**
     * @param {Client} client
     * @returns {string}
     */
    toStringWithChecksum(client: Client): string;
    /**
     * @returns {Uint8Array}
     */
    toBytes(): Uint8Array;
    /**
     * @returns {TokenId}
     */
    clone(): TokenId;
    /**
     * @param {TokenId} other
     * @returns {number}
     */
    compare(other: TokenId): number;
}
export type Long = import("long");
export type Client = import("../client/Client.js").default<any, any>;
import * as HieroProto from "@hashgraph/proto";
