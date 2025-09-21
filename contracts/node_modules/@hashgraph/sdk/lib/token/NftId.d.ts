/**
 * The ID for a crypto-currency token on Hedera.
 *
 * @augments {EntityId<HieroProto.proto.INftID>}
 */
export default class NftId {
    /**
     * @param {string} text
     * @returns {NftId}
     */
    static fromString(text: string): NftId;
    /**
     * @internal
     * @param {HieroProto.proto.INftID} id
     * @returns {NftId}
     */
    static _fromProtobuf(id: HieroProto.proto.INftID): NftId;
    /**
     * @param {Uint8Array} bytes
     * @returns {NftId}
     */
    static fromBytes(bytes: Uint8Array): NftId;
    /**
     * @param {TokenId} token
     * @param {number | Long} serial
     */
    constructor(token: TokenId, serial: number | Long);
    tokenId: TokenId;
    serial: Long;
    /**
     * @internal
     * @returns {HieroProto.proto.INftID}
     */
    _toProtobuf(): HieroProto.proto.INftID;
    /**
     * @returns {string}
     */
    toString(): string;
    /**
     * @returns {Uint8Array}
     */
    toBytes(): Uint8Array;
}
import TokenId from "../token/TokenId.js";
import Long from "long";
import * as HieroProto from "@hashgraph/proto";
