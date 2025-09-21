import { AccountId, TokenId, Transaction, TransactionReceipt, TransactionResponse } from "@hashgraph/sdk";
import { TransactionStrategy } from "../base_strategy";
import { AssociateTokenResult } from "../../../results";
export declare class AssociateTokenStrategy implements TransactionStrategy<AssociateTokenResult> {
    private tokenId;
    private issuerAccountId;
    constructor(tokenId: string | TokenId, issuerAccountId: string | AccountId);
    build(): Transaction;
    formatResult(txResponse: TransactionResponse, receipt: TransactionReceipt): AssociateTokenResult;
}
//# sourceMappingURL=associate_token_strategy.d.ts.map