/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.INodeAddress} HieroProto.proto.INodeAddress
 */
/**
 * @typedef {import("./Endpoint.js").EndPointJson} EndpointJson
 */
/**
 * @typedef {object} NodeAddressJson
 * @property {string | null} publicKey
 * @property {string | null} nodeId
 * @property {string | null} accountId
 * @property {string | null} certHash
 * @property {EndpointJson[] | null} addresses
 * @property {string | null} description
 * @property {string | null} stake
 */
export default class NodeAddress {
    /**
     * @internal
     * @param {HieroProto.proto.INodeAddress} nodeAddress
     * @returns {NodeAddress}
     */
    static _fromProtobuf(nodeAddress: HieroProto.proto.INodeAddress): NodeAddress;
    /**
     * @param {NodeAddressJson} json
     * @returns {NodeAddress}
     */
    static fromJSON(json: NodeAddressJson): NodeAddress;
    /**
     * @param {object} props
     * @param {string} [props.publicKey]
     * @param {Long} [props.nodeId]
     * @param {AccountId | string} [props.accountId]
     * @param {Uint8Array} [props.certHash]
     * @param {Endpoint[]} [props.addresses]
     * @param {string} [props.description]
     * @param {Long} [props.stake]
     */
    constructor(props?: {
        publicKey?: string | undefined;
        nodeId?: Long | undefined;
        accountId?: string | AccountId | undefined;
        certHash?: Uint8Array<ArrayBufferLike> | undefined;
        addresses?: Endpoint[] | undefined;
        description?: string | undefined;
        stake?: Long | undefined;
    });
    /**
     * @type {string | null}
     */
    _publicKey: string | null;
    /**
     * @type {Long |null}
     */
    _nodeId: Long | null;
    /**
     * @type {AccountId | null}
     */
    _accountId: AccountId | null;
    /**
     * @type {Uint8Array | null}
     */
    _certHash: Uint8Array | null;
    /**
     * @type {Endpoint[]}
     */
    _addresses: Endpoint[];
    /**
     * @type {string | null}
     */
    _description: string | null;
    /**
     * @type {Long | null}
     */
    _stake: Long | null;
    /**
     * @returns {?string}
     */
    get publicKey(): string | null;
    /**
     * @param {string} publicKey
     * @returns {this}
     */
    setPublicKey(publicKey: string): this;
    /**
     * @returns {?Long}
     */
    get nodeId(): Long | null;
    /**
     * @param {Long} nodeId
     * @returns {this}
     */
    setNodeId(nodeId: Long): this;
    /**
     * @returns {?AccountId}
     */
    get accountId(): AccountId | null;
    /**
     * @param {AccountId | string} accountId
     * @returns {this}
     */
    setAccountId(accountId: AccountId | string): this;
    /**
     * @returns {?Uint8Array}
     */
    get certHash(): Uint8Array | null;
    /**
     * @param {Uint8Array} certHash
     * @returns {this}
     */
    setCertHash(certHash: Uint8Array): this;
    /**
     * @returns {Endpoint[]}
     */
    get addresses(): Endpoint[];
    /**
     * @param {Endpoint[]} addresses
     * @returns {this}
     */
    setAddresses(addresses: Endpoint[]): this;
    /**
     * @returns {?string}
     */
    get description(): string | null;
    /**
     * @param {string} description
     * @returns {this}
     */
    setDescription(description: string): this;
    /**
     * @returns {?Long}
     */
    get stake(): Long | null;
    /**
     * @param {Long} stake
     * @returns {this}
     */
    setStake(stake: Long): this;
    /**
     * @returns {HieroProto.proto.INodeAddress}
     */
    _toProtobuf(): HieroProto.proto.INodeAddress;
    /**
     * @returns {string}
     */
    toString(): string;
    /**
     * @returns {NodeAddressJson}
     */
    toJSON(): NodeAddressJson;
}
export namespace HieroProto {
    namespace proto {
        type INodeAddress = import("@hashgraph/proto").proto.INodeAddress;
    }
}
export type EndpointJson = import("./Endpoint.js").EndPointJson;
export type NodeAddressJson = {
    publicKey: string | null;
    nodeId: string | null;
    accountId: string | null;
    certHash: string | null;
    addresses: EndpointJson[] | null;
    description: string | null;
    stake: string | null;
};
import Long from "long";
import AccountId from "../account/AccountId.js";
import Endpoint from "./Endpoint.js";
