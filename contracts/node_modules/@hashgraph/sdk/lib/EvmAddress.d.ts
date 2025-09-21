/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IKey} HieroProto.proto.IKey
 */
/**
 * @typedef {import("./client/Client.js").default<*, *>} Client
 */
/**
 *  Represents an Ethereum Virtual Machine (EVM) address.
 * This class extends the Key class and provides functionality for handling EVM addresses.
 */
export default class EvmAddress extends Key {
    /**
     * Creates an EvmAddress from a hex string representation.
     * @param {string} evmAddress - The hex string representing the EVM address
     * @returns {EvmAddress}
     * @throws {Error} If the input string is not the correct size
     */
    static fromString(evmAddress: string): EvmAddress;
    /**
     * @param {Uint8Array} bytes
     * @returns {EvmAddress}
     */
    static fromBytes(bytes: Uint8Array): EvmAddress;
    /**
     * @internal
     * @param {Uint8Array} bytes
     */
    constructor(bytes: Uint8Array);
    _bytes: Uint8Array<ArrayBufferLike>;
    /**
     * @returns {Uint8Array}
     */
    toBytes(): Uint8Array;
    /**
     * @param {EvmAddress} other
     * @returns {boolean}
     */
    equals(other: EvmAddress): boolean;
}
export namespace HieroProto {
    namespace proto {
        type IKey = import("@hashgraph/proto").proto.IKey;
    }
}
export type Client = import("./client/Client.js").default<any, any>;
import Key from "./Key.js";
