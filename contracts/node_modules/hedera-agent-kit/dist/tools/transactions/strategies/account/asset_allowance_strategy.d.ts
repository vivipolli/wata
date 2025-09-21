import { AccountId, TokenId, Transaction, TransactionReceipt, TransactionResponse } from "@hashgraph/sdk";
import { TransactionStrategy } from "../base_strategy";
import { AssetAllowanceResult } from "../../../results";
export declare class AssetAllowanceStrategy implements TransactionStrategy<AssetAllowanceResult> {
    private tokenId;
    private amount;
    private payerAccountId;
    private spenderAccountId;
    constructor(tokenId: TokenId | string | undefined, amount: number, payerAccountId: string | AccountId, spenderAccountId: string | AccountId);
    build(): Transaction;
    formatResult(txResponse: TransactionResponse, receipt: TransactionReceipt): AssetAllowanceResult;
}
//# sourceMappingURL=asset_allowance_strategy.d.ts.map