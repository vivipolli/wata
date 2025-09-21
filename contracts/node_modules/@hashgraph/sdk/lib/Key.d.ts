/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IKey} HieroProto.proto.IKey
 */
export default class Key {
    /**
     * @internal
     * @param {HieroProto.proto.IKey} key
     * @returns {Key}
     */
    static _fromProtobufKey(key: HieroProto.proto.IKey): Key;
    /**
     * @internal
     * @abstract
     * @returns {HieroProto.proto.IKey}
     */
    _toProtobufKey(): HieroProto.proto.IKey;
}
export namespace HieroProto {
    namespace proto {
        type IKey = import("@hashgraph/proto").proto.IKey;
    }
}
