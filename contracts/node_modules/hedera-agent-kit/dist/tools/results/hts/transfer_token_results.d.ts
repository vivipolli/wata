import { BaseResult } from "../base_result";
import { AgentKitActionName } from "../../../types";
export type TransferTokenResult = {
    status: string;
    txHash: string;
};
export declare class CustodialTransferTokenResult implements BaseResult<TransferTokenResult> {
    readonly txHash: string;
    readonly status: string;
    actionName: AgentKitActionName;
    constructor(txHash: string, status: string);
    getRawResponse(): TransferTokenResult;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
export declare class NonCustodialTransferTokenResult implements BaseResult<string> {
    readonly txBytes: string;
    actionName: AgentKitActionName;
    constructor(txBytes: string);
    getRawResponse(): string;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
//# sourceMappingURL=transfer_token_results.d.ts.map