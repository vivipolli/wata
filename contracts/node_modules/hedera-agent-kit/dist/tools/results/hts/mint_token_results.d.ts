import { BaseResult } from "../base_result";
import { AgentKitActionName } from "../../../types";
export type MintTokenResult = {
    status: string;
    txHash: string;
};
export declare class CustodialMintTokenResult implements BaseResult<MintTokenResult> {
    readonly txHash: string;
    readonly status: string;
    actionName: AgentKitActionName;
    constructor(txHash: string, status: string);
    getRawResponse(): MintTokenResult;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
export declare class NonCustodialMintTokenResult implements BaseResult<string> {
    readonly txBytes: string;
    actionName: AgentKitActionName;
    constructor(txBytes: string);
    getRawResponse(): string;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
//# sourceMappingURL=mint_token_results.d.ts.map