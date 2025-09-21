/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ICustomFee} HieroProto.proto.ICustomFee
 * @typedef {import("@hashgraph/proto").proto.IFractionalFee} HieroProto.proto.IFractionalFee
 * @typedef {import("@hashgraph/proto").proto.IFraction} HieroProto.proto.IFraction
 */
export default class CustomFractionalFee extends CustomFee {
    /**
     * @param {object} props
     * @param {AccountId | string} [props.feeCollectorAccountId]
     * @param {boolean} [props.allCollectorsAreExempt]
     * @param {Long | number} [props.numerator]
     * @param {Long | number} [props.denominator]
     * @param {Long | number} [props.min]
     * @param {Long | number} [props.max]
     * @param {FeeAssessmentMethod} [props.assessmentMethod]
     */
    constructor(props?: {
        feeCollectorAccountId?: string | AccountId | undefined;
        allCollectorsAreExempt?: boolean | undefined;
        numerator?: number | Long | undefined;
        denominator?: number | Long | undefined;
        min?: number | Long | undefined;
        max?: number | Long | undefined;
        assessmentMethod?: FeeAssessmentMethod | undefined;
    });
    /**
     * @type {?Long}
     */
    _numerator: Long | null;
    /**
     * @type {?Long}
     */
    _denominator: Long | null;
    /**
     * @type {?Long}
     */
    _min: Long | null;
    /**
     * @type {?Long}
     */
    _max: Long | null;
    /**
     * @type {?FeeAssessmentMethod}
     */
    _assessmentMethod: FeeAssessmentMethod | null;
    /**
     * @returns {?Long}
     */
    get numerator(): Long | null;
    /**
     * @param {Long | number} numerator
     * @returns {CustomFractionalFee}
     */
    setNumerator(numerator: Long | number): CustomFractionalFee;
    /**
     * @returns {?Long}
     */
    get denominator(): Long | null;
    /**
     * @param {Long | number} denominator
     * @returns {CustomFractionalFee}
     */
    setDenominator(denominator: Long | number): CustomFractionalFee;
    /**
     * @returns {?Long}
     */
    get min(): Long | null;
    /**
     * @param {Long | number} min
     * @returns {CustomFractionalFee}
     */
    setMin(min: Long | number): CustomFractionalFee;
    /**
     * @returns {?Long}
     */
    get max(): Long | null;
    /**
     * @param {Long | number} max
     * @returns {CustomFractionalFee}
     */
    setMax(max: Long | number): CustomFractionalFee;
    /**
     * @returns {?FeeAssessmentMethod}
     */
    get assessmentMethod(): FeeAssessmentMethod | null;
    /**
     * @param {FeeAssessmentMethod} assessmentMethod
     * @returns {CustomFractionalFee}
     */
    setAssessmentMethod(assessmentMethod: FeeAssessmentMethod): CustomFractionalFee;
}
export namespace HieroProto {
    namespace proto {
        type ICustomFee = import("@hashgraph/proto").proto.ICustomFee;
        type IFractionalFee = import("@hashgraph/proto").proto.IFractionalFee;
        type IFraction = import("@hashgraph/proto").proto.IFraction;
    }
}
import CustomFee from "./CustomFee.js";
import Long from "long";
import FeeAssessmentMethod from "./FeeAssessmentMethod.js";
import AccountId from "../account/AccountId.js";
