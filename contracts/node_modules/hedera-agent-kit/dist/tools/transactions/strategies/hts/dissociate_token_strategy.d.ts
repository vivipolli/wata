import { AccountId, TokenId, Transaction, TransactionReceipt, TransactionResponse } from "@hashgraph/sdk";
import { TransactionStrategy } from "../base_strategy";
import { DissociateTokenResult } from "../../../results";
export declare class DissociateTokenStrategy implements TransactionStrategy<DissociateTokenResult> {
    private tokenId;
    private issuerAccountId;
    constructor(tokenId: string | TokenId, issuerAccountId: string | AccountId);
    build(): Transaction;
    formatResult(txResponse: TransactionResponse, receipt: TransactionReceipt): DissociateTokenResult;
}
//# sourceMappingURL=dissociate_token_strategy.d.ts.map