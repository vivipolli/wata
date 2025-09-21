import { BinaryOperatorAggregate } from "../../channels/binop.js";
import { LastValue } from "../../channels/last_value.js";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const META_MAP = new WeakMap();
function isZodType(value) {
    return (typeof value === "object" &&
        value != null &&
        "_parse" in value &&
        typeof value._parse === "function");
}
/**
 * @internal
 */
export function isZodDefault(value) {
    return (isZodType(value) &&
        "removeDefault" in value &&
        typeof value.removeDefault === "function");
}
/**
 * @internal
 */
export function isAnyZodObject(value) {
    return (isZodType(value) &&
        "partial" in value &&
        typeof value.partial === "function");
}
export function withLangGraph(schema, meta) {
    if (meta.reducer && !meta.default) {
        const defaultValue = isZodDefault(schema)
            ? schema._def.defaultValue
            : undefined;
        if (defaultValue != null) {
            // eslint-disable-next-line no-param-reassign
            meta.default = defaultValue;
        }
    }
    META_MAP.set(schema, meta);
    return schema;
}
export function getMeta(schema) {
    return META_MAP.get(schema);
}
export function extendMeta(schema, update) {
    const existingMeta = getMeta(schema);
    const newMeta = update(existingMeta);
    META_MAP.set(schema, newMeta);
}
export function getChannelsFromZod(schema) {
    const channels = {};
    for (const key in schema.shape) {
        if (Object.prototype.hasOwnProperty.call(schema.shape, key)) {
            const keySchema = schema.shape[key];
            const meta = getMeta(keySchema);
            if (meta?.reducer) {
                channels[key] = new BinaryOperatorAggregate(meta.reducer.fn, meta.default);
            }
            else {
                channels[key] = new LastValue();
            }
        }
    }
    return channels;
}
//# sourceMappingURL=state.js.map