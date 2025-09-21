export default class TransactionFeeSchedule {
    /**
     * @param {Uint8Array} bytes
     * @returns {TransactionFeeSchedule}
     */
    static fromBytes(bytes: Uint8Array): TransactionFeeSchedule;
    /**
     * @internal
     * @param {HieroProto.proto.ITransactionFeeSchedule} transactionFeeSchedule
     * @returns {TransactionFeeSchedule}
     */
    static _fromProtobuf(transactionFeeSchedule: HieroProto.proto.ITransactionFeeSchedule): TransactionFeeSchedule;
    /**
     * @param {object} [props]
     * @param {RequestType} [props.hederaFunctionality]
     * @param {FeeData} [props.feeData]
     * @param {FeeData[]} [props.fees]
     */
    constructor(props?: {
        hederaFunctionality?: RequestType | undefined;
        feeData?: FeeData | undefined;
        fees?: FeeData[] | undefined;
    });
    hederaFunctionality: RequestType | undefined;
    feeData: FeeData | undefined;
    fees: FeeData[] | undefined;
    /**
     * @internal
     * @returns {HieroProto.proto.ITransactionFeeSchedule}
     */
    _toProtobuf(): HieroProto.proto.ITransactionFeeSchedule;
    /**
     * @returns {Uint8Array}
     */
    toBytes(): Uint8Array;
}
import RequestType from "./RequestType.js";
import FeeData from "./FeeData.js";
import * as HieroProto from "@hashgraph/proto";
