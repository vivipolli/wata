import { TopicId, Transaction, TransactionReceipt, TransactionResponse } from "@hashgraph/sdk";
import { TransactionStrategy } from "../base_strategy";
import { DeleteTopicResult } from "../../../results";
export declare class DeleteTopicStrategy implements TransactionStrategy<DeleteTopicResult> {
    private topicId;
    constructor(topicId: TopicId | string);
    build(): Transaction;
    formatResult(txResponse: TransactionResponse, receipt: TransactionReceipt): DeleteTopicResult;
}
//# sourceMappingURL=delete_topic_strategy.d.ts.map