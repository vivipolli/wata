/**
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */
/**
 * The ID for a crypto-currency file on Hedera.
 */
declare class FileId {
    /**
     * @param {number} shard
     * @param {number} realm
     * @returns {FileId}
     */
    static getAddressBookFileIdFor(shard?: number, realm?: number): FileId;
    /**
     * @param {number} shard
     * @param {number} realm
     * @returns {FileId}
     */
    static getFeeScheduleFileIdFor(shard?: number, realm?: number): FileId;
    /**
     * @param {number} shard
     * @param {number} realm
     * @returns {FileId}
     */
    static getExchangeRatesFileIdFor(shard?: number, realm?: number): FileId;
    /**
     * @param {string} text
     * @returns {FileId}
     */
    static fromString(text: string): FileId;
    /**
     * @internal
     * @param {HieroProto.proto.IFileID} id
     * @returns {FileId}
     */
    static _fromProtobuf(id: HieroProto.proto.IFileID): FileId;
    /**
     * @param {Uint8Array} bytes
     * @returns {FileId}
     */
    static fromBytes(bytes: Uint8Array): FileId;
    /**
     * @param {string} address
     * @deprecated - Use `fromEvmAddress` instead
     * @returns {FileId}
     */
    static fromSolidityAddress(address: string): FileId;
    /**
     * @param {number} shard
     * @param {number} realm
     * @param {string} address
     * @returns {FileId}
     */
    static fromEvmAddress(shard: number, realm: number, address: string): FileId;
    /**
     * @param {number | Long | import("../EntityIdHelper").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     */
    constructor(props: number | Long | import("../EntityIdHelper").IEntityId, realm?: (number | Long) | undefined, num?: (number | Long) | undefined);
    shard: Long;
    realm: Long;
    num: Long;
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
     * @returns {string} EVM-compatible address representation of the entity
     */
    toEvmAddress(): string;
    /**
     * @internal
     * @returns {HieroProto.proto.IFileID}
     */
    _toProtobuf(): HieroProto.proto.IFileID;
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
     * @returns {FileId}
     */
    clone(): FileId;
    /**
     * @param {FileId} other
     * @returns {number}
     */
    compare(other: FileId): number;
}
declare namespace FileId {
    let ADDRESS_BOOK: FileId;
    let FEE_SCHEDULE: FileId;
    let EXCHANGE_RATES: FileId;
}
export default FileId;
export type Client = import("../client/Client.js").default<any, any>;
import Long from "long";
import * as HieroProto from "@hashgraph/proto";
