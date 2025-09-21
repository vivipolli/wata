/**
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */
/**
 * The ID for a crypto-currency account on Hedera.
 */
export default class AccountId {
    /**
     * @description Accepts the following formats as string:
     *      - as stand alone nubmers
     *      - as shard.realm.num
     *      - as shard.realm.hex (wo 0x prefix)
     *      - hex (w/wo 0x prefix)
     * @param {string} text
     * @returns {AccountId}
     */
    static fromString(text: string): AccountId;
    /**
     * @description This handles both long-zero format and evm address format addresses.
     * If an actual evm address is passed, please use `AccountId.populateAccountNum(client)` method
     * to get the actual `num` value, since there is no cryptographic relation to the evm address
     * and cannot be populated directly
     * @param {Long | number} shard
     * @param {Long | number} realm
     * @param {EvmAddress | string} evmAddress
     * @returns {AccountId}
     */
    static fromEvmAddress(shard: Long | number, realm: Long | number, evmAddress: EvmAddress | string): AccountId;
    /**
     * @deprecated - Use `fromEvmAddress` instead
     * @summary Accepts an evm address only as `EvmAddress` type
     * @param {EvmAddress} evmAddress
     * @returns {AccountId}
     */
    static fromEvmPublicAddress(evmAddress: EvmAddress): AccountId;
    /**
     * @internal
     * @param {HieroProto.proto.IAccountID} id
     * @returns {AccountId}
     */
    static _fromProtobuf(id: HieroProto.proto.IAccountID): AccountId;
    /**
     * @param {Uint8Array} bytes
     * @returns {AccountId}
     */
    static fromBytes(bytes: Uint8Array): AccountId;
    /**
     * @deprecated - Use `fromEvmAddress` instead
     * @param {string} address
     * @returns {AccountId}
     */
    static fromSolidityAddress(address: string): AccountId;
    /**
     * @param {number | Long | import("../EntityIdHelper").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     * @param {(PublicKey)=} aliasKey
     * @param {(EvmAddress)=} evmAddress
     */
    constructor(props: number | Long | import("../EntityIdHelper").IEntityId, realm?: (number | Long) | undefined, num?: (number | Long) | undefined, aliasKey?: (PublicKey) | undefined, evmAddress?: (EvmAddress) | undefined);
    shard: Long;
    realm: Long;
    num: Long;
    aliasKey: PublicKey | null;
    evmAddress: EvmAddress | null;
    /**
     * @type {string | null}
     */
    _checksum: string | null;
    /**
     * @returns {string | null}
     */
    get checksum(): string | null;
    /**
     * @returns {?EvmAddress}
     */
    getEvmAddress(): EvmAddress | null;
    /**
     * @description Gets the actual `num` field of the `AccountId` from the Mirror Node.
     * Should be used after generating `AccountId.fromEvmAddress()` because it sets the `num` field to `0`
     * automatically since there is no connection between the `num` and the `evmAddress`
     * @param {Client} client
     * @returns {Promise<AccountId>}
     */
    populateAccountNum(client: Client): Promise<AccountId>;
    /**
     * @description Populates `evmAddress` field of the `AccountId` extracted from the Mirror Node.
     * @param {Client} client
     * @returns {Promise<AccountId>}
     */
    populateAccountEvmAddress(client: Client): Promise<AccountId>;
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
     * @description Statically compute the EVM address. Use only with non-native EVM accounts.
     * @deprecated - Use `toEvmAddress` instead
     * If the account is EVM-native, the EVM address depends on the public key and is not directly related to the account ID.
     * @returns {string}
     */
    toSolidityAddress(): string;
    /**
     * @returns {string} EVM-compatible address representation of the entity
     */
    toEvmAddress(): string;
    /**
     * @internal
     * @returns {HieroProto.proto.IAccountID}
     */
    _toProtobuf(): HieroProto.proto.IAccountID;
    /**
     * @returns {Uint8Array}
     */
    toBytes(): Uint8Array;
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
     * @param {this} other
     * @returns {boolean}
     */
    equals(other: this): boolean;
    /**
     * @returns {AccountId}
     */
    clone(): AccountId;
    /**
     * @param {AccountId} other
     * @returns {number}
     */
    compare(other: AccountId): number;
}
export type Client = import("../client/Client.js").default<any, any>;
import Long from "long";
import PublicKey from "../PublicKey.js";
import EvmAddress from "../EvmAddress.js";
import * as HieroProto from "@hashgraph/proto";
