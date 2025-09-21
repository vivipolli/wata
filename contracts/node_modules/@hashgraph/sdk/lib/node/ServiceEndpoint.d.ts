/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IServiceEndpoint} IServiceEndpoint
 */
export default class ServiceEndpoint {
    /**
     * @internal
     * @param {IServiceEndpoint} serviceEndpoint
     * @returns {ServiceEndpoint}
     */
    static _fromProtobuf(serviceEndpoint: IServiceEndpoint): ServiceEndpoint;
    /**
     * @param {object} [props]
     * @param {?Uint8Array} [props.ipAddressV4]
     * @param {?number} [props.port]
     * @param {?string} [props.domainName]
     */
    constructor(props?: {
        ipAddressV4?: Uint8Array<ArrayBufferLike> | null | undefined;
        port?: number | null | undefined;
        domainName?: string | null | undefined;
    });
    /**
     * @type {?Uint8Array}
     * @description The 4-byte IPv4 address of the endpoint
     * encoded in left to right order
     * (e.g. 127.0.0.1 has bytes [127, 0, 0, 1]).
     */
    _ipAddressV4: Uint8Array | null;
    /**
     * @type {?number}
     * @description The port of the service endpoint. It's required.
     */
    _port: number | null;
    /**
     * @type {?string}
     * @description A node domain name. This MUST be the
     * fully qualified domain(DNS) name of the node. This
     * value MUST NOT be more than 253 characters.
     * domain_name and ipAddressV4 are mutually exclusive.
     * When the `domain_name` field is set, the `ipAddressV4`
     * field MUST NOT be set. When the `ipAddressV4` field
     * is set, the `domain_name` field MUST NOT be set.
     */
    _domainName: string | null;
    /**
     * @param {Uint8Array} ipAddressV4
     * @description Set 4-byte IPv4 address of the endpoint.
     * @returns {ServiceEndpoint}
     *
     */
    setIpAddressV4(ipAddressV4: Uint8Array): ServiceEndpoint;
    /**
     * @description Get 4-byte IPv4 address of the endpoint.
     * @returns {?Uint8Array}
     *
     */
    get getIpAddressV4(): Uint8Array | null;
    /**
     * @param {number} port
     * @description Set port of the endpoint.
     * @returns {ServiceEndpoint}
     *
     */
    setPort(port: number): ServiceEndpoint;
    /**
     * @description Get port of the endpoint.
     * @returns {?number}
     *
     */
    get getPort(): number | null;
    /**
     * @param {string} domainName
     * @description Set domain name of the endpoint.
     * @returns {ServiceEndpoint}
     *
     */
    setDomainName(domainName: string): ServiceEndpoint;
    /**
     * @description Get domain name of the endpoint.
     * @returns {?string}
     *
     */
    get getDomainName(): string | null;
    /**
     * @internal
     * @returns {IServiceEndpoint}
     */
    _toProtobuf(): IServiceEndpoint;
}
export type IServiceEndpoint = import("@hashgraph/proto").proto.IServiceEndpoint;
