/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IQuery} HieroProto.proto.IQuery
 * @typedef {import("@hashgraph/proto").proto.IQueryHeader} HieroProto.proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").proto.IResponse} HieroProto.proto.IResponse
 * @typedef {import("@hashgraph/proto").proto.IResponseHeader} HieroProto.proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").proto.ICryptoGetAccountBalanceQuery} HieroProto.proto.ICryptoGetAccountBalanceQuery
 * @typedef {import("@hashgraph/proto").proto.ICryptoGetAccountBalanceResponse} HieroProto.proto.ICryptoGetAccountBalanceResponse
 */
/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */
/**
 * Get the balance of a Hedera™ crypto-currency account.
 *
 * This returns only the balance, so its a smaller and faster reply
 * than AccountInfoQuery.
 *
 * This query is free.
 *
 * @augments {Query<AccountBalance>}
 */
export default class AccountBalanceQuery extends Query<AccountBalance> {
    /**
     * @internal
     * @param {HieroProto.proto.IQuery} query
     * @returns {AccountBalanceQuery}
     */
    static _fromProtobuf(query: HieroProto.proto.IQuery): AccountBalanceQuery;
    /**
     * @param {object} [props]
     * @param {AccountId | string} [props.accountId]
     * @param {ContractId | string} [props.contractId]
     */
    constructor(props?: {
        accountId?: string | AccountId | undefined;
        contractId?: string | ContractId | undefined;
    });
    /**
     * @type {?AccountId}
     * @private
     */
    private _accountId;
    /**
     * @type {?ContractId}
     * @private
     */
    private _contractId;
    /**
     * @returns {?AccountId}
     */
    get accountId(): AccountId | null;
    /**
     * Set the account ID for which the balance is being requested.
     *
     * This is mutually exclusive with `setContractId`.
     *
     * @param {AccountId | string} accountId
     * @returns {this}
     */
    setAccountId(accountId: AccountId | string): this;
    /**
     * @returns {?ContractId}
     */
    get contractId(): ContractId | null;
    /**
     * Set the contract ID for which the balance is being requested.
     *
     * This is mutually exclusive with `setAccountId`.
     *
     * @param {ContractId | string} contractId
     * @returns {this}
     */
    setContractId(contractId: ContractId | string): this;
}
export namespace HieroProto {
    namespace proto {
        type IQuery = import("@hashgraph/proto").proto.IQuery;
        type IQueryHeader = import("@hashgraph/proto").proto.IQueryHeader;
        type IResponse = import("@hashgraph/proto").proto.IResponse;
        type IResponseHeader = import("@hashgraph/proto").proto.IResponseHeader;
        type ICryptoGetAccountBalanceQuery = import("@hashgraph/proto").proto.ICryptoGetAccountBalanceQuery;
        type ICryptoGetAccountBalanceResponse = import("@hashgraph/proto").proto.ICryptoGetAccountBalanceResponse;
    }
}
export type Channel = import("../channel/Channel.js").default;
export type Client = import("../client/Client.js").default<any, any>;
import AccountBalance from "./AccountBalance.js";
import Query from "../query/Query.js";
import AccountId from "./AccountId.js";
import ContractId from "../contract/ContractId.js";
