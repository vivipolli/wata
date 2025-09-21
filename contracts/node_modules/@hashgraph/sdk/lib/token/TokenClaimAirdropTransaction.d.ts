/**
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITokenClaimAirdropTransactionBody} HieroProto.proto.ITokenClaimAirdropTransactionBody
 */
/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../account/AccountId.js").default} AccountId
 */
/**
 * A transaction that allows an account to claim tokens from a pending airdrop.
 * This transaction is used to finalize the receipt of tokens that were distributed
 * through an airdrop mechanism but require explicit claiming by the recipient.
 */
export default class TokenClaimAirdropTransaction extends AirdropPendingTransaction {
    /**
     * @internal
     * @param {HieroProto.proto.ITransaction[]} transactions
     * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {TokenClaimAirdropTransaction}
     */
    static _fromProtobuf(transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): TokenClaimAirdropTransaction;
    /**
     * @override
     * @internal
     * @returns {HieroProto.proto.ITokenClaimAirdropTransactionBody}
     */
    override _makeTransactionData(): HieroProto.proto.ITokenClaimAirdropTransactionBody;
}
export namespace HieroProto {
    namespace proto {
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
        type ITransactionResponse = import("@hashgraph/proto").proto.ITransactionResponse;
        type TransactionBody = import("@hashgraph/proto").proto.TransactionBody;
        type ISignedTransaction = import("@hashgraph/proto").proto.ISignedTransaction;
        type ITransactionBody = import("@hashgraph/proto").proto.ITransactionBody;
        type ITokenClaimAirdropTransactionBody = import("@hashgraph/proto").proto.ITokenClaimAirdropTransactionBody;
    }
}
export type Channel = import("../channel/Channel.js").default;
export type TransactionId = import("../transaction/TransactionId.js").default;
export type AccountId = import("../account/AccountId.js").default;
import AirdropPendingTransaction from "./AirdropPendingTransaction.js";
