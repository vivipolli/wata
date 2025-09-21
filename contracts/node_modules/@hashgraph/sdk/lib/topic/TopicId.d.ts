/**
 * @typedef {import("long")} Long
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */
/**
 * Unique identifier for a topic (used by the consensus service).
 */
export default class TopicId {
    /**
     * @param {string} text
     * @returns {TopicId}
     */
    static fromString(text: string): TopicId;
    /**
     * @internal
     * @param {HieroProto.proto.ITopicID} id
     * @returns {TopicId}
     */
    static _fromProtobuf(id: HieroProto.proto.ITopicID): TopicId;
    /**
     * @param {Uint8Array} bytes
     * @returns {TopicId}
     */
    static fromBytes(bytes: Uint8Array): TopicId;
    /**
     * @param {string} address
     * @deprecated - Use `fromEvmAddress` instead
     * @returns {TopicId}
     */
    static fromSolidityAddress(address: string): TopicId;
    /**
     * @param {number} shard
     * @param {number} realm
     * @param {string} address
     * @returns {TopicId}
     */
    static fromEvmAddress(shard: number, realm: number, address: string): TopicId;
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
     * @returns {string}
     */
    toSolidityAddress(): string;
    /**
     * @returns {string} EVM-compatible address representation of the entity
     */
    toEvmAddress(): string;
    /**
     * @returns {HieroProto.proto.ITopicID}
     */
    _toProtobuf(): HieroProto.proto.ITopicID;
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
     * @returns {TopicId}
     */
    clone(): TopicId;
    /**
     * @param {TopicId} other
     * @returns {number}
     */
    compare(other: TopicId): number;
}
export type Long = import("long");
export type Client = import("../client/Client.js").default<any, any>;
import * as HieroProto from "@hashgraph/proto";
