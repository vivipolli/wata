/**
 * A set of fee schedules covering all transaction types and query types, along
 * with a specific time at which this fee schedule will expire.
 */
export default class FeeSchedule {
    /**
     * @param {Uint8Array} bytes
     * @returns {FeeSchedule}
     */
    static fromBytes(bytes: Uint8Array): FeeSchedule;
    /**
     * @internal
     * @param {HieroProto.proto.IFeeSchedule} feeSchedule
     * @returns {FeeSchedule}
     */
    static _fromProtobuf(feeSchedule: HieroProto.proto.IFeeSchedule): FeeSchedule;
    /**
     * @param {object} [props]
     * @param {TransactionFeeSchedule[]} [props.transactionFeeSchedule]
     * @param {Timestamp} [props.expirationTime]
     */
    constructor(props?: {
        transactionFeeSchedule?: TransactionFeeSchedule[] | undefined;
        expirationTime?: Timestamp | undefined;
    });
    transactionFeeSchedule: TransactionFeeSchedule[] | undefined;
    expirationTime: Timestamp | undefined;
    /**
     * @internal
     * @returns {HieroProto.proto.IFeeSchedule}
     */
    _toProtobuf(): HieroProto.proto.IFeeSchedule;
    /**
     * @returns {Uint8Array}
     */
    toBytes(): Uint8Array;
}
import TransactionFeeSchedule from "./TransactionFeeSchedule.js";
import Timestamp from "./Timestamp.js";
import * as HieroProto from "@hashgraph/proto";
