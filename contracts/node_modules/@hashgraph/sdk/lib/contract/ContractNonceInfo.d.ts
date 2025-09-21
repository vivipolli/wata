/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IContractNonceInfo} HieroProto.proto.IContractNonceInfo
 * @typedef {import("@hashgraph/proto").proto.IContractID} HieroProto.proto.IContractID
 * @typedef {object} ContractNonceInfoJSON
 * @property {string} contractId
 * @property {number} nonce
 */
/**
 * Info about a contract account's nonce value.
 * A nonce of a contract is only incremented when that contract creates another contract.
 */
export default class ContractNonceInfo {
    /**
     *  Extract the contractNonce from the protobuf.
     *
     * @internal
     * @param {HieroProto.proto.IContractNonceInfo} contractNonceInfo the protobuf
     * @returns {ContractNonceInfo} the contract object
     */
    static _fromProtobuf(contractNonceInfo: HieroProto.proto.IContractNonceInfo): ContractNonceInfo;
    /**
     * Extract the contractNonce from a byte array.
     *
     * @param {Uint8Array} bytes the byte array
     * @returns {ContractNonceInfo} the extracted contract nonce info
     */
    static fromBytes(bytes: Uint8Array): ContractNonceInfo;
    /**
     * @param {object} props
     * @param {ContractId} props.contractId
     * @param {Long} props.nonce
     */
    constructor(props: {
        contractId: ContractId;
        nonce: Long;
    });
    /**
     * Id of the contract
     *
     * @readonly
     */
    readonly contractId: ContractId;
    /**
     * The current value of the contract account's nonce property
     *
     * @readonly
     */
    readonly nonce: Long;
    /**
     * Build the protobuf
     *
     * @internal
     * @returns {HieroProto.proto.IContractNonceInfo} the protobuf representation
     */
    _toProtobuf(): HieroProto.proto.IContractNonceInfo;
    /**
     * Create a byte array representation.
     *
     * @returns {Uint8Array} the byte array representation
     */
    toBytes(): Uint8Array;
    /**
     * Create a JSON representation.
     *
     * @returns {ContractNonceInfoJSON} the JSON representation
     */
    toJSON(): ContractNonceInfoJSON;
    /**
     * @returns {string}
     */
    toString(): string;
    /**
     * @param {this} other
     * @returns {boolean}
     */
    equals(other: this): boolean;
}
export namespace HieroProto {
    namespace proto {
        type IContractNonceInfo = import("@hashgraph/proto").proto.IContractNonceInfo;
        type IContractID = import("@hashgraph/proto").proto.IContractID;
    }
}
export type ContractNonceInfoJSON = {
    contractId: string;
    nonce: number;
};
import ContractId from "./ContractId.js";
import Long from "long";
