import { BaseResult } from "../base_result";
import { AgentKitActionName } from "../../../types";
export type AirdropResult = {
    status: string;
    txHash: string;
};
export declare class CustodialAirdropTokenResult implements BaseResult<AirdropResult> {
    readonly txHash: string;
    readonly status: string;
    actionName: AgentKitActionName;
    constructor(txHash: string, status: string);
    getRawResponse(): AirdropResult;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
export declare class NonCustodialAirdropTokenResult implements BaseResult<string> {
    readonly txBytes: string;
    actionName: AgentKitActionName;
    constructor(txBytes: string);
    getRawResponse(): string;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
//# sourceMappingURL=airdrop_token_results.d.ts.map