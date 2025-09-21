import type { z } from "zod";
import { BaseChannel } from "../../channels/base.js";
export interface Meta<ValueType, UpdateType = ValueType> {
    jsonSchemaExtra?: {
        langgraph_nodes?: string[];
        langgraph_type?: "prompt";
        [key: string]: unknown;
    };
    reducer?: {
        schema?: z.ZodType<UpdateType>;
        fn: (a: ValueType, b: UpdateType) => ValueType;
    };
    default?: () => ValueType;
}
export type AnyZodObject = z.ZodObject<z.ZodRawShape>;
/**
 * @internal
 */
export declare function isZodDefault(value: unknown): value is z.ZodDefault<z.ZodTypeAny>;
/**
 * @internal
 */
export declare function isAnyZodObject(value: unknown): value is AnyZodObject;
export declare function withLangGraph<ValueType, UpdateType = ValueType>(schema: z.ZodType<ValueType | undefined>, meta: Meta<ValueType, UpdateType>): z.ZodType<ValueType, z.ZodTypeDef, UpdateType>;
export declare function getMeta<ValueType, UpdateType = ValueType>(schema: z.ZodType<ValueType>): Meta<ValueType, UpdateType> | undefined;
export declare function extendMeta<ValueType, UpdateType = ValueType>(schema: z.ZodType<ValueType>, update: (meta: Meta<ValueType, UpdateType> | undefined) => Meta<ValueType, UpdateType>): void;
export type ZodToStateDefinition<T extends AnyZodObject> = {
    [key in keyof T["shape"]]: T["shape"][key] extends z.ZodType<infer V, z.ZodTypeDef, infer U> ? BaseChannel<V, U> : never;
};
export declare function getChannelsFromZod<T extends z.ZodRawShape>(schema: z.ZodObject<T>): ZodToStateDefinition<z.ZodObject<T>>;
