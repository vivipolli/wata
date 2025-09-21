/**
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */
/**
 * The ID for a crypto-currency contract on Hedera.
 */
export default class ContractId extends Key {
    /**
     * @description This handles both long-zero format and evm address format addresses.
     * If an actual evm address is passed, please use `ContractId.populateAccountNum(client)` method
     * to get the actual `num` value, since there is no cryptographic relation to the evm address
     * and cannot be populated directly
     * @param {Long | number} shard
     * @param {Long | number} realm
     * @param {string} evmAddress
     * @returns {ContractId}
     */
    static fromEvmAddress(shard: Long | number, realm: Long | number, evmAddress: string): ContractId;
    /**
     * @param {string} text
     * @returns {ContractId}
     */
    static fromString(text: string): ContractId;
    /**
     * @internal
     * @param {HieroProto.proto.IContractID} id
     * @returns {ContractId}
     */
    static _fromProtobuf(id: HieroProto.proto.IContractID): ContractId;
    /**
     * @param {Uint8Array} bytes
     * @returns {ContractId}
     */
    static fromBytes(bytes: Uint8Array): ContractId;
    /**
     * @deprecated - Use `fromEvmAddress` instead
     * @param {string} address
     * @returns {ContractId}
     */
    static fromSolidityAddress(address: string): ContractId;
    /**
     * @param {HieroProto.proto.IContractID} key
     * @returns {ContractId}
     */
    static __fromProtobufKey(key: HieroProto.proto.IContractID): ContractId;
    /**
     * @param {number | Long | import("../EntityIdHelper").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     * @param {Uint8Array=} evmAddress
     */
    constructor(props: number | Long | import("../EntityIdHelper").IEntityId, realm?: (number | Long) | undefined, num?: (number | Long) | undefined, evmAddress?: Uint8Array | undefined);
    shard: Long;
    realm: Long;
    num: Long;
    evmAddress: Uint8Array<ArrayBufferLike> | null;
    /**
     * @type {string | null}
     */
    _checksum: string | null;
    /**
     * @returns {string | null}
     */
    get checksum(): string | null;
    /**
     * @description Gets the actual `num` field of the `ContractId` from the Mirror Node.
     * Should be used after generating `ContractId.fromEvmAddress()` because it sets the `num` field to `0`
     * automatically since there is no connection between the `num` and the `evmAddress`
     * @param {Client} client
     * @returns {Promise<ContractId>}
     */
    populateAccountNum(client: Client): Promise<ContractId>;
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
     * @internal
     * @returns {HieroProto.proto.IContractID}
     */
    _toProtobuf(): HieroProto.proto.IContractID;
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
     * @returns {ContractId}
     */
    clone(): ContractId;
    /**
     * @param {ContractId} other
     * @returns {number}
     */
    compare(other: ContractId): number;
    /**
     * @param {this} other
     * @returns {boolean}
     */
    equals(other: this): boolean;
}
export type Client = import("../client/Client.js").default<any, any>;
import Key from "../Key.js";
import Long from "long";
import * as HieroProto from "@hashgraph/proto";
