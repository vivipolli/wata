/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IKey} HieroProto.proto.IKey
 * @typedef {import("@hashgraph/proto").proto.IKeyList} HieroProto.proto.IKeyList
 * @typedef {import("@hashgraph/proto").proto.IThresholdKey} HieroProto.proto.IThresholdKey
 */
/**
 * A list of Keys (`Key`) with an optional threshold.
 */
export default class KeyList extends Key {
    /**
     * @param {Key[]} keys
     * @returns {KeyList}
     */
    static of(...keys: Key[]): KeyList;
    /**
     * @template T
     * @param {ArrayLike<Key>} arrayLike
     * @param {((key: Key) => Key)} [mapFn]
     * @param {T} [thisArg]
     * @returns {KeyList}
     */
    static from<T>(arrayLike: ArrayLike<Key>, mapFn?: ((key: Key) => Key), thisArg?: T): KeyList;
    /**
     * @param {HieroProto.proto.IKeyList} key
     * @returns {KeyList}
     */
    static __fromProtobufKeyList(key: HieroProto.proto.IKeyList): KeyList;
    /**
     * @param {HieroProto.proto.IThresholdKey} key
     * @returns {KeyList}
     */
    static __fromProtobufThresoldKey(key: HieroProto.proto.IThresholdKey): KeyList;
    /**
     * @param {?Key[]} [keys]
     * @param {?number} [threshold]
     */
    constructor(keys?: Key[] | null, threshold?: number | null);
    _keys: any[];
    /**
     * @type {?number}
     */
    _threshold: number | null;
    /**
     * @returns {?number}
     */
    get threshold(): number | null;
    /**
     * @param {number} threshold
     * @returns {this}
     */
    setThreshold(threshold: number): this;
    /**
     * @param {Key[]} keys
     * @returns {number}
     */
    push(...keys: Key[]): number;
    /**
     * @param {number} start
     * @param {number} deleteCount
     * @param {Key[]} items
     * @returns {KeyList}
     */
    splice(start: number, deleteCount: number, ...items: Key[]): KeyList;
    /**
     * @param {number=} start
     * @param {number=} end
     * @returns {KeyList}
     */
    slice(start?: number | undefined, end?: number | undefined): KeyList;
    /**
     * @returns {Key[]}
     */
    toArray(): Key[];
    /**
     * @returns {Iterator<Key>}
     */
    [Symbol.iterator](): Iterator<Key>;
}
export namespace HieroProto {
    namespace proto {
        type IKey = import("@hashgraph/proto").proto.IKey;
        type IKeyList = import("@hashgraph/proto").proto.IKeyList;
        type IThresholdKey = import("@hashgraph/proto").proto.IThresholdKey;
    }
}
import Key from "./Key.js";
