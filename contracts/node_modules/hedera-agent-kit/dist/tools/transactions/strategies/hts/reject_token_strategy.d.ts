import { AccountId, TokenId, Transaction, TransactionReceipt, TransactionResponse } from "@hashgraph/sdk";
import { TransactionStrategy } from "../base_strategy";
import { RejectTokenResult } from "../../../results";
export declare class RejectTokenStrategy implements TransactionStrategy<RejectTokenResult> {
    private tokenId;
    private issuerAccountId;
    constructor(tokenId: TokenId, issuerAccountId: AccountId);
    build(): Transaction;
    formatResult(txResponse: TransactionResponse, receipt: TransactionReceipt): RejectTokenResult;
}
//# sourceMappingURL=reject_token_strategy.d.ts.map