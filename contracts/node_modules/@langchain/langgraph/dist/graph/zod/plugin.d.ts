import { z } from "zod";
interface ZodLangGraphTypes<T extends z.ZodTypeAny, Output> {
    reducer<Input = z.output<T>>(transform: (a: Output, arg: Input) => Output, options?: z.ZodType<Input>): z.ZodType<Output, z.ZodEffectsDef<T>, Input>;
    metadata(payload: {
        langgraph_nodes?: string[];
        langgraph_type?: "prompt";
        [key: string]: unknown;
    }): T;
}
declare module "zod" {
    interface ZodType<Output> {
        langgraph: ZodLangGraphTypes<this, Output>;
    }
}
export {};
