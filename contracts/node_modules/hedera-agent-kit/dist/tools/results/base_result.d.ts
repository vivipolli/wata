import { AgentKitActionName } from "../../types";
export interface BaseResult<T> {
    actionName: string;
    getStringifiedResponse(): string;
    getRawResponse(): T;
    getName(): AgentKitActionName;
}
//# sourceMappingURL=base_result.d.ts.map