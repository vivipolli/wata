import { BaseResult } from "../base_result";
import { AgentKitActionName } from "../../../types";
export type MintNFTResult = {
    status: string;
    txHash: string;
};
export declare class CustodialMintNFTResult implements BaseResult<MintNFTResult> {
    readonly txHash: string;
    readonly status: string;
    actionName: AgentKitActionName;
    constructor(txHash: string, status: string);
    getRawResponse(): MintNFTResult;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
export declare class NonCustodialMintNFTResult implements BaseResult<string> {
    readonly txBytes: string;
    actionName: AgentKitActionName;
    constructor(txBytes: string);
    getRawResponse(): string;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
//# sourceMappingURL=mint_nft_results.d.ts.map