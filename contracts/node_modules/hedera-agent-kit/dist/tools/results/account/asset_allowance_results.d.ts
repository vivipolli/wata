import { BaseResult } from "../base_result";
import { AgentKitActionName } from "../../../types";
export type AssetAllowanceResult = {
    status: string;
    txHash: string;
};
export declare class CustodialAssetAllowanceResult implements BaseResult<AssetAllowanceResult> {
    readonly txHash: string;
    readonly status: string;
    actionName: AgentKitActionName;
    constructor(txHash: string, status: string);
    getRawResponse(): AssetAllowanceResult;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
export declare class NonCustodialAssetAllowanceResult implements BaseResult<string> {
    readonly txBytes: string;
    actionName: AgentKitActionName;
    constructor(txBytes: string);
    getRawResponse(): string;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
//# sourceMappingURL=asset_allowance_results.d.ts.map