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
 * Query to get a list of Hedera network node addresses from a mirror node.
 *
 * This query can be used to retrieve node addresses either from a specific file ID
 * or from the most recent address book if no file ID is specified. The response
 * contains node metadata including IP addresses and ports for both node and mirror
 * node services.
 * @augments {Query<NodeAddressBook>}
 */
export default class AddressBookQuery extends Query<NodeAddressBook> {
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
     * @private
     * @type {number}
     */
    private _attempt;
    /**
     * @returns {?FileId}
     */
    get fileId(): FileId | null;
    /**
     * @param {FileId | string} fileId
     * @returns {AddressBookQuery}
     */
    setFileId(fileId: FileId | string): AddressBookQuery;
    /**
     * @returns {?number}
     */
    get limit(): number | null;
    /**
     * @param {number} limit
     * @returns {AddressBookQuery}
     */
    setLimit(limit: number): AddressBookQuery;
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
    private _makeServerStreamRequest;
}
export type Channel = import("../channel/Channel.js").default;
export type MirrorChannel = import("../channel/MirrorChannel.js").default;
export type MirrorError = import("../channel/MirrorChannel.js").MirrorError;
/**
 * <ChannelT, MirrorChannel>
 */
export type Client<ChannelT extends Channel> = import("../client/Client.js").default<ChannelT, MirrorChannel>;
import NodeAddressBook from "../address_book/NodeAddressBook.js";
import Query from "../query/Query.js";
import NodeAddress from "../address_book/NodeAddress.js";
import FileId from "../file/FileId.js";
