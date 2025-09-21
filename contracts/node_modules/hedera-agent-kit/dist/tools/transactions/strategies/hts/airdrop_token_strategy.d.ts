import { AccountId, TokenId, Transaction, TransactionReceipt, TransactionResponse } from "@hashgraph/sdk";
import { TransactionStrategy } from "../base_strategy";
import { AirdropResult } from "../../../results";
export interface AirdropRecipient {
    accountId: string | AccountId;
    amount: number;
}
export declare class AirdropTokenStrategy implements TransactionStrategy<AirdropResult> {
    private tokenId;
    private recipients;
    private payerAccountId;
    constructor(tokenId: TokenId | string, recipients: AirdropRecipient[], payerAccountId: string | AccountId);
    build(): Transaction;
    formatResult(txResponse: TransactionResponse, receipt: TransactionReceipt): AirdropResult;
}
//# sourceMappingURL=airdrop_token_strategy.d.ts.map