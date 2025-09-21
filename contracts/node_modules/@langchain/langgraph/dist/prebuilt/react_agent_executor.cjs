"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReactAgentAnnotation = void 0;
exports._shouldBindTools = _shouldBindTools;
exports._getModel = _getModel;
exports.createReactAgent = createReactAgent;
const messages_1 = require("@langchain/core/messages");
const runnables_1 = require("@langchain/core/runnables");
const index_js_1 = require("../graph/index.cjs");
const tool_node_js_1 = require("./tool_node.cjs");
const annotation_js_1 = require("../graph/annotation.cjs");
const message_js_1 = require("../graph/message.cjs");
const constants_js_1 = require("../constants.cjs");
const agentName_js_1 = require("./agentName.cjs");
function _convertMessageModifierToPrompt(messageModifier) {
    // Handle string or SystemMessage
    if (typeof messageModifier === "string" ||
        ((0, messages_1.isBaseMessage)(messageModifier) && messageModifier._getType() === "system")) {
        return messageModifier;
    }
    // Handle callable function
    if (typeof messageModifier === "function") {
        return async (state) => messageModifier(state.messages);
    }
    // Handle Runnable
    if (runnables_1.Runnable.isRunnable(messageModifier)) {
        return runnables_1.RunnableLambda.from((state) => state.messages).pipe(messageModifier);
    }
    throw new Error(`Unexpected type for messageModifier: ${typeof messageModifier}`);
}
const PROMPT_RUNNABLE_NAME = "prompt";
function _getPromptRunnable(prompt) {
    let promptRunnable;
    if (prompt == null) {
        promptRunnable = runnables_1.RunnableLambda.from((state) => state.messages).withConfig({ runName: PROMPT_RUNNABLE_NAME });
    }
    else if (typeof prompt === "string") {
        const systemMessage = new messages_1.SystemMessage(prompt);
        promptRunnable = runnables_1.RunnableLambda.from((state) => {
            return [systemMessage, ...(state.messages ?? [])];
        }).withConfig({ runName: PROMPT_RUNNABLE_NAME });
    }
    else if ((0, messages_1.isBaseMessage)(prompt) && prompt._getType() === "system") {
        promptRunnable = runnables_1.RunnableLambda.from((state) => [prompt, ...state.messages]).withConfig({ runName: PROMPT_RUNNABLE_NAME });
    }
    else if (typeof prompt === "function") {
        promptRunnable = runnables_1.RunnableLambda.from(prompt).withConfig({
            runName: PROMPT_RUNNABLE_NAME,
        });
    }
    else if (runnables_1.Runnable.isRunnable(prompt)) {
        promptRunnable = prompt;
    }
    else {
        throw new Error(`Got unexpected type for 'prompt': ${typeof prompt}`);
    }
    return promptRunnable;
}
function _getPrompt(prompt, stateModifier, messageModifier) {
    // Check if multiple modifiers exist
    const definedCount = [prompt, stateModifier, messageModifier].filter((x) => x != null).length;
    if (definedCount > 1) {
        throw new Error("Expected only one of prompt, stateModifier, or messageModifier, got multiple values");
    }
    let finalPrompt = prompt;
    if (stateModifier != null) {
        finalPrompt = stateModifier;
    }
    else if (messageModifier != null) {
        finalPrompt = _convertMessageModifierToPrompt(messageModifier);
    }
    return _getPromptRunnable(finalPrompt);
}
function _isBaseChatModel(model) {
    return ("invoke" in model &&
        typeof model.invoke === "function" &&
        "_modelType" in model);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _isConfigurableModel(model) {
    return ("_queuedMethodOperations" in model &&
        "_model" in model &&
        typeof model._model === "function");
}
async function _shouldBindTools(llm, tools) {
    // If model is a RunnableSequence, find a RunnableBinding or BaseChatModel in its steps
    let model = llm;
    if (runnables_1.RunnableSequence.isRunnableSequence(model)) {
        model =
            model.steps.find((step) => runnables_1.RunnableBinding.isRunnableBinding(step) ||
                _isBaseChatModel(step) ||
                _isConfigurableModel(step)) || model;
    }
    if (_isConfigurableModel(model)) {
        model = await model._model();
    }
    // If not a RunnableBinding, we should bind tools
    if (!runnables_1.RunnableBinding.isRunnableBinding(model)) {
        return true;
    }
    // If no tools in kwargs, we should bind tools
    if (!model.kwargs ||
        typeof model.kwargs !== "object" ||
        !("tools" in model.kwargs)) {
        return true;
    }
    let boundTools = model.kwargs.tools;
    // google-style
    if (boundTools.length === 1 && "functionDeclarations" in boundTools[0]) {
        boundTools = boundTools[0].functionDeclarations;
    }
    // Check if tools count matches
    if (tools.length !== boundTools.length) {
        throw new Error("Number of tools in the model.bindTools() and tools passed to createReactAgent must match");
    }
    const toolNames = new Set(tools.map((tool) => tool.name));
    const boundToolNames = new Set();
    for (const boundTool of boundTools) {
        let boundToolName;
        // OpenAI-style tool
        if ("type" in boundTool && boundTool.type === "function") {
            boundToolName = boundTool.function.name;
        }
        // Anthropic- or Google-style tool
        else if ("name" in boundTool) {
            boundToolName = boundTool.name;
        }
        // Bedrock-style tool
        else if ("toolSpec" in boundTool && "name" in boundTool.toolSpec) {
            boundToolName = boundTool.toolSpec.name;
        }
        // unknown tool type so we'll ignore it
        else {
            continue;
        }
        if (boundToolName) {
            boundToolNames.add(boundToolName);
        }
    }
    const missingTools = [...toolNames].filter((x) => !boundToolNames.has(x));
    if (missingTools.length > 0) {
        throw new Error(`Missing tools '${missingTools}' in the model.bindTools().` +
            `Tools in the model.bindTools() must match the tools passed to createReactAgent.`);
    }
    return false;
}
async function _getModel(llm) {
    // If model is a RunnableSequence, find a RunnableBinding or BaseChatModel in its steps
    let model = llm;
    if (runnables_1.RunnableSequence.isRunnableSequence(model)) {
        model =
            model.steps.find((step) => runnables_1.RunnableBinding.isRunnableBinding(step) ||
                _isBaseChatModel(step) ||
                _isConfigurableModel(step)) || model;
    }
    if (_isConfigurableModel(model)) {
        model = await model._model();
    }
    // Get the underlying model from a RunnableBinding
    if (runnables_1.RunnableBinding.isRunnableBinding(model)) {
        model = model.bound;
    }
    if (!_isBaseChatModel(model)) {
        throw new Error(`Expected \`llm\` to be a ChatModel or RunnableBinding (e.g. llm.bind_tools(...)) with invoke() and generate() methods, got ${model.constructor.name}`);
    }
    return model;
}
const createReactAgentAnnotation = () => annotation_js_1.Annotation.Root({
    messages: (0, annotation_js_1.Annotation)({
        reducer: message_js_1.messagesStateReducer,
        default: () => [],
    }),
    structuredResponse: (annotation_js_1.Annotation),
});
exports.createReactAgentAnnotation = createReactAgentAnnotation;
/**
 * Creates a StateGraph agent that relies on a chat model utilizing tool calling.
 *
 * @example
 * ```ts
 * import { ChatOpenAI } from "@langchain/openai";
 * import { tool } from "@langchain/core/tools";
 * import { z } from "zod";
 * import { createReactAgent } from "@langchain/langgraph/prebuilt";
 *
 * const model = new ChatOpenAI({
 *   model: "gpt-4o",
 * });
 *
 * const getWeather = tool((input) => {
 *   if (["sf", "san francisco"].includes(input.location.toLowerCase())) {
 *     return "It's 60 degrees and foggy.";
 *   } else {
 *     return "It's 90 degrees and sunny.";
 *   }
 * }, {
 *   name: "get_weather",
 *   description: "Call to get the current weather.",
 *   schema: z.object({
 *     location: z.string().describe("Location to get the weather for."),
 *   })
 * })
 *
 * const agent = createReactAgent({ llm: model, tools: [getWeather] });
 *
 * const inputs = {
 *   messages: [{ role: "user", content: "what is the weather in SF?" }],
 * };
 *
 * const stream = await agent.stream(inputs, { streamMode: "values" });
 *
 * for await (const { messages } of stream) {
 *   console.log(messages);
 * }
 * // Returns the messages in the state at each step of execution
 * ```
 */
function createReactAgent(params) {
    const { llm, tools, messageModifier, stateModifier, prompt, stateSchema, checkpointSaver, checkpointer, interruptBefore, interruptAfter, store, responseFormat, name, includeAgentName, } = params;
    let toolClasses;
    let toolNode;
    if (!Array.isArray(tools)) {
        toolClasses = tools.tools;
        toolNode = tools;
    }
    else {
        toolClasses = tools;
        toolNode = new tool_node_js_1.ToolNode(tools);
    }
    let cachedModelRunnable = null;
    const getModelRunnable = async (llm) => {
        if (cachedModelRunnable) {
            return cachedModelRunnable;
        }
        let modelWithTools;
        if (await _shouldBindTools(llm, toolClasses)) {
            if (!("bindTools" in llm) || typeof llm.bindTools !== "function") {
                throw new Error(`llm ${llm} must define bindTools method.`);
            }
            modelWithTools = llm.bindTools(toolClasses);
        }
        else {
            modelWithTools = llm;
        }
        const promptRunnable = _getPrompt(prompt, stateModifier, messageModifier);
        const modelRunnable = includeAgentName === "inline"
            ? promptRunnable.pipe((0, agentName_js_1.withAgentName)(modelWithTools, includeAgentName))
            : promptRunnable.pipe(modelWithTools);
        cachedModelRunnable = modelRunnable;
        return modelRunnable;
    };
    // If any of the tools are configured to return_directly after running,
    // our graph needs to check if these were called
    const shouldReturnDirect = new Set(toolClasses
        .filter((tool) => "returnDirect" in tool && tool.returnDirect)
        .map((tool) => tool.name));
    const shouldContinue = (state) => {
        const { messages } = state;
        const lastMessage = messages[messages.length - 1];
        if ((0, messages_1.isAIMessage)(lastMessage) &&
            (!lastMessage.tool_calls || lastMessage.tool_calls.length === 0)) {
            return responseFormat != null ? "generate_structured_response" : constants_js_1.END;
        }
        else {
            return "continue";
        }
    };
    const generateStructuredResponse = async (state, config) => {
        if (responseFormat == null) {
            throw new Error("Attempted to generate structured output with no passed response schema. Please contact us for help.");
        }
        const messages = [...state.messages];
        let modelWithStructuredOutput;
        if (typeof responseFormat === "object" &&
            "prompt" in responseFormat &&
            "schema" in responseFormat) {
            const { prompt, schema } = responseFormat;
            modelWithStructuredOutput = (await _getModel(llm)).withStructuredOutput(schema);
            messages.unshift(new messages_1.SystemMessage({ content: prompt }));
        }
        else {
            modelWithStructuredOutput = (await _getModel(llm)).withStructuredOutput(responseFormat);
        }
        const response = await modelWithStructuredOutput.invoke(messages, config);
        return { structuredResponse: response };
    };
    const callModel = async (state, config) => {
        // NOTE: we're dynamically creating the model runnable here
        // to ensure that we can validate ConfigurableModel properly
        const modelRunnable = await getModelRunnable(llm);
        // TODO: Auto-promote streaming.
        const response = (await modelRunnable.invoke(state, config));
        // add agent name to the AIMessage
        // TODO: figure out if we can avoid mutating the message directly
        response.name = name;
        response.lc_kwargs.name = name;
        return { messages: [response] };
    };
    const workflow = new index_js_1.StateGraph(stateSchema ?? (0, exports.createReactAgentAnnotation)())
        .addNode("agent", callModel)
        .addNode("tools", toolNode)
        .addEdge(constants_js_1.START, "agent");
    if (responseFormat !== undefined) {
        workflow
            .addNode("generate_structured_response", generateStructuredResponse)
            .addEdge("generate_structured_response", constants_js_1.END)
            .addConditionalEdges("agent", shouldContinue, {
            continue: "tools",
            [constants_js_1.END]: constants_js_1.END,
            generate_structured_response: "generate_structured_response",
        });
    }
    else {
        workflow.addConditionalEdges("agent", shouldContinue, {
            continue: "tools",
            [constants_js_1.END]: constants_js_1.END,
        });
    }
    const routeToolResponses = (state) => {
        // Check the last consecutive tool calls
        for (let i = state.messages.length - 1; i >= 0; i -= 1) {
            const message = state.messages[i];
            if (!(0, messages_1.isToolMessage)(message)) {
                break;
            }
            // Check if this tool is configured to return directly
            if (message.name !== undefined && shouldReturnDirect.has(message.name)) {
                return constants_js_1.END;
            }
        }
        return "agent";
    };
    if (shouldReturnDirect.size > 0) {
        workflow.addConditionalEdges("tools", routeToolResponses, ["agent", constants_js_1.END]);
    }
    else {
        workflow.addEdge("tools", "agent");
    }
    return workflow.compile({
        checkpointer: checkpointer ?? checkpointSaver,
        interruptBefore,
        interruptAfter,
        store,
        name,
    });
}
//# sourceMappingURL=react_agent_executor.js.map