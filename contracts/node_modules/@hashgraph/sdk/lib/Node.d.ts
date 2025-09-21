/**
 * @typedef {import("./account/AccountId.js").default} AccountId
 * @typedef {import("./address_book/NodeAddress.js").default} NodeAddress
 * @typedef {import("./channel/Channel.js").default} Channel
 * @typedef {import("./ManagedNodeAddress.js").default} ManagedNodeAddress
 * @typedef {import("./LedgerId.js").default} LedgerId
 */
/**
 * @typedef {object} NewNode
 * @property {AccountId} accountId
 * @property {string} address
 * @property {(address: string) => Channel} channelInitFunction
 */
/**
 * @typedef {object} CloneNode
 * @property {Node} node
 * @property {ManagedNodeAddress} address
 */
/**
 * @augments {ManagedNode<Channel>}
 */
export default class Node extends ManagedNode<import("./channel/Channel.js").default> {
    /**
     * @param {object} props
     * @param {NewNode=} [props.newNode]
     * @param {CloneNode=} [props.cloneNode]
     */
    constructor(props?: {
        newNode?: NewNode | undefined;
        cloneNode?: CloneNode | undefined;
    });
    /** @type {AccountId} */
    _accountId: AccountId;
    /** @type {NodeAddress | null} */
    _nodeAddress: NodeAddress | null;
    /**
     * @returns {ManagedNode<Channel>}
     */
    toInsecure(): ManagedNode<Channel>;
    /**
     * @returns {ManagedNode<Channel>}
     */
    toSecure(): ManagedNode<Channel>;
    /**
     * @returns {AccountId}
     */
    get accountId(): AccountId;
    /**
     * @returns {NodeAddress | null}
     */
    get nodeAddress(): NodeAddress | null;
    /**
     * @param {NodeAddress} nodeAddress
     * @returns {this}
     */
    setNodeAddress(nodeAddress: NodeAddress): this;
}
export type AccountId = import("./account/AccountId.js").default;
export type NodeAddress = import("./address_book/NodeAddress.js").default;
export type Channel = import("./channel/Channel.js").default;
export type ManagedNodeAddress = import("./ManagedNodeAddress.js").default;
export type LedgerId = import("./LedgerId.js").default;
export type NewNode = {
    accountId: AccountId;
    address: string;
    channelInitFunction: (address: string) => Channel;
};
export type CloneNode = {
    node: Node;
    address: ManagedNodeAddress;
};
import ManagedNode from "./ManagedNode.js";
