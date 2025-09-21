/**
 * Represents a point in time with seconds and nanoseconds precision.
 *
 * The `Timestamp` class provides methods for creating, manipulating, and converting
 * timestamps. It supports operations such as addition of nanoseconds, conversion to
 * JavaScript Date objects, and generation of timestamps based on the current time.
 */
export default class Timestamp {
    /**
     * @param {boolean} hasJitter
     * @returns {Timestamp}
     */
    static generate(hasJitter?: boolean): Timestamp;
    /**
     * @param {string | number | Date} date
     * @returns {Timestamp}
     */
    static fromDate(date: string | number | Date): Timestamp;
    /**
     * @internal
     * @param {HieroProto.proto.ITimestamp} timestamp
     * @returns {Timestamp}
     */
    static _fromProtobuf(timestamp: HieroProto.proto.ITimestamp): Timestamp;
    /**
     * @param {Long | number} seconds
     * @param {Long | number} nanos
     */
    constructor(seconds: Long | number, nanos: Long | number);
    /**
     * @readonly
     * @type {Long}
     */
    readonly seconds: Long;
    /**
     * @readonly
     * @type {Long}
     */
    readonly nanos: Long;
    /**
     * @returns {Date}
     */
    toDate(): Date;
    /**
     * @param {Long | number} nanos
     * @returns {Timestamp}
     */
    plusNanos(nanos: Long | number): Timestamp;
    /**
     * @internal
     * @returns {HieroProto.proto.ITimestamp}
     */
    _toProtobuf(): HieroProto.proto.ITimestamp;
    /**
     * @returns {string}
     */
    toString(): string;
    /**
     * @param {Timestamp} other
     * @returns {number}
     */
    compare(other: Timestamp): number;
}
export namespace HieroProto {
    namespace proto {
        type ITimestamp = import("@hashgraph/proto").proto.ITimestamp;
    }
}
import Long from "long";
