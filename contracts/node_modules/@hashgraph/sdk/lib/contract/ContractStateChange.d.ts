/**
 * @deprecated - Use mirror node for contract traceability instead
 */
export default class ContractStateChange {
    /**
     * @internal
     * @param {HieroProto.proto.IContractStateChange} change
     * @returns {ContractStateChange}
     */
    static _fromProtobuf(change: HieroProto.proto.IContractStateChange): ContractStateChange;
    /**
     * @param {Uint8Array} bytes
     * @returns {ContractStateChange}
     */
    static fromBytes(bytes: Uint8Array): ContractStateChange;
    /**
     * @private
     * @param {object} props
     * @param {ContractId} props.contractId
     * @param {StorageChange[]} props.storageChanges
     */
    private constructor();
    contractId: ContractId;
    storageChanges: StorageChange[];
    /**
     * @internal
     * @returns {HieroProto.proto.IContractStateChange} change
     */
    _toProtobuf(): HieroProto.proto.IContractStateChange;
    /**
     * @returns {Uint8Array}
     */
    toBytes(): Uint8Array;
}
import ContractId from "./ContractId.js";
import StorageChange from "./StorageChange.js";
import * as HieroProto from "@hashgraph/proto";
