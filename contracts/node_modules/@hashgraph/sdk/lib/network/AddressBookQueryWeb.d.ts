/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../channel/MirrorChannel.js").default} MirrorChannel
 * @typedef {import("../channel/MirrorChannel.js").MirrorError} MirrorError
 */
/**
 * @template {Channel} ChannelT
 * @typedef {import("../client/Client.js").default<ChannelT, MirrorChannel>} Client<ChannelT, MirrorChannel>
 */
/**
 * @typedef {object} EndpointWebResponse
 * @property {string} domain_name
 * @property {string} ip_address_v4
 * @property {number} port
 */
/**
 * @typedef {object} AddressBookQueryWebResponse
 * @property {Array<{
 *   admin_key: {
 *     key: string,
 *     _type: string,
 *   },
 *   decline_reward: boolean,
 *   grpc_proxy_endpoint: EndpointWebResponse,
 *   file_id: string,
 *   memo: string,
 *   public_key: string,
 *   node_id: number,
 *   node_account_id: string,
 *   node_cert_hash: string,
 *   address: string,
 *   service_endpoints: EndpointWebResponse[],
 *   description: string,
 *   stake: number
 * }>} nodes
 */
/**
 * Web-compatible query to get a list of Hedera network node addresses from a mirror node.
 * Uses fetch API instead of gRPC for web environments.
 *
 * This query can be used to retrieve node addresses either from a specific file ID
 * or from the most recent address book if no file ID is specified. The response
 * contains node metadata including IP addresses and ports for both node and mirror
 * node services.
 * @augments {Query<NodeAddressBook>}
 */
export default class AddressBookQueryWeb extends Query<NodeAddressBook> {
    /**
     * @param {object} props
     * @param {FileId | string} [props.fileId]
     * @param {number} [props.limit]
     */
    constructor(props?: {
        fileId?: string | FileId | undefined;
        limit?: number | undefined;
    });
    /**
     * @private
     * @type {?FileId}
     */
    private _fileId;
    /**
     * Page limit for the query
     * @private
     * @type {?number}
     */
    private _limit;
    /**
     * @private
     * @type {(error: MirrorError | Error | null) => boolean}
     */
    private _retryHandler;
    /** @type {NodeAddress[]} */
    _addresses: NodeAddress[];
    /**
     * @returns {?FileId}
     */
    get fileId(): FileId | null;
    /**
     * @param {FileId | string} fileId
     * @returns {AddressBookQueryWeb}
     */
    setFileId(fileId: FileId | string): AddressBookQueryWeb;
    /**
     * Page limit for the query
     * @returns {?number}
     */
    get limit(): number | null;
    /**
     * Set the page limit for the query
     * @param {number} limit
     * @returns {AddressBookQueryWeb}
     */
    setLimit(limit: number): AddressBookQueryWeb;
    /**
     * @param {number} attempts
     * @returns {this}
     */
    setMaxAttempts(attempts: number): this;
    /**
     * @param {number} backoff
     * @returns {this}
     */
    setMaxBackoff(backoff: number): this;
    /**
     * @param {Client<Channel>} client
     * @param {number=} requestTimeout
     * @returns {Promise<NodeAddressBook>}
     */
    execute(client: Client<Channel>, requestTimeout?: number | undefined): Promise<NodeAddressBook>;
    /**
     * @private
     * @param {Client<Channel>} client
     * @param {(value: NodeAddressBook) => void} resolve
     * @param {(error: Error) => void} reject
     * @param {number=} requestTimeout
     */
    private _makeFetchRequest;
    /**
     * Handles the grpc_proxy_endpoint fallback logic for a node.
     * @param {AddressBookQueryWebResponse['nodes'][number]} node - The node object from the mirror node response.
     * @param {Client<Channel>} client - The client instance.
     * @returns {Array<{address: string, port: string}>}
     */
    _handleAddressesFromGrpcProxyEndpoint(node: AddressBookQueryWebResponse["nodes"][number], client: Client<Channel>): Array<{
        address: string;
        port: string;
    }>;
}
export type Channel = import("../channel/Channel.js").default;
export type MirrorChannel = import("../channel/MirrorChannel.js").default;
export type MirrorError = import("../channel/MirrorChannel.js").MirrorError;
/**
 * <ChannelT, MirrorChannel>
 */
export type Client<ChannelT extends Channel> = import("../client/Client.js").default<ChannelT, MirrorChannel>;
export type EndpointWebResponse = {
    domain_name: string;
    ip_address_v4: string;
    port: number;
};
export type AddressBookQueryWebResponse = {
    nodes: Array<{
        admin_key: {
            key: string;
            _type: string;
        };
        decline_reward: boolean;
        grpc_proxy_endpoint: EndpointWebResponse;
        file_id: string;
        memo: string;
        public_key: string;
        node_id: number;
        node_account_id: string;
        node_cert_hash: string;
        address: string;
        service_endpoints: EndpointWebResponse[];
        description: string;
        stake: number;
    }>;
};
import NodeAddressBook from "../address_book/NodeAddressBook.js";
import Query from "../query/Query.js";
import NodeAddress from "../address_book/NodeAddress.js";
import FileId from "../file/FileId.js";
