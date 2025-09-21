import { PendingAirdropId, Transaction, TransactionReceipt, TransactionResponse } from "@hashgraph/sdk";
import { TransactionStrategy } from "../base_strategy";
import { ClaimAirdropResult } from "../../../results";
export declare class ClaimAirdropStrategy implements TransactionStrategy<ClaimAirdropResult> {
    private airdropId;
    constructor(airdropId: PendingAirdropId);
    build(): Transaction;
    formatResult(txResponse: TransactionResponse, receipt: TransactionReceipt): ClaimAirdropResult;
}
//# sourceMappingURL=claim_airdrop_strategy.d.ts.map