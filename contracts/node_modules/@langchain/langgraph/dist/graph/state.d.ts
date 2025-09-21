import { RunnableLike } from "@langchain/core/runnables";
import { All, BaseCheckpointSaver, BaseStore } from "@langchain/langgraph-checkpoint";
import { BaseChannel } from "../channels/base.js";
import { CompiledGraph, Graph, Branch, AddNodeOptions, NodeSpec } from "./graph.js";
import { END, START } from "../constants.js";
import { AnnotationRoot, SingleReducer, StateDefinition, StateType, UpdateType } from "./annotation.js";
import type { RetryPolicy } from "../pregel/utils/index.js";
import { ManagedValueSpec } from "../managed/base.js";
import type { LangGraphRunnableConfig } from "../pregel/runnable_types.js";
import { AnyZodObject, ZodToStateDefinition } from "./zod/state.js";
export type ChannelReducers<Channels extends object> = {
    [K in keyof Channels]: SingleReducer<Channels[K], any>;
};
export interface StateGraphArgs<Channels extends object | unknown> {
    channels: Channels extends object ? Channels extends unknown[] ? ChannelReducers<{
        __root__: Channels;
    }> : ChannelReducers<Channels> : ChannelReducers<{
        __root__: Channels;
    }>;
}
export type StateGraphNodeSpec<RunInput, RunOutput> = NodeSpec<RunInput, RunOutput> & {
    input?: StateDefinition;
    retryPolicy?: RetryPolicy;
};
export type StateGraphAddNodeOptions = {
    retryPolicy?: RetryPolicy;
    input?: AnnotationRoot<any> | AnyZodObject;
} & AddNodeOptions;
export type StateGraphArgsWithStateSchema<SD extends StateDefinition, I extends StateDefinition, O extends StateDefinition> = {
    stateSchema: AnnotationRoot<SD>;
    input?: AnnotationRoot<I>;
    output?: AnnotationRoot<O>;
};
export type StateGraphArgsWithInputOutputSchemas<SD extends StateDefinition, O extends StateDefinition = SD> = {
    input: AnnotationRoot<SD>;
    output: AnnotationRoot<O>;
};
type ZodStateGraphArgsWithStateSchema<SD extends AnyZodObject, I extends SDZod, O extends SDZod> = {
    state: SD;
    input?: I;
    output?: O;
};
type SDZod = StateDefinition | AnyZodObject;
type ToStateDefinition<T> = T extends AnyZodObject ? ZodToStateDefinition<T> : T extends StateDefinition ? T : never;
type NodeAction<S, U, C extends SDZod> = RunnableLike<S, U extends object ? U & Record<string, any> : U, // eslint-disable-line @typescript-eslint/no-explicit-any
LangGraphRunnableConfig<StateType<ToStateDefinition<C>>>>;
/**
 * A graph whose nodes communicate by reading and writing to a shared state.
 * Each node takes a defined `State` as input and returns a `Partial<State>`.
 *
 * Each state key can optionally be annotated with a reducer function that
 * will be used to aggregate the values of that key received from multiple nodes.
 * The signature of a reducer function is (left: Value, right: UpdateValue) => Value.
 *
 * See {@link Annotation} for more on defining state.
 *
 * After adding nodes and edges to your graph, you must call `.compile()` on it before
 * you can use it.
 *
 * @example
 * ```ts
 * import {
 *   type BaseMessage,
 *   AIMessage,
 *   HumanMessage,
 * } from "@langchain/core/messages";
 * import { StateGraph, Annotation } from "@langchain/langgraph";
 *
 * // Define a state with a single key named "messages" that will
 * // combine a returned BaseMessage or arrays of BaseMessages
 * const StateAnnotation = Annotation.Root({
 *   sentiment: Annotation<string>,
 *   messages: Annotation<BaseMessage[]>({
 *     reducer: (left: BaseMessage[], right: BaseMessage | BaseMessage[]) => {
 *       if (Array.isArray(right)) {
 *         return left.concat(right);
 *       }
 *       return left.concat([right]);
 *     },
 *     default: () => [],
 *   }),
 * });
 *
 * const graphBuilder = new StateGraph(StateAnnotation);
 *
 * // A node in the graph that returns an object with a "messages" key
 * // will update the state by combining the existing value with the returned one.
 * const myNode = (state: typeof StateAnnotation.State) => {
 *   return {
 *     messages: [new AIMessage("Some new response")],
 *     sentiment: "positive",
 *   };
 * };
 *
 * const graph = graphBuilder
 *   .addNode("myNode", myNode)
 *   .addEdge("__start__", "myNode")
 *   .addEdge("myNode", "__end__")
 *   .compile();
 *
 * await graph.invoke({ messages: [new HumanMessage("how are you?")] });
 *
 * // {
 * //   messages: [HumanMessage("how are you?"), AIMessage("Some new response")],
 * //   sentiment: "positive",
 * // }
 * ```
 */
export declare class StateGraph<SD extends SDZod | unknown, S = SD extends SDZod ? StateType<ToStateDefinition<SD>> : SD, U = SD extends SDZod ? UpdateType<ToStateDefinition<SD>> : Partial<S>, N extends string = typeof START, I extends SDZod = SD extends SDZod ? ToStateDefinition<SD> : StateDefinition, O extends SDZod = SD extends SDZod ? ToStateDefinition<SD> : StateDefinition, C extends SDZod = StateDefinition> extends Graph<N, S, U, StateGraphNodeSpec<S, U>, ToStateDefinition<C>> {
    channels: Record<string, BaseChannel | ManagedValueSpec>;
    waitingEdges: Set<[N[], N]>;
    /** @internal */
    _schemaDefinition: StateDefinition;
    /** @internal */
    _schemaRuntimeDefinition: AnyZodObject | undefined;
    /** @internal */
    _inputDefinition: I;
    /** @internal */
    _inputRuntimeDefinition: AnyZodObject | undefined;
    /** @internal */
    _outputDefinition: O;
    /** @internal */
    _outputRuntimeDefinition: AnyZodObject | undefined;
    /**
     * Map schemas to managed values
     * @internal
     */
    _schemaDefinitions: Map<any, any>;
    /** @internal Used only for typing. */
    _configSchema: ToStateDefinition<C> | undefined;
    /** @internal */
    _configRuntimeSchema: AnyZodObject | undefined;
    constructor(fields: SD extends StateDefinition ? StateGraphArgsWithInputOutputSchemas<SD, ToStateDefinition<O>> : never, configSchema?: C | AnnotationRoot<ToStateDefinition<C>>);
    constructor(fields: SD extends StateDefinition ? SD | AnnotationRoot<SD> | StateGraphArgs<S> | StateGraphArgsWithStateSchema<SD, ToStateDefinition<I>, ToStateDefinition<O>> : StateGraphArgs<S>, configSchema?: C | AnnotationRoot<ToStateDefinition<C>>);
    constructor(fields: SD extends AnyZodObject ? SD | ZodStateGraphArgsWithStateSchema<SD, I, O> : never, configSchema?: C | AnnotationRoot<ToStateDefinition<C>>);
    get allEdges(): Set<[string, string]>;
    _addSchema(stateDefinition: SDZod): void;
    addNode<K extends string>(nodes: Record<K, NodeAction<S, U, C>> | [
        key: K,
        action: NodeAction<S, U, C>,
        options?: StateGraphAddNodeOptions
    ][]): StateGraph<SD, S, U, N | K, I, O, C>;
    addNode<K extends string, NodeInput = S>(key: K, action: NodeAction<NodeInput, U, C>, options?: StateGraphAddNodeOptions): StateGraph<SD, S, U, N | K, I, O, C>;
    addEdge(startKey: typeof START | N | N[], endKey: N | typeof END): this;
    addSequence<K extends string>(nodes: [
        key: K,
        action: NodeAction<S, U, C>,
        options?: StateGraphAddNodeOptions
    ][]): StateGraph<SD, S, U, N | K, I, O, C>;
    addSequence<K extends string>(nodes: Record<K, NodeAction<S, U, C>>): StateGraph<SD, S, U, N | K, I, O, C>;
    compile({ checkpointer, store, interruptBefore, interruptAfter, name, }?: {
        checkpointer?: BaseCheckpointSaver | false;
        store?: BaseStore;
        interruptBefore?: N[] | All;
        interruptAfter?: N[] | All;
        name?: string;
    }): CompiledStateGraph<S, U, N, I, O, C>;
}
/**
 * Final result from building and compiling a {@link StateGraph}.
 * Should not be instantiated directly, only using the StateGraph `.compile()`
 * instance method.
 */
export declare class CompiledStateGraph<S, U, N extends string = typeof START, I extends SDZod = StateDefinition, O extends SDZod = StateDefinition, C extends SDZod = StateDefinition> extends CompiledGraph<N, S, U, StateType<ToStateDefinition<C>>, UpdateType<ToStateDefinition<I>>, StateType<ToStateDefinition<O>>> {
    builder: StateGraph<unknown, S, U, N, I, O, C>;
    attachNode(key: typeof START, node?: never): void;
    attachNode(key: N, node: StateGraphNodeSpec<S, U>): void;
    attachEdge(start: N | N[] | "__start__", end: N | "__end__"): void;
    attachBranch(start: N | typeof START, _: string, branch: Branch<S, N>, options?: {
        withReader?: boolean;
    }): void;
    protected _validateInput(input: UpdateType<ToStateDefinition<I>>): Promise<UpdateType<ToStateDefinition<I>>>;
    protected _validateConfigurable(config: Partial<LangGraphRunnableConfig["configurable"]>): Promise<LangGraphRunnableConfig["configurable"]>;
}
export {};
