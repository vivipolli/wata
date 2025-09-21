import { BaseResult } from "../base_result";
import { AgentKitActionName } from "../../../types";
export type DissociateTokenResult = {
    status: string;
    txHash: string;
};
export declare class CustodialDissociateTokenResult implements BaseResult<DissociateTokenResult> {
    readonly txHash: string;
    readonly status: string;
    actionName: AgentKitActionName;
    constructor(txHash: string, status: string);
    getRawResponse(): DissociateTokenResult;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
export declare class NonCustodialDissociateTokenResult implements BaseResult<string> {
    readonly txBytes: string;
    actionName: AgentKitActionName;
    constructor(txBytes: string);
    getRawResponse(): string;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
//# sourceMappingURL=dissociate_token_results.d.ts.map