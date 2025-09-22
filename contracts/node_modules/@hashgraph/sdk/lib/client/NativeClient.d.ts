/**
 * @typedef {import("./Client.js").ClientConfiguration} ClientConfiguration
 */
/**
 * @augments {Client<NativeChannel, *>}
 */
export default class NativeClient extends Client<NativeChannel, any> {
    /**
     * @param {string | ClientConfiguration} data
     * @returns {NativeClient}
     */
    static fromConfig(data: string | ClientConfiguration): NativeClient;
    /**
     * Construct a client for a specific network.
     *
     * It is the responsibility of the caller to ensure that all nodes in the map are part of the
     * same Hedera network. Failure to do so will result in undefined behavior.
     *
     * The client will load balance all requests to Hedera using a simple round-robin scheme to
     * chose nodes to send transactions to. For one transaction, at most 1/3 of the nodes will be
     * tried.
     *
     * @param {{[key: string]: (string | AccountId)} | string} network
     * @returns {NativeClient}
     */
    static forNetwork(network: {
        [key: string]: (string | AccountId);
    } | string): NativeClient;
    /**
     * @param {string} network
     * @returns {NativeClient}
     */
    static forName(network: string): NativeClient;
    /**
     * Construct a Hedera client pre-configured for Mainnet access.
     *
     * @returns {NativeClient}
     */
    static forMainnet(): NativeClient;
    /**
     * Construct a Hedera client pre-configured for Testnet access.
     *
     * @returns {NativeClient}
     */
    static forTestnet(): NativeClient;
    /**
     * Construct a Hedera client pre-configured for Previewnet access.
     *
     * @returns {NativeClient}
     */
    static forPreviewnet(): NativeClient;
    /**
     * Construct a Hedera client pre-configured for Mainnet access with network update.
     *
     * @returns {Promise<NativeClient>}
     */
    static forMainnetAsync(): Promise<NativeClient>;
    /**
     * Construct a Hedera client pre-configured for Testnet access with network update.
     *
     * @returns {Promise<NativeClient>}
     */
    static forTestnetAsync(): Promise<NativeClient>;
    /**
     * Construct a Hedera client pre-configured for Previewnet access with network update.
     *
     * @returns {Promise<NativeClient>}
     */
    static forPreviewnetAsync(): Promise<NativeClient>;
    /**
     * Construct a client for a specific network with optional network update.
     * Updates network only if the network is not "local-node".
     *
     * @param {string} network
     * @returns {Promise<NativeClient>}
     */
    static forNameAsync(network: string): Promise<NativeClient>;
    /**
     * Construct a client configured to use mirror nodes.
     * This will query the address book to get the network nodes.
     *
     * @param {string[] | string} mirrorNetwork
     * @returns {Promise<NativeClient>}
     */
    static forMirrorNetwork(mirrorNetwork: string[] | string): Promise<NativeClient>;
    /**
     * @param {ClientConfiguration} [props]
     */
    constructor(props?: ClientConfiguration);
    /**
     * @param {string[] | string} mirrorNetwork
     * @returns {this}
     */
    setMirrorNetwork(mirrorNetwork: string[] | string): this;
    /**
     * @override
     * @returns {Promise<this>}
     */
    override updateNetwork(): Promise<this>;
}
export type ClientConfiguration = import("./Client.js").ClientConfiguration;
import NativeChannel from "../channel/NativeChannel.js";
import Client from "./Client.js";
import AccountId from "../account/AccountId.js";
