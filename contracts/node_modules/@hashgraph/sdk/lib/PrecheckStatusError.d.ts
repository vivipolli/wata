/**
 * @typedef {import("./Status.js").default} Status
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 * @typedef {import("./contract/ContractFunctionResult.js").default} ContractFunctionResult
 * @typedef {import("./account/AccountId.js").default} AccountId
 */
/**
 * @typedef {object} PrecheckStatusErrorJSON
 * @property {string} name
 * @property {string} status
 * @property {string} transactionId
 * @property {?string | null} nodeId
 * @property {string} message
 * @property {?ContractFunctionResult} contractFunctionResult
 */
/**
 * Represents an error that occurs during the pre-check phase of a transaction
 * on the Hedera network. The `PrecheckStatusError` class extends the base
 * `StatusError` class and provides additional context specific to pre-check
 * failures, such as the transaction ID, status, and any associated messages.
 *
 * This error is typically thrown when a transaction fails to meet the necessary
 * conditions before being processed, allowing developers to handle such errors
 * gracefully in their applications. The error includes details about the failure,
 * making it easier to diagnose issues related to transaction submissions.
 */
export default class PrecheckStatusError extends StatusError {
    /**
     * @param {object} props
     * @param {Status} props.status
     * @param {TransactionId} props.transactionId
     * @param {AccountId} props.nodeId
     * @param {?ContractFunctionResult} props.contractFunctionResult
     */
    constructor(props: {
        status: Status;
        transactionId: TransactionId;
        nodeId: AccountId;
        contractFunctionResult: ContractFunctionResult | null;
    });
    /**
     * @type {?ContractFunctionResult}
     * @readonly
     */
    readonly contractFunctionResult: ContractFunctionResult | null;
    /**
     * @type {AccountId}
     * @readonly
     */
    readonly nodeId: AccountId;
    /**
     * @returns {PrecheckStatusErrorJSON}
     */
    toJSON(): PrecheckStatusErrorJSON;
}
export type Status = import("./Status.js").default;
export type TransactionId = import("./transaction/TransactionId.js").default;
export type ContractFunctionResult = import("./contract/ContractFunctionResult.js").default;
export type AccountId = import("./account/AccountId.js").default;
export type PrecheckStatusErrorJSON = {
    name: string;
    status: string;
    transactionId: string;
    nodeId: (string | null) | null;
    message: string;
    contractFunctionResult: ContractFunctionResult | null;
};
import StatusError from "./StatusError.js";
