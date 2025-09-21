/**
 * Represents a pair of fee schedules on the Hedera network - the currently active fee schedule
 * and the next upcoming fee schedule. This structure allows for transparent fee updates by making
 * future fee changes visible before they take effect.
 */
export default class FeeSchedules {
    /**
     * @param {Uint8Array} bytes
     * @returns {FeeSchedules}
     */
    static fromBytes(bytes: Uint8Array): FeeSchedules;
    /**
     * @internal
     * @param {HieroProto.proto.ICurrentAndNextFeeSchedule} feeSchedules
     * @returns {FeeSchedules}
     */
    static _fromProtobuf(feeSchedules: HieroProto.proto.ICurrentAndNextFeeSchedule): FeeSchedules;
    /**
     * @param {object} [props]
     * @param {FeeSchedule} [props.currentFeeSchedule]
     * @param {FeeSchedule} [props.nextFeeSchedule]
     */
    constructor(props?: {
        currentFeeSchedule?: FeeSchedule | undefined;
        nextFeeSchedule?: FeeSchedule | undefined;
    });
    current: FeeSchedule | undefined;
    next: FeeSchedule | undefined;
    /**
     * @internal
     * @returns {HieroProto.proto.ICurrentAndNextFeeSchedule}
     */
    _toProtobuf(): HieroProto.proto.ICurrentAndNextFeeSchedule;
    /**
     * @returns {Uint8Array}
     */
    toBytes(): Uint8Array;
}
import FeeSchedule from "./FeeSchedule.js";
import * as HieroProto from "@hashgraph/proto";
