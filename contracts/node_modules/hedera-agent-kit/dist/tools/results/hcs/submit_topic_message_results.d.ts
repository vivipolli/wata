import { BaseResult } from "../base_result";
import { AgentKitActionName } from "../../../types";
export type SubmitMessageResult = {
    status: string;
    txHash: string;
    topicId: string;
};
export declare class CustodialSubmitMessageResult implements BaseResult<SubmitMessageResult> {
    readonly txHash: string;
    readonly status: string;
    readonly topicId: string;
    actionName: AgentKitActionName;
    constructor(txHash: string, status: string, topicId: string);
    getRawResponse(): SubmitMessageResult;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
export declare class NonCustodialSubmitMessageResult implements BaseResult<string> {
    readonly txBytes: string;
    actionName: AgentKitActionName;
    constructor(txBytes: string);
    getRawResponse(): string;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
//# sourceMappingURL=submit_topic_message_results.d.ts.map