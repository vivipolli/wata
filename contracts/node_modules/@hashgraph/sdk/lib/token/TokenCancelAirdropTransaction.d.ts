/**
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITokenCancelAirdropTransactionBody} HieroProto.proto.ITokenCancelAirdropTransactionBody
 */
/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../account/AccountId.js").default} AccountId
 */
/**
 * A transaction that allows the cancellation of pending airdrops.
 * This transaction can be used by authorized accounts to cancel airdrop operations
 * that have been initiated but not yet claimed by recipients.
 */
export default class TokenCancelAirdropTransaction extends AirdropPendingTransaction {
    /**
     * @internal
     * @param {HieroProto.proto.ITransaction[]} transactions
     * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {TokenCancelAirdropTransaction}
     */
    static _fromProtobuf(transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): TokenCancelAirdropTransaction;
    /**
     * @override
     * @internal
     * @returns {HieroProto.proto.ITokenCancelAirdropTransactionBody}
     */
    override _makeTransactionData(): HieroProto.proto.ITokenCancelAirdropTransactionBody;
}
export namespace HieroProto {
    namespace proto {
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
        type ITransactionResponse = import("@hashgraph/proto").proto.ITransactionResponse;
        type TransactionBody = import("@hashgraph/proto").proto.TransactionBody;
        type ISignedTransaction = import("@hashgraph/proto").proto.ISignedTransaction;
        type ITransactionBody = import("@hashgraph/proto").proto.ITransactionBody;
        type ITokenCancelAirdropTransactionBody = import("@hashgraph/proto").proto.ITokenCancelAirdropTransactionBody;
    }
}
export type Channel = import("../channel/Channel.js").default;
export type TransactionId = import("../transaction/TransactionId.js").default;
export type AccountId = import("../account/AccountId.js").default;
import AirdropPendingTransaction from "./AirdropPendingTransaction.js";
