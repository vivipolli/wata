/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IAssessedCustomFee} HieroProto.proto.IAssessedCustomFee
 */
/**
 * @typedef {object} AssessedCustomFeeJSON
 * @property {?string} feeCollectorAccountId
 * @property {?string} tokenId
 * @property {?string} amount
 * @property {string[]} payerAccountIds
 */
/**
 * Represents an assessed custom fee that has been evaluated and attached to a transaction.
 * This includes details about who collects the fee, which token the fee is paid in,
 * the amount of the fee, and which accounts are responsible for paying it.
 */
export default class AssessedCustomFee {
    /**
     * @internal
     * @param {HieroProto.proto.IAssessedCustomFee} fee
     * @returns {AssessedCustomFee}
     */
    static _fromProtobuf(fee: HieroProto.proto.IAssessedCustomFee): AssessedCustomFee;
    /**
     * @param {object} props
     * @param {AccountId | string} [props.feeCollectorAccountId]
     * @param {TokenId | string} [props.tokenId]
     * @param {Long | number} [props.amount]
     * @param {AccountId[]} [props.payerAccountIds]
     */
    constructor(props?: {
        feeCollectorAccountId?: string | AccountId | undefined;
        tokenId?: string | TokenId | undefined;
        amount?: number | Long | undefined;
        payerAccountIds?: AccountId[] | undefined;
    });
    /**
     * @type {?AccountId}
     */
    _feeCollectorAccountId: AccountId | null;
    /**
     * @type {?TokenId}
     */
    _tokenId: TokenId | null;
    /**
     * @type {?Long}
     */
    _amount: Long | null;
    /**
     * @type {?AccountId[]}
     */
    _payerAccountIds: AccountId[] | null;
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
     * @returns {?TokenId}
     */
    get tokenId(): TokenId | null;
    /**
     * @param {TokenId | string} tokenId
     * @returns {this}
     */
    setTokenId(tokenId: TokenId | string): this;
    /**
     * @returns {?Long}
     */
    get amount(): Long | null;
    /**
     * @param {Long | number} amount
     * @returns {AssessedCustomFee}
     */
    setAmount(amount: Long | number): AssessedCustomFee;
    /**
     * @returns {?AccountId[]}
     */
    get payerAccountIds(): AccountId[] | null;
    /**
     * @param {AccountId[]} payerAccountIds
     * @returns {AssessedCustomFee}
     */
    setPayerAccountIds(payerAccountIds: AccountId[]): AssessedCustomFee;
    /**
     * @internal
     * @abstract
     * @returns {HieroProto.proto.IAssessedCustomFee}
     */
    _toProtobuf(): HieroProto.proto.IAssessedCustomFee;
    /**
     * @returns {AssessedCustomFeeJSON}
     */
    toJSON(): AssessedCustomFeeJSON;
}
export namespace HieroProto {
    namespace proto {
        type IAssessedCustomFee = import("@hashgraph/proto").proto.IAssessedCustomFee;
    }
}
export type AssessedCustomFeeJSON = {
    feeCollectorAccountId: string | null;
    tokenId: string | null;
    amount: string | null;
    payerAccountIds: string[];
};
import AccountId from "../account/AccountId.js";
import TokenId from "./TokenId.js";
import Long from "long";
