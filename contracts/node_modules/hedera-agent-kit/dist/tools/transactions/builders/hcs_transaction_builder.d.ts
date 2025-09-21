import { BaseTransactionBuilder } from "./base_transaction_builder";
import { TopicId } from "@hashgraph/sdk";
import { CreateTopicResult, DeleteTopicResult, SubmitMessageResult } from "../../results";
export declare class HcsTransactionBuilder {
    static createTopic(memo: string, publicKey: any, isSubmitKey: boolean): BaseTransactionBuilder<CreateTopicResult>;
    static submitTopicMessage(topicId: TopicId, message: string): BaseTransactionBuilder<SubmitMessageResult>;
    static deleteTopic(topicId: TopicId | string): BaseTransactionBuilder<DeleteTopicResult>;
}
//# sourceMappingURL=hcs_transaction_builder.d.ts.map