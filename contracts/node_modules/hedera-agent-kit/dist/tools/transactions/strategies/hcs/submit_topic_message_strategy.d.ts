import { TopicId, Transaction, TransactionReceipt, TransactionResponse } from "@hashgraph/sdk";
import { TransactionStrategy } from "../base_strategy";
import { SubmitMessageResult } from "../../../results";
export declare class SubmitTopicMessageStrategy implements TransactionStrategy<SubmitMessageResult> {
    private topicId;
    private message;
    constructor(topicId: TopicId | string, message: string);
    build(): Transaction;
    formatResult(txResponse: TransactionResponse, receipt: TransactionReceipt): SubmitMessageResult;
}
//# sourceMappingURL=submit_topic_message_strategy.d.ts.map