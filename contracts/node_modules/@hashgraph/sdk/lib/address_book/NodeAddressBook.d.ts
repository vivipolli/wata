/**
 * @typedef {import("./NodeAddress.js").NodeAddressJson} NodeAddressJson
 */
/**
 * @typedef {object} NodeAddressBookJson
 * @property {NodeAddressJson[]} nodeAddresses
 */
/**
 * Represents a collection of node addresses in the Hedera network.
 *
 * The NodeAddressBook contains information about the nodes in the Hedera network,
 * including their network addresses, account IDs, and node IDs. This class is used
 * to manage and access the network's node information.
 */
export default class NodeAddressBook {
    /**
     * @param {Uint8Array} bytes
     * @returns {NodeAddressBook}
     */
    static fromBytes(bytes: Uint8Array): NodeAddressBook;
    /**
     * @internal
     * @param {HieroProto.proto.INodeAddressBook} nodeAddressBook
     * @returns {NodeAddressBook}
     */
    static _fromProtobuf(nodeAddressBook: HieroProto.proto.INodeAddressBook): NodeAddressBook;
    /**
     * @param {object} props
     * @param {NodeAddress[]} [props.nodeAddresses]
     */
    constructor(props?: {
        nodeAddresses?: NodeAddress[] | undefined;
    });
    /**
     * @type {NodeAddress[]}
     */
    _nodeAddresses: NodeAddress[];
    /**
     * @returns {NodeAddress[]}
     */
    get nodeAddresses(): NodeAddress[];
    /**
     * @param {NodeAddress[]} nodeAddresses
     * @returns {this}
     */
    setNodeAddresses(nodeAddresses: NodeAddress[]): this;
    /**
     * @returns {HieroProto.proto.INodeAddressBook}
     */
    _toProtobuf(): HieroProto.proto.INodeAddressBook;
    /**
     * @returns {string}
     */
    toString(): string;
    /**
     * @returns {NodeAddressBookJson}
     */
    toJSON(): NodeAddressBookJson;
    toBytes(): Uint8Array<ArrayBufferLike>;
}
export type NodeAddressJson = import("./NodeAddress.js").NodeAddressJson;
export type NodeAddressBookJson = {
    nodeAddresses: NodeAddressJson[];
};
import NodeAddress from "./NodeAddress.js";
import * as HieroProto from "@hashgraph/proto";
