export default class PendingAirdropRecord {
    /**
     * @param {HieroProto.proto.PendingAirdropRecord} pb
     * @returns {PendingAirdropRecord}
     */
    static fromBytes(pb: HieroProto.proto.PendingAirdropRecord): PendingAirdropRecord;
    /**
     * @param {object} props
     * @param {PendingAirdropId} props.airdropId
     * @param {Long} props.amount
     */
    constructor(props: {
        airdropId: PendingAirdropId;
        amount: Long;
    });
    airdropId: PendingAirdropId;
    amount: Long;
    /**
     * @returns {HieroProto.proto.PendingAirdropRecord}
     */
    toBytes(): HieroProto.proto.PendingAirdropRecord;
}
export namespace HieroProto {
    namespace proto {
        type PendingAirdropRecord = import("@hashgraph/proto").proto.PendingAirdropRecord;
    }
}
import PendingAirdropId from "./PendingAirdropId.js";
import Long from "long";
