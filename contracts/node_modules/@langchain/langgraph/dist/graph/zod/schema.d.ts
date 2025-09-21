import { zodToJsonSchema as _zodToJsonSchema } from "zod-to-json-schema";
type JsonSchema = ReturnType<typeof _zodToJsonSchema>;
/**
 * Get the state schema for a graph.
 * @param graph - The graph to get the state schema for.
 * @returns The state schema for the graph.
 */
export declare function getStateTypeSchema(graph: unknown): JsonSchema | undefined;
/**
 * Get the update schema for a graph.
 * @param graph - The graph to get the update schema for.
 * @returns The update schema for the graph.
 */
export declare function getUpdateTypeSchema(graph: unknown): JsonSchema | undefined;
/**
 * Get the input schema for a graph.
 * @param graph - The graph to get the input schema for.
 * @returns The input schema for the graph.
 */
export declare function getInputTypeSchema(graph: unknown): JsonSchema | undefined;
/**
 * Get the output schema for a graph.
 * @param graph - The graph to get the output schema for.
 * @returns The output schema for the graph.
 */
export declare function getOutputTypeSchema(graph: unknown): JsonSchema | undefined;
/**
 * Get the config schema for a graph.
 * @param graph - The graph to get the config schema for.
 * @returns The config schema for the graph.
 */
export declare function getConfigTypeSchema(graph: unknown): JsonSchema | undefined;
export {};
