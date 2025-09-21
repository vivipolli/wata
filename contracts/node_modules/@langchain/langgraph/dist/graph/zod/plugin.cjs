"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const state_js_1 = require("./state.cjs");
const metaSymbol = Symbol.for("langgraph-zod");
if (!(metaSymbol in globalThis)) {
    globalThis[metaSymbol] = new WeakSet();
}
try {
    const cache = globalThis[metaSymbol];
    if (!cache?.has(zod_1.z.ZodType.prototype)) {
        Object.defineProperty(zod_1.z.ZodType.prototype, "langgraph", {
            get() {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const zodThis = this;
                return {
                    metadata(jsonSchemaExtra) {
                        (0, state_js_1.extendMeta)(zodThis, (meta) => ({ ...meta, jsonSchemaExtra }));
                        return zodThis;
                    },
                    reducer(fn, schema) {
                        const defaultFn = (0, state_js_1.isZodDefault)(zodThis)
                            ? // @ts-expect-error Due to `_def` being `any`
                                zodThis._def.defaultValue
                            : undefined;
                        (0, state_js_1.extendMeta)(zodThis, (meta) => ({
                            ...meta,
                            default: defaultFn ?? meta?.default,
                            reducer: { schema, fn },
                        }));
                        return zodThis;
                    },
                };
            },
        });
    }
}
catch (error) {
    throw new Error("Failed to extend Zod with LangGraph-related methods. This is most likely a bug, consider opening an issue and/or using `withLangGraph` to augment your Zod schema.", { cause: error });
}
//# sourceMappingURL=plugin.js.map