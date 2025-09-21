/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenAirdropTransactionBody} HieroProto.proto.ITokenAirdropTransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HieroProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionID} HieroProto.proto.TransactionID
 * @typedef {import("@hashgraph/proto").proto.AccountID} HieroProto.proto.AccountID
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HieroProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HieroProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HieroProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HieroProto.proto.ITransactionResponse
 */
/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../account/AccountId.js").default} AccountId
 * @typedef {import("./NftId.js").default} NftId
 * @typedef {import("./TokenId.js").default} TokenId
 */
/**
 * Airdrop one or more tokens to one or more accounts.
 *
 * ### Effects
 * This distributes tokens from the balance of one or more sending account(s)
 * to the balance of one or more recipient accounts. Accounts MAY receive the
 * tokens in one of four ways.
 *
 *  - An account already associated to the token to be distributed SHALL
 *    receive the airdropped tokens immediately to the recipient account
 *    balance.<br/>
 *    The fee for this transfer SHALL include the transfer, the airdrop fee,
 *    and any custom fees.
 *  - An account with available automatic association slots SHALL be
 *    automatically associated to the token, and SHALL immediately receive
 *    the airdropped tokens to the recipient account balance.<br/>
 *    The fee for this transfer SHALL include the transfer, the association,
 *    the cost to renew that association once, the airdrop fee, and
 *    any custom fees.
 *  - An account with "receiver signature required" set SHALL have a
 *    "Pending Airdrop" created and must claim that airdrop with a
 *    `claimAirdrop` transaction.<br/>
 *    The fee for this transfer SHALL include the transfer, the association,
 *    the cost to renew that association once, the airdrop fee, and
 *    any custom fees.<br/>
 *    If the pending airdrop is not claimed immediately, the `sender` SHALL
 *    pay the cost to renew the token association, and the cost to maintain
 *    the pending airdrop, until the pending airdrop is claimed or cancelled.
 *  - An account with no available automatic association slots SHALL have a
 *    "Pending Airdrop" created and must claim that airdrop with a
 *    `claimAirdrop` transaction.<br/>
 *    The fee for this transfer SHALL include the transfer, the association,
 *    the cost to renew that association once, the airdrop fee, and any custom
 *    fees.<br/>
 *    If the pending airdrop is not claimed immediately, the `sender` SHALL
 *    pay the cost to renew the token association, and the cost to maintain
 *    the pending airdrop, until the pending airdrop is claimed or cancelled.
 *
 * If an airdrop would create a pending airdrop for a fungible/common token,
 * and a pending airdrop for the same sender, receiver, and token already
 * exists, the existing pending airdrop SHALL be updated to add the new
 * amount to the existing airdrop, rather than creating
 * a new pending airdrop.<br/>
 * Any airdrop that completes immediately SHALL be irreversible. Any airdrop
 * that results in a "Pending Airdrop" MAY be canceled via a `cancelAirdrop`
 * transaction.<br/>
 * All transfer fees (including custom fees and royalties), as well as the
 * rent cost for the first auto-renewal period for any automatic-association
 * slot occupied by the airdropped tokens, SHALL be charged to the account
 * paying for this transaction.<br/>
 */
export default class TokenAirdropTransaction extends AbstractTokenTransferTransaction {
    /**
     * @internal
     * @param {HieroProto.proto.ITransaction[]} transactions
     * @param {HieroProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HieroProto.proto.ITransactionBody[]} bodies
     * @returns {TokenAirdropTransaction}
     */
    static _fromProtobuf(transactions: HieroProto.proto.ITransaction[], signedTransactions: HieroProto.proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: HieroProto.proto.ITransactionBody[]): TokenAirdropTransaction;
    /**
     * @param {object} props
     * @param {TokenTransfer[]} [props.tokenTransfers]
     * @param {NftTransfer[]} [props.nftTransfers]
     */
    constructor(props?: {
        tokenTransfers?: TokenTransfer[] | undefined;
        nftTransfers?: NftTransfer[] | undefined;
    });
    /**
     *
     * @param {TokenId} tokenId
     * @param {AccountId} accountId
     * @param {Long} amount
     * @param {number} expectedDecimals
     * @returns {this}
     */
    addApprovedTokenTransferWithDecimals(tokenId: TokenId, accountId: AccountId, amount: Long, expectedDecimals: number): this;
}
export namespace HieroProto {
    namespace proto {
        type ITokenAirdropTransactionBody = import("@hashgraph/proto").proto.ITokenAirdropTransactionBody;
        type ITransaction = import("@hashgraph/proto").proto.ITransaction;
        type TransactionID = import("@hashgraph/proto").proto.TransactionID;
        type AccountID = import("@hashgraph/proto").proto.AccountID;
        type ISignedTransaction = import("@hashgraph/proto").proto.ISignedTransaction;
        type ITransactionBody = import("@hashgraph/proto").proto.ITransactionBody;
        type TransactionBody = import("@hashgraph/proto").proto.TransactionBody;
        type ITransactionResponse = import("@hashgraph/proto").proto.ITransactionResponse;
    }
}
export type Channel = import("../channel/Channel.js").default;
export type TransactionId = import("../transaction/TransactionId.js").default;
export type AccountId = import("../account/AccountId.js").default;
export type NftId = import("./NftId.js").default;
export type TokenId = import("./TokenId.js").default;
import AbstractTokenTransferTransaction from "./AbstractTokenTransferTransaction.js";
import TokenTransfer from "./TokenTransfer.js";
import NftTransfer from "./TokenNftTransfer.js";
