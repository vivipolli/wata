import { Transaction, TransactionReceipt, TransactionResponse } from "@hashgraph/sdk";
import { TransactionStrategy } from "../base_strategy";
import { CreateTopicResult } from "../../../results";
export declare class CreateTopicStrategy implements TransactionStrategy<CreateTopicResult> {
    private memo;
    private publicKey;
    private isSubmitKey;
    constructor(memo: string, publicKey: any, isSubmitKey: boolean);
    build(): Transaction;
    formatResult(txResponse: TransactionResponse, receipt: TransactionReceipt): CreateTopicResult;
}
//# sourceMappingURL=create_topic_strategy.d.ts.map