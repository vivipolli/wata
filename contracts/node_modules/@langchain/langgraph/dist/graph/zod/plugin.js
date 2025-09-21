import { z } from "zod";
import { extendMeta, isZodDefault } from "./state.js";
const metaSymbol = Symbol.for("langgraph-zod");
if (!(metaSymbol in globalThis)) {
    globalThis[metaSymbol] = new WeakSet();
}
try {
    const cache = globalThis[metaSymbol];
    if (!cache?.has(z.ZodType.prototype)) {
        Object.defineProperty(z.ZodType.prototype, "langgraph", {
            get() {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const zodThis = this;
                return {
                    metadata(jsonSchemaExtra) {
                        extendMeta(zodThis, (meta) => ({ ...meta, jsonSchemaExtra }));
                        return zodThis;
                    },
                    reducer(fn, schema) {
                        const defaultFn = isZodDefault(zodThis)
                            ? // @ts-expect-error Due to `_def` being `any`
                                zodThis._def.defaultValue
                            : undefined;
                        extendMeta(zodThis, (meta) => ({
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