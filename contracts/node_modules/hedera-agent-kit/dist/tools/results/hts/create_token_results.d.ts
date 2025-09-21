import { BaseResult } from "../base_result";
import { TokenId } from "@hashgraph/sdk";
import { AgentKitActionName } from "../../../types";
export type CreateTokenResult = {
    status: string;
    txHash: string;
    tokenId: TokenId;
};
export declare class CustodialCreateTokenResult implements BaseResult<CreateTokenResult> {
    readonly txHash: string;
    readonly status: string;
    readonly tokenId: TokenId;
    actionName: AgentKitActionName;
    constructor(txHash: string, status: string, tokenId: TokenId);
    getRawResponse(): CreateTokenResult;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
export declare class NonCustodialCreateTokenResult implements BaseResult<string> {
    readonly txBytes: string;
    actionName: AgentKitActionName;
    constructor(txBytes: string);
    getRawResponse(): string;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
//# sourceMappingURL=create_token_results.d.ts.map