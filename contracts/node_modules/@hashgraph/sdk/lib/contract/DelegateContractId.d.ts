/**
 * @namespace {proto}
 * @typedef {import("@hashgraph/proto").proto.IContractID} HieroProto.proto.IContractID
 * @typedef {import("@hashgraph/proto").proto.IKey} HieroProto.proto.IKey
 */
/**
 * @typedef {import("long")} Long
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */
/**
 * epresents a delegatable smart contract ID on the Hedera network.
 * This class extends ContractId and provides additional functionality for delegatable contracts.
 */
export default class DelegateContractId extends ContractId {
}
export namespace HieroProto {
    namespace proto {
        type IContractID = import("@hashgraph/proto").proto.IContractID;
        type IKey = import("@hashgraph/proto").proto.IKey;
    }
}
export type Long = import("long");
export type Client = import("../client/Client.js").default<any, any>;
import ContractId from "./ContractId.js";
