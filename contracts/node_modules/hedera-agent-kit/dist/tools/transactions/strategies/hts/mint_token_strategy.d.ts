import { TokenId, Transaction, TransactionReceipt, TransactionResponse } from "@hashgraph/sdk";
import { TransactionStrategy } from "../base_strategy";
import { MintTokenResult } from "../../../results";
export declare class MintTokenStrategy implements TransactionStrategy<MintTokenResult> {
    private tokenId;
    private amount;
    constructor(tokenId: string | TokenId, amount: number);
    build(): Transaction;
    formatResult(txResponse: TransactionResponse, receipt: TransactionReceipt): MintTokenResult;
}
//# sourceMappingURL=mint_token_strategy.d.ts.map