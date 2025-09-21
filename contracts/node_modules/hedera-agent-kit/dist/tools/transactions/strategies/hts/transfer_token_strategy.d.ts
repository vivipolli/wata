import { AccountId, TokenId, Transaction, TransactionReceipt, TransactionResponse } from "@hashgraph/sdk";
import { TransactionStrategy } from "../base_strategy";
import { TransferTokenResult } from "../../../results";
export declare class TransferTokenStrategy implements TransactionStrategy<TransferTokenResult> {
    private tokenId;
    private amount;
    private targetAccountId;
    private issuerAccountId;
    constructor(tokenId: TokenId | string, amount: number, targetAccountId: AccountId | string, issuerAccountId: AccountId | string);
    build(): Transaction;
    formatResult(txResponse: TransactionResponse, receipt: TransactionReceipt): TransferTokenResult;
}
//# sourceMappingURL=transfer_token_strategy.d.ts.map