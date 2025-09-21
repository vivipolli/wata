import { BaseResult } from "../base_result";
import { AgentKitActionName } from "../../../types";
export type RejectTokenResult = {
    status: string;
    txHash: string;
};
export declare class CustodialRejectTokenResult implements BaseResult<RejectTokenResult> {
    readonly txHash: string;
    readonly status: string;
    actionName: AgentKitActionName;
    constructor(txHash: string, status: string);
    getRawResponse(): RejectTokenResult;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
export declare class NonCustodialRejectTokenResult implements BaseResult<string> {
    readonly txBytes: string;
    actionName: AgentKitActionName;
    constructor(txBytes: string);
    getRawResponse(): string;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
//# sourceMappingURL=reject_token_results.d.ts.map