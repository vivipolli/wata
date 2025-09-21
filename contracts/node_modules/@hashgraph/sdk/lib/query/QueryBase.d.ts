/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../Status.js").default} Status
 * @typedef {import("../Executable.js").ExecutionState} ExecutionState
 * @typedef {import("../client/Client.js").ClientOperator} ClientOperator
 * @typedef {import("../PublicKey.js").default} PublicKey
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../logger/Logger.js").default} Logger
 */
/**
 * Base class for all query-related functionality that can be shared between Query and CostQuery.
 *
 * @abstract
 * @template RequestT
 * @template ResponseT
 * @template OutputT
 * @augments {Executable<RequestT, ResponseT, OutputT>}
 */
export default class QueryBase<RequestT, ResponseT, OutputT> extends Executable<RequestT, ResponseT, OutputT> {
    /**
     * Create a payment transaction for a query
     *
     * @param {TransactionId} paymentTransactionId
     * @param {AccountId} nodeId
     * @param {?ClientOperator} operator
     * @param {Hbar} paymentAmount
     * @returns {Promise<HieroProto.proto.ITransaction>}
     */
    _makePaymentTransaction(paymentTransactionId: TransactionId, nodeId: AccountId, operator: ClientOperator | null, paymentAmount: Hbar): Promise<HieroProto.proto.ITransaction>;
}
export type Channel = import("../channel/Channel.js").default;
export type TransactionId = import("../transaction/TransactionId.js").default;
export type Status = import("../Status.js").default;
export type ExecutionState = import("../Executable.js").ExecutionState;
export type ClientOperator = import("../client/Client.js").ClientOperator;
export type PublicKey = import("../PublicKey.js").default;
export type Client = import("../client/Client.js").default<any, any>;
export type Logger = import("../logger/Logger.js").default;
import Executable from "../Executable.js";
import AccountId from "../account/AccountId.js";
import Hbar from "../Hbar.js";
import * as HieroProto from "@hashgraph/proto";
