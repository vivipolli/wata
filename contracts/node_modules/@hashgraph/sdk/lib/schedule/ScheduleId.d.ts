/**
 * @typedef {import("long")} Long
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */
/**
 * Class representing a unique identifier for a scheduled transaction on the Hedera network.
 *
 * A ScheduleId consists of three components:
 * Shard ID: The shard number where the schedule exists
 * Realm ID: The realm number within the shard
 * Schedule Number: The unique number identifying the schedule
 * @augments {EntityId<HieroProto.proto.IScheduleID>}
 */
export default class ScheduleId {
    /**
     * @param {string} text
     * @returns {ScheduleId}
     */
    static fromString(text: string): ScheduleId;
    /**
     * @internal
     * @param {HieroProto.proto.IScheduleID} id
     * @returns {ScheduleId}
     */
    static _fromProtobuf(id: HieroProto.proto.IScheduleID): ScheduleId;
    /**
     * @param {Uint8Array} bytes
     * @returns {ScheduleId}
     */
    static fromBytes(bytes: Uint8Array): ScheduleId;
    /**
     * @param {string} address
     * @returns {ScheduleId}
     */
    static fromSolidityAddress(address: string): ScheduleId;
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
     * @returns {string}
     */
    toSolidityAddress(): string;
    /**
     * @internal
     * @returns {HieroProto.proto.ScheduleID}
     */
    _toProtobuf(): HieroProto.proto.ScheduleID;
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
     * @returns {ScheduleId}
     */
    clone(): ScheduleId;
    /**
     * @param {ScheduleId} other
     * @returns {number}
     */
    compare(other: ScheduleId): number;
}
export type Long = import("long");
export type Client = import("../client/Client.js").default<any, any>;
import * as HieroProto from "@hashgraph/proto";
