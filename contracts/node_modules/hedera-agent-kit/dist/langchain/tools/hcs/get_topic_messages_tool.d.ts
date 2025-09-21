import { Tool } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";
export declare class HederaGetTopicMessagesTool extends Tool {
    private hederaKit;
    name: string;
    description: string;
    constructor(hederaKit: HederaAgentKit);
    protected _call(input: string): Promise<string>;
}
//# sourceMappingURL=get_topic_messages_tool.d.ts.map