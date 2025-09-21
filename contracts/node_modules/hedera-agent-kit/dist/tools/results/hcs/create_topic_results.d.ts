import { BaseResult } from "../base_result";
import { AgentKitActionName } from "../../../types";
export type CreateTopicResult = {
    status: string;
    txHash: string;
    topicId: string;
};
export declare class CustodialCreateTopicResult implements BaseResult<CreateTopicResult> {
    readonly topicId: string;
    readonly txHash: string;
    readonly status: string;
    actionName: AgentKitActionName;
    constructor(topicId: string, txHash: string, status: string);
    getRawResponse(): CreateTopicResult;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
export declare class NonCustodialCreateTopicResult implements BaseResult<string> {
    readonly txBytes: string;
    actionName: AgentKitActionName;
    constructor(txBytes: string);
    getRawResponse(): string;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
//# sourceMappingURL=create_topic_results.d.ts.map