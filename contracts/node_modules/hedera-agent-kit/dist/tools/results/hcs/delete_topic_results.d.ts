import { BaseResult } from "../base_result";
import { AgentKitActionName } from "../../../types";
export type DeleteTopicResult = {
    status: string;
    txHash: string;
};
export declare class CustodialDeleteTopicResult implements BaseResult<DeleteTopicResult> {
    readonly txHash: string;
    readonly status: string;
    actionName: AgentKitActionName;
    constructor(txHash: string, status: string);
    getRawResponse(): DeleteTopicResult;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
export declare class NonCustodialDeleteTopicResult implements BaseResult<string> {
    readonly txBytes: string;
    actionName: AgentKitActionName;
    constructor(txBytes: string);
    getRawResponse(): string;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
//# sourceMappingURL=delete_topic_results.d.ts.map