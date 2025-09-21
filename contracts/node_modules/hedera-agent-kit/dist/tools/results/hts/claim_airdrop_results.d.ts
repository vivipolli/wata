import { BaseResult } from "../base_result";
import { AgentKitActionName } from "../../../types";
export type ClaimAirdropResult = {
    status: string;
    txHash: string;
};
export declare class CustodialClaimAirdropResult implements BaseResult<ClaimAirdropResult> {
    readonly txHash: string;
    readonly status: string;
    actionName: AgentKitActionName;
    constructor(txHash: string, status: string);
    getRawResponse(): ClaimAirdropResult;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
export declare class NonCustodialClaimAirdropResult implements BaseResult<string> {
    readonly txBytes: string;
    actionName: AgentKitActionName;
    constructor(txBytes: string);
    getRawResponse(): string;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
//# sourceMappingURL=claim_airdrop_results.d.ts.map