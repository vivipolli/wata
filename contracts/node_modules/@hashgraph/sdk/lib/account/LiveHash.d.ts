/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 * @typedef {import("@hashgraph/proto").proto.ILiveHash} HieroProto.proto.ILiveHash
 * @typedef {import("@hashgraph/proto").proto.IDuration} HieroProto.proto.IDuration
 */
/**
 * Response when the client sends the node CryptoGetInfoQuery.
 */
export default class LiveHash {
    /**
     * @internal
     * @param {HieroProto.proto.ILiveHash} liveHash
     * @returns {LiveHash}
     */
    static _fromProtobuf(liveHash: HieroProto.proto.ILiveHash): LiveHash;
    /**
     * @private
     * @param {object} props
     * @param {AccountId} props.accountId
     * @param {Uint8Array} props.hash
     * @param {KeyList} props.keys
     * @param {Duration} props.duration
     */
    private constructor();
    /** @readonly */
    readonly accountId: AccountId;
    /** @readonly */
    readonly hash: Uint8Array<ArrayBufferLike>;
    /** @readonly */
    readonly keys: KeyList;
    /** @readonly */
    readonly duration: Duration;
    /**
     * @internal
     * @returns {HieroProto.proto.ILiveHash}
     */
    _toProtobuf(): HieroProto.proto.ILiveHash;
}
export namespace HieroProto {
    namespace proto {
        type IAccountID = import("@hashgraph/proto").proto.IAccountID;
        type ILiveHash = import("@hashgraph/proto").proto.ILiveHash;
        type IDuration = import("@hashgraph/proto").proto.IDuration;
    }
}
import AccountId from "./AccountId.js";
import KeyList from "../KeyList.js";
import Duration from "../Duration.js";
