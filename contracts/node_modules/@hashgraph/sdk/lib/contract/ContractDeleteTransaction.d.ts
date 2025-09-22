/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.IContractDeleteTransactionBody} HieroProto.proto.IContractDeleteTransactionBody
 * @typedef {import("@hashgraph/proto").proto.IContractID} HieroProto.proto.IContractID
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 */
/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */
/**
 * Delete a smart contract, and transfer any remaining HBAR balance to a
 * designated account.
 *
 * If this call succeeds then all subsequent calls to that smart contract
 * SHALL execute the `0x0` opcode, as required for EVM equivalence.
 *
 * ### Requirements
 *  - An account or smart contract MUST be designated to receive all remaining
 *    account balances.
 *  - The smart contract MUST have an admin key set. If the contract does not
 *    have `admin_key` set, then this transaction SHALL fail and response code
 *    `MODIFYING_IMMUTABLE_CONTRACT` SHALL be set.
 *  - If `admin_key` is, or contains, an empty `KeyList` key, it SHALL be
 *    treated the same as an admin key that is not set.
 *  - The `Key` set for `admin_key` on the smart contract MUST have a valid
 *    signature set on this transaction.
 *  - The designated receiving account MAY have `receiver_sig_required` set. If
 *    that field is set, the receiver account MUST also sign this transaction.
 *  - The field `permanent_removal` MUST NOT be set. That field is reserved for
 *    internal system use when purging the smart contract from state. Any user
 *    transaction with that field set SHALL be rejected and a response code
 *    `PERMANENT_REMOVAL_REQUIRES_SYSTEM_INITIATION` SHALL be set.
 */
export default class ContractDeleteTransaction extends Transaction {
    /**
     * @internal
     * @param {HieroProto.proto.ITransaction[]} transactions
     * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {ContractDeleteTransaction}
     */
    static _fromProtobuf(transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): ContractDeleteTransaction;
    /**
     * @param {object} [props]
     * @param {ContractId | string} [props.contractId]
     * @param {ContractId | string} [props.transferContractId]
     * @param {AccountId | string} [props.transferAccountId]
     * @param {boolean} [props.permanentRemoval]
     */
    constructor(props?: {
        contractId?: string | ContractId | undefined;
        transferContractId?: string | ContractId | undefined;
        transferAccountId?: string | AccountId | undefined;
        permanentRemoval?: boolean | undefined;
    });
    /**
     * @private
     * @type {?ContractId}
     */
    private _contractId;
    /**
     * @private
     * @type {?AccountId}
     */
    private _transferAccountId;
    /**
     * @private
     * @type {?ContractId}
     */
    private _transferContractId;
    /**
     * @private
     * @type {boolean}
     */
    private _permanentRemoval;
    /**
     * @returns {?ContractId}
     */
    get contractId(): ContractId | null;
    /**
     * Sets the contract ID which is being deleted in this transaction.
     *
     * @param {ContractId | string} contractId
     * @returns {ContractDeleteTransaction}
     */
    setContractId(contractId: ContractId | string): ContractDeleteTransaction;
    /**
     * @returns {?ContractId}
     */
    get transferContractId(): ContractId | null;
    /**
     * Sets the contract ID which will receive all remaining hbars.
     *
     * @param {ContractId | string} transferContractId
     * @returns {ContractDeleteTransaction}
     */
    setTransferContractId(transferContractId: ContractId | string): ContractDeleteTransaction;
    /**
     * @returns {?AccountId}
     */
    get transferAccountId(): AccountId | null;
    /**
     * Sets the account ID which will receive all remaining hbars.
     *
     * @param {AccountId | string} transferAccountId
     * @returns {ContractDeleteTransaction}
     */
    setTransferAccountId(transferAccountId: AccountId | string): ContractDeleteTransaction;
    /**
     * @returns {boolean}
     */
    get permanentRemoval(): boolean;
    /**
     * Sets the permanent removal flag.
     *
     * @param {boolean} permanentRemoval
     * @returns {ContractDeleteTransaction}
     */
    setPermanentRemoval(permanentRemoval: boolean): ContractDeleteTransaction;
    /**
     * @override
     * @protected
     * @returns {HieroProto.proto.IContractDeleteTransactionBody}
     */
    protected override _makeTransactionData(): HieroProto.proto.IContractDeleteTransactionBody;
}
export namespace HieroProto {
    namespace proto {
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
        type ISignedTransaction = import("@hashgraph/proto").proto.ISignedTransaction;
        type TransactionBody = import("@hashgraph/proto").proto.TransactionBody;
        type ITransactionBody = import("@hashgraph/proto").proto.ITransactionBody;
        type ITransactionResponse = import("@hashgraph/proto").proto.ITransactionResponse;
        type IContractDeleteTransactionBody = import("@hashgraph/proto").proto.IContractDeleteTransactionBody;
        type IContractID = import("@hashgraph/proto").proto.IContractID;
        type IAccountID = import("@hashgraph/proto").proto.IAccountID;
    }
}
export type Channel = import("../channel/Channel.js").default;
export type Client = import("../client/Client.js").default<any, any>;
export type TransactionId = import("../transaction/TransactionId.js").default;
import Transaction from "../transaction/Transaction.js";
import ContractId from "./ContractId.js";
import AccountId from "../account/AccountId.js";
