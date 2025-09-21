/**
 * A set of values the nodes use in determining transaction and query fees, and
 * constants involved in fee calculations.
 */
export default class FeeComponents {
    /**
     * @param {Uint8Array} bytes
     * @returns {FeeComponents}
     */
    static fromBytes(bytes: Uint8Array): FeeComponents;
    /**
     * @internal
     * @param {HieroProto.proto.IFeeComponents} feeComponents
     * @returns {FeeComponents}
     */
    static _fromProtobuf(feeComponents: HieroProto.proto.IFeeComponents): FeeComponents;
    /**
     * @param {object} [props]
     * @param {Long} [props.min]
     * @param {Long} [props.max]
     * @param {Long} [props.constant]
     * @param {Long} [props.transactionBandwidthByte]
     * @param {Long} [props.transactionVerification]
     * @param {Long} [props.transactionRamByteHour]
     * @param {Long} [props.transactionStorageByteHour]
     * @param {Long} [props.contractTransactionGas]
     * @param {Long} [props.transferVolumeHbar]
     * @param {Long} [props.responseMemoryByte]
     * @param {Long} [props.responseDiskByte]
     */
    constructor(props?: {
        min?: Long | undefined;
        max?: Long | undefined;
        constant?: Long | undefined;
        transactionBandwidthByte?: Long | undefined;
        transactionVerification?: Long | undefined;
        transactionRamByteHour?: Long | undefined;
        transactionStorageByteHour?: Long | undefined;
        contractTransactionGas?: Long | undefined;
        transferVolumeHbar?: Long | undefined;
        responseMemoryByte?: Long | undefined;
        responseDiskByte?: Long | undefined;
    });
    min: Long | undefined;
    max: Long | undefined;
    constant: Long | undefined;
    transactionBandwidthByte: Long | undefined;
    transactionVerification: Long | undefined;
    transactionRamByteHour: Long | undefined;
    transactionStorageByteHour: Long | undefined;
    contractTransactionGas: Long | undefined;
    transferVolumeHbar: Long | undefined;
    responseMemoryByte: Long | undefined;
    responseDiskByte: Long | undefined;
    /**
     * @internal
     * @returns {HieroProto.proto.IFeeComponents}
     */
    _toProtobuf(): HieroProto.proto.IFeeComponents;
    /**
     * @returns {Uint8Array}
     */
    toBytes(): Uint8Array;
}
import Long from "long";
import * as HieroProto from "@hashgraph/proto";
