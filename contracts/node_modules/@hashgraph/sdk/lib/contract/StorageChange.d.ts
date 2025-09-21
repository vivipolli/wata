/**
 * @deprecated - Use mirror node for contract traceability instead
 */
export default class StorageChange {
    /**
     * @internal
     * @param {HieroProto.proto.IStorageChange} change
     * @returns {StorageChange}
     */
    static _fromProtobuf(change: HieroProto.proto.IStorageChange): StorageChange;
    /**
     * @param {Uint8Array} bytes
     * @returns {StorageChange}
     */
    static fromBytes(bytes: Uint8Array): StorageChange;
    /**
     * @private
     * @param {object} props
     * @param {Uint8Array} props.slot
     * @param {Uint8Array} props.valueRead
     * @param {Uint8Array?} props.valueWritten
     */
    private constructor();
    slot: Uint8Array<ArrayBufferLike>;
    valueRead: Uint8Array<ArrayBufferLike>;
    valueWritten: Uint8Array<ArrayBufferLike> | null;
    /**
     * @internal
     * @returns {HieroProto.proto.IStorageChange}
     */
    _toProtobuf(): HieroProto.proto.IStorageChange;
    /**
     * @returns {Uint8Array}
     */
    toBytes(): Uint8Array;
}
import * as HieroProto from "@hashgraph/proto";
