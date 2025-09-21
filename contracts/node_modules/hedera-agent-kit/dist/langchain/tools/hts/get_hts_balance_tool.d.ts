import { Tool } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";
export declare class HederaGetHtsBalanceTool extends Tool {
    private hederaKit;
    name: string;
    description: string;
    constructor(hederaKit: HederaAgentKit);
    protected _call(input: string): Promise<string>;
}
//# sourceMappingURL=get_hts_balance_tool.d.ts.map