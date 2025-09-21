/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IProxyStaker} HieroProto.proto.IProxyStaker
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 */
/**
 * @typedef {import("bignumber.js").default} BigNumber
 */
/**
 * An account, and the amount that it sends or receives during a cryptocurrency transfer.
 */
export default class ProxyStaker {
    /**
     * @internal
     * @param {HieroProto.proto.IProxyStaker} transfer
     * @returns {ProxyStaker}
     */
    static _fromProtobuf(transfer: HieroProto.proto.IProxyStaker): ProxyStaker;
    /**
     * @private
     * @param {object} props
     * @param {AccountId} props.accountId
     * @param {number | string | Long | BigNumber | Hbar} props.amount
     */
    private constructor();
    /**
     * The Account ID that sends or receives cryptocurrency.
     *
     * @readonly
     */
    readonly accountId: AccountId;
    /**
     * The amount of tinybars that the account sends(negative)
     * or receives(positive).
     *
     * @readonly
     */
    readonly amount: Hbar;
    /**
     * @internal
     * @returns {HieroProto.proto.IProxyStaker}
     */
    _toProtobuf(): HieroProto.proto.IProxyStaker;
}
export namespace HieroProto {
    namespace proto {
        type IProxyStaker = import("@hashgraph/proto").proto.IProxyStaker;
        type IAccountID = import("@hashgraph/proto").proto.IAccountID;
    }
}
export type BigNumber = import("bignumber.js").default;
import AccountId from "./AccountId.js";
import Hbar from "../Hbar.js";
