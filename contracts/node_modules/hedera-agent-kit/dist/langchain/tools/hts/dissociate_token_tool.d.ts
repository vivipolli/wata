import { Tool, ToolRunnableConfig } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
export declare class HederaDissociateTokenTool extends Tool {
    private hederaKit;
    name: string;
    description: string;
    constructor(hederaKit: HederaAgentKit);
    protected _call(input: any, _runManager?: CallbackManagerForToolRun, config?: ToolRunnableConfig): Promise<string>;
}
//# sourceMappingURL=dissociate_token_tool.d.ts.map