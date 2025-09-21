/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.IContractCallTransactionBody} HieroProto.proto.IContractCallTransactionBody
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 * @typedef {import("@hashgraph/proto").proto.IContractID} HieroProto.proto.IContractID
 * @typedef {import("@hashgraph/proto").proto.IFileID} HieroProto.proto.IFileID
 */
/**
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../account/AccountId.js").default} AccountId
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */
/**
 * @typedef {object} FunctionParameters
 * @property {string} name
 * @property {ContractFunctionParameters} parameters
 */
/**
 * Call a function of a given smart contract, providing function parameter
 * inputs as needed.
 * <p>
 * Resource ("gas") charges SHALL include all relevant fees incurred by
 * the contract execution, including any storage required.<br/>
 * The total transaction fee SHALL incorporate all of the "gas" actually
 * consumed as well as the standard fees for transaction handling,
 * data transfers, signature verification, etc...
 */
export default class ContractExecuteTransaction extends Transaction {
    /**
     * @internal
     * @param {HieroProto.proto.ITransaction[]} transactions
     * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {ContractExecuteTransaction}
     */
    static _fromProtobuf(transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): ContractExecuteTransaction;
    /**
     * @param {object} [props]
     * @param {ContractId | string} [props.contractId]
     * @param {number | Long} [props.gas]
     * @param {number | string | Long | BigNumber | Hbar} [props.amount]
     * @param {Uint8Array} [props.functionParameters]
     * @param {FunctionParameters} [props.function]
     */
    constructor(props?: {
        contractId?: string | ContractId | undefined;
        gas?: number | Long | undefined;
        amount?: string | number | Long | import("bignumber.js").BigNumber | Hbar | undefined;
        functionParameters?: Uint8Array<ArrayBufferLike> | undefined;
        function?: FunctionParameters | undefined;
    });
    /**
     * @private
     * @type {?ContractId}
     */
    private _contractId;
    /**
     * @private
     * @type {?Long}
     */
    private _gas;
    /**
     * @private
     * @type {?Hbar}
     */
    private _amount;
    /**
     * @private
     * @type {?Uint8Array}
     */
    private _functionParameters;
    /**
     * @returns {?ContractId}
     */
    get contractId(): ContractId | null;
    /**
     * Sets the contract ID which is being executed in this transaction.
     *
     * @param {ContractId | string} contractId
     * @returns {ContractExecuteTransaction}
     */
    setContractId(contractId: ContractId | string): ContractExecuteTransaction;
    /**
     * @returns {?Long}
     */
    get gas(): Long | null;
    /**
     * Sets the amount of gas to use for the call.
     *
     * @param {number | Long} gas
     * @returns {ContractExecuteTransaction}
     */
    setGas(gas: number | Long): ContractExecuteTransaction;
    /**
     * @returns {?Hbar}
     */
    get payableAmount(): Hbar | null;
    /**
     * Sets the number of hbars to be sent with this function call.
     *
     * @param {number | string | Long | BigNumber | Hbar} amount
     * @param {HbarUnit} unit
     * @returns {ContractExecuteTransaction}
     */
    setPayableAmount(amount: number | string | Long | BigNumber | Hbar, unit?: HbarUnit): ContractExecuteTransaction;
    /**
     * @returns {?Uint8Array}
     */
    get functionParameters(): Uint8Array | null;
    /**
     * @param {Uint8Array} functionParameters
     * @returns {this}
     */
    setFunctionParameters(functionParameters: Uint8Array): this;
    /**
     * @param {string} name
     * @param {ContractFunctionParameters} [functionParameters]
     * @returns {this}
     */
    setFunction(name: string, functionParameters?: ContractFunctionParameters): this;
    /**
     * @override
     * @protected
     * @returns {HieroProto.proto.IContractCallTransactionBody}
     */
    protected override _makeTransactionData(): HieroProto.proto.IContractCallTransactionBody;
}
export namespace HieroProto {
    namespace proto {
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
        type ISignedTransaction = import("@hashgraph/proto").proto.ISignedTransaction;
        type TransactionBody = import("@hashgraph/proto").proto.TransactionBody;
        type ITransactionBody = import("@hashgraph/proto").proto.ITransactionBody;
        type ITransactionResponse = import("@hashgraph/proto").proto.ITransactionResponse;
        type IContractCallTransactionBody = import("@hashgraph/proto").proto.IContractCallTransactionBody;
        type IAccountID = import("@hashgraph/proto").proto.IAccountID;
        type IContractID = import("@hashgraph/proto").proto.IContractID;
        type IFileID = import("@hashgraph/proto").proto.IFileID;
    }
}
export type BigNumber = import("bignumber.js").default;
export type Channel = import("../channel/Channel.js").default;
export type Client = import("../client/Client.js").default<any, any>;
export type AccountId = import("../account/AccountId.js").default;
export type TransactionId = import("../transaction/TransactionId.js").default;
export type FunctionParameters = {
    name: string;
    parameters: ContractFunctionParameters;
};
import Transaction from "../transaction/Transaction.js";
import ContractId from "./ContractId.js";
import Long from "long";
import Hbar from "../Hbar.js";
import HbarUnit from "../HbarUnit.js";
import ContractFunctionParameters from "./ContractFunctionParameters.js";
