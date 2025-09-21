import { StateType } from "@langchain/langgraph";
export declare class LangchainAgent {
    private agent;
    private config;
    private constructor();
    static create(): Promise<LangchainAgent>;
    sendPrompt(prompt: {
        text: string;
    }, isCustodial?: boolean): Promise<StateType<any>>;
}
//# sourceMappingURL=langchainAgent.d.ts.map