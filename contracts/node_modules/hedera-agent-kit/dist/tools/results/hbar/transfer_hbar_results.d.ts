import { BaseResult } from "../base_result";
import { AgentKitActionName } from "../../../types";
export type TransferHBARResult = {
    status: string;
    txHash: string;
};
export declare class CustodialTransferHbarResult implements BaseResult<TransferHBARResult> {
    readonly txHash: string;
    readonly status: string;
    actionName: AgentKitActionName;
    constructor(txHash: string, status: string);
    getRawResponse(): TransferHBARResult;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
export declare class NonCustodialTransferHbarResult implements BaseResult<string> {
    readonly txBytes: string;
    actionName: AgentKitActionName;
    constructor(txBytes: string);
    getRawResponse(): string;
    getStringifiedResponse(): string;
    getName(): AgentKitActionName;
}
//# sourceMappingURL=transfer_hbar_results.d.ts.map