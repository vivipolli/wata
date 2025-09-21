/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ICustomFee} HieroProto.proto.ICustomFee
 */
export default class CustomFee {
    /**
     * @internal
     * @abstract
     * @param {HieroProto.proto.ICustomFee} info
     * @returns {CustomFee}
     */
    static _fromProtobuf(info: HieroProto.proto.ICustomFee): CustomFee;
    /**
     * @param {object} props
     * @param {AccountId | string} [props.feeCollectorAccountId]
     * @param {boolean} [props.allCollectorsAreExempt]
     */
    constructor(props?: {
        feeCollectorAccountId?: string | AccountId | undefined;
        allCollectorsAreExempt?: boolean | undefined;
    });
    /**
     * @type {?AccountId}
     */
    _feeCollectorAccountId: AccountId | null;
    _allCollectorsAreExempt: boolean;
    /**
     * @returns {?AccountId}
     */
    get feeCollectorAccountId(): AccountId | null;
    /**
     * @param {AccountId | string} feeCollectorAccountId
     * @returns {this}
     */
    setFeeCollectorAccountId(feeCollectorAccountId: AccountId | string): this;
    /**
     * @returns {boolean}
     */
    get allCollectorsAreExempt(): boolean;
    /**
     * @param {boolean} allCollectorsAreExempt
     * @returns {this}
     */
    setAllCollectorsAreExempt(allCollectorsAreExempt: boolean): this;
    /**
     * @internal
     * @abstract
     * @returns {HieroProto.proto.ICustomFee}
     */
    _toProtobuf(): HieroProto.proto.ICustomFee;
}
export namespace HieroProto {
    namespace proto {
        type ICustomFee = import("@hashgraph/proto").proto.ICustomFee;
    }
}
import AccountId from "../account/AccountId.js";
