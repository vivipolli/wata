/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} ITransaction
 * @typedef {import("@hashgraph/proto").proto.ITransaction} ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} ITransactionResponse
 */
/**
 * @namespace com.hedera.hapi.node.addressbook
 * @typedef {import("@hashgraph/proto").com.hedera.hapi.node.addressbook.INodeCreateTransactionBody} INodeCreateTransactionBody
 */
/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */
/**
 * A transaction to create a new consensus node in the network.
 */
export default class NodeCreateTransaction extends Transaction {
    /**
     * @internal
     * @param {ITransaction[]} transactions
     * @param {ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {ITransactionBody[]} bodies
     * @returns {NodeCreateTransaction}
     */
    static _fromProtobuf(transactions: ITransaction[], signedTransactions: ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: ITransactionBody[]): NodeCreateTransaction;
    /**
     * @param {object} [props]
     * @param {AccountId} [props.accountId]
     * @param {?string} [props.description]
     * @param {Array<ServiceEndpoint>} [props.gossipEndpoints]
     * @param {?Array<ServiceEndpoint>} [props.serviceEndpoints]
     * @param {Uint8Array} [props.gossipCaCertificate]
     * @param {Uint8Array} [props.grpcCertificateHash]
     * @param {ServiceEndpoint} [props.grpcWebProxyEndpoint]
     * @param {Key} [props.adminKey]
     * @param {boolean} [props.declineReward]
     */
    constructor(props?: {
        accountId?: AccountId | undefined;
        description?: string | null | undefined;
        gossipEndpoints?: ServiceEndpoint[] | undefined;
        serviceEndpoints?: ServiceEndpoint[] | null | undefined;
        gossipCaCertificate?: Uint8Array<ArrayBufferLike> | undefined;
        grpcCertificateHash?: Uint8Array<ArrayBufferLike> | undefined;
        grpcWebProxyEndpoint?: ServiceEndpoint | undefined;
        adminKey?: Key | undefined;
        declineReward?: boolean | undefined;
    });
    /**
     * @private
     * @type {?AccountId}
     * @description Node account identifier. It's required.
     */
    private _accountId;
    /**
     * @private
     * @type {?string}
     * @description Short description of the node.
     */
    private _description;
    /**
     * @private
     * @type {?Array<ServiceEndpoint>}
     * @description List of service endpoints for gossip. It's required.
     */
    private _gossipEndpoints;
    /**
     * @private
     * @type {?Array<ServiceEndpoint>}
     * @description List of service endpoints for gRPC calls.
     */
    private _serviceEndpoints;
    /**
     * @private
     * @type {?Uint8Array}
     * @description Certificate used to sign gossip events. It's required.
     */
    private _gossipCaCertificate;
    /**
     * @private
     * @type {?Uint8Array}
     * @description Hash of the node gRPC TLS certificate.
     */
    private _grpcCertificateHash;
    /**
     * @private
     * @type {?ServiceEndpoint}
     * @description Proxy endpoint for gRPC web calls.
     */
    private _grpcWebProxyEndpoint;
    /**
     * @private
     * @type {?Key}
     * @description Administrative key controlled by the node operator. It's required.
     */
    private _adminKey;
    /**
     * @private
     * @type {?boolean}
     * @description Whether the node declines rewards.
     */
    private _declineReward;
    /**
     * @param {AccountId | string} accountId
     * @description Set node account identifier.
     * @returns {NodeCreateTransaction}
     */
    setAccountId(accountId: AccountId | string): NodeCreateTransaction;
    /**
     * @description Get node account identifier.
     * @returns {?AccountId}
     */
    get accountId(): AccountId | null;
    /**
     * @param {string} description
     * @description Set description of the node.
     * @returns {NodeCreateTransaction}
     */
    setDescription(description: string): NodeCreateTransaction;
    /**
     * @description Get description of the node.
     * @returns {?string}
     */
    get description(): string | null;
    /**
     * @param {ServiceEndpoint[]} gossipEndpoints
     * @description Set list of service endpoints for gossip.
     * @returns {NodeCreateTransaction}
     */
    setGossipEndpoints(gossipEndpoints: ServiceEndpoint[]): NodeCreateTransaction;
    /**
     * @description Get list of service endpoints for gossip.
     * @returns {?Array<ServiceEndpoint>}
     */
    get gossipEndpoints(): Array<ServiceEndpoint> | null;
    /**
     * @param {ServiceEndpoint} endpoint
     * @description Add an endpoint to the list of service endpoints for gossip.
     * @returns {NodeCreateTransaction}
     */
    addGossipEndpoint(endpoint: ServiceEndpoint): NodeCreateTransaction;
    /**
     * @param {ServiceEndpoint[]} serviceEndpoints
     * @description Set list of service endpoints for gRPC calls.
     * @returns {NodeCreateTransaction}
     */
    setServiceEndpoints(serviceEndpoints: ServiceEndpoint[]): NodeCreateTransaction;
    /**
     * @description Get list of service endpoints for gRPC calls.
     * @returns {?Array<ServiceEndpoint>}
     */
    get serviceEndpoints(): Array<ServiceEndpoint> | null;
    /**
     * @param {ServiceEndpoint} endpoint
     * @description Add an endpoint to the list of service endpoints for gRPC calls.
     * @returns {NodeCreateTransaction}
     */
    addServiceEndpoint(endpoint: ServiceEndpoint): NodeCreateTransaction;
    /**
     * @param {Uint8Array} bytes
     * @description Set certificate used to sign gossip events.
     * @returns {NodeCreateTransaction}
     */
    setGossipCaCertificate(bytes: Uint8Array): NodeCreateTransaction;
    /**
     * @description Get certificate used to sign gossip events.
     * @returns {?Uint8Array}
     */
    get gossipCaCertificate(): Uint8Array | null;
    /**
     * @param {Uint8Array} bytes
     * @description Set hash of the node gRPC TLS certificate.
     * @returns {NodeCreateTransaction}
     */
    setCertificateHash(bytes: Uint8Array): NodeCreateTransaction;
    /**
     * @description Get hash of the node gRPC TLS certificate.
     * @returns {?Uint8Array}
     */
    get certificateHash(): Uint8Array | null;
    /**
     * @param {ServiceEndpoint} endpoint
     * @description Set proxy endpoint for gRPC web calls.
     * @returns {NodeCreateTransaction}
     */
    setGrpcWebProxyEndpoint(endpoint: ServiceEndpoint): NodeCreateTransaction;
    /**
     * @description Get proxy endpoint for gRPC web calls.
     * @returns {?ServiceEndpoint}
     */
    get grpcWebProxyEndpoint(): ServiceEndpoint | null;
    /**
     * @param {Key} adminKey
     * @description Set administrative key controlled by the node operator.
     * @returns {NodeCreateTransaction}
     */
    setAdminKey(adminKey: Key): NodeCreateTransaction;
    /**
     * @description Get administrative key controlled by the node operator.
     * @returns {?Key}
     */
    get adminKey(): Key | null;
    /**
     * @param {boolean} declineReward
     * @description Set whether the node declines rewards.
     * @returns {NodeCreateTransaction}
     */
    setDeclineReward(declineReward: boolean): NodeCreateTransaction;
    /**
     * @description Get whether the node declines rewards.
     * @returns {?boolean}
     */
    get declineReward(): boolean | null;
    /**
     * @override
     * @protected
     * @returns {INodeCreateTransactionBody}
     */
    protected override _makeTransactionData(): INodeCreateTransactionBody;
}
export type ITransaction = import("@hashgraph/proto").proto.ITransaction;
export type ISignedTransaction = import("@hashgraph/proto").proto.ITransaction;
export type TransactionBody = import("@hashgraph/proto").proto.TransactionBody;
export type ITransactionBody = import("@hashgraph/proto").proto.ITransactionBody;
export type ITransactionResponse = import("@hashgraph/proto").proto.ITransactionResponse;
export type INodeCreateTransactionBody = import("@hashgraph/proto").com.hedera.hapi.node.addressbook.INodeCreateTransactionBody;
export type Channel = import("../channel/Channel.js").default;
export type TransactionId = import("../transaction/TransactionId.js").default;
export type Client = import("../client/Client.js").default<any, any>;
import Transaction from "../transaction/Transaction.js";
import AccountId from "../account/AccountId.js";
import ServiceEndpoint from "./ServiceEndpoint.js";
import Key from "../Key.js";
