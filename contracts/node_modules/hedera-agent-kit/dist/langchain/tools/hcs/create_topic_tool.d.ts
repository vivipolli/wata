import { Tool, ToolRunnableConfig } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
export declare class HederaCreateTopicTool extends Tool {
    private hederaKit;
    name: string;
    description: string;
    constructor(hederaKit: HederaAgentKit);
    protected _call(input: any, _runManager?: CallbackManagerForToolRun, config?: ToolRunnableConfig): Promise<string>;
}
//# sourceMappingURL=create_topic_tool.d.ts.map