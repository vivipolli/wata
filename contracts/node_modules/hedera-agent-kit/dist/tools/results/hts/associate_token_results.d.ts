import { BaseResult } from "../base_result";
import { AgentKitActionName } from "../../../types";
export type AssociateTokenResult = {
    status: string;
    txHash: string;
};
export declare class CustodialAssociateTokenResult implements BaseResult<AssociateTokenResult> {
    readonly txHash: string;
    readonly status: string;
    actionName: AgentKitActionName;
    constructor(txHash: string, status: string);
    getRawResponse(): AssociateTokenResult;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
export declare class NonCustodialAssociateTokenResult implements BaseResult<string> {
    readonly txBytes: string;
    actionName: AgentKitActionName;
    constructor(txBytes: string);
    getRawResponse(): string;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
//# sourceMappingURL=associate_token_results.d.ts.map