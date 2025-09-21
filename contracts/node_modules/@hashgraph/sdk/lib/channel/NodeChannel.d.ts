export default class NodeChannel extends Channel {
    /**
     * @internal
     * @param {string} address
     * @param {number=} maxExecutionTime
     */
    constructor(address: string, maxExecutionTime?: number | undefined);
    /** @type {Client | null} */
    _client: Client | null;
    address: string;
    maxExecutionTime: number | undefined;
    nodeIp: string;
    nodePort: string;
    /**
     * Convert certificate bytes to PEM format
     * @param {Buffer} certBytes
     * @returns {string}
     */
    bytesToPem(certBytes: Buffer): string;
    /**
     * Validates and parses an address in the "IP:Port" format.
     * @param {string} address
     * @returns {{ ip: string, port: string }}
     */
    parseAddress(address: string): {
        ip: string;
        port: string;
    };
    /**
     * Retrieve the server's certificate dynamically.
     * @returns {Promise<string>}
     */
    _retrieveCertificate(): Promise<string>;
    /**
     * Initialize the gRPC client
     * @returns {Promise<void>}
     */
    _initializeClient(): Promise<void>;
}
import Channel from "./Channel.js";
import { Client } from "@grpc/grpc-js";
