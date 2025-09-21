"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isZodDefault = isZodDefault;
exports.isAnyZodObject = isAnyZodObject;
exports.withLangGraph = withLangGraph;
exports.getMeta = getMeta;
exports.extendMeta = extendMeta;
exports.getChannelsFromZod = getChannelsFromZod;
const binop_js_1 = require("../../channels/binop.cjs");
const last_value_js_1 = require("../../channels/last_value.cjs");
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
function isZodDefault(value) {
    return (isZodType(value) &&
        "removeDefault" in value &&
        typeof value.removeDefault === "function");
}
/**
 * @internal
 */
function isAnyZodObject(value) {
    return (isZodType(value) &&
        "partial" in value &&
        typeof value.partial === "function");
}
function withLangGraph(schema, meta) {
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
function getMeta(schema) {
    return META_MAP.get(schema);
}
function extendMeta(schema, update) {
    const existingMeta = getMeta(schema);
    const newMeta = update(existingMeta);
    META_MAP.set(schema, newMeta);
}
function getChannelsFromZod(schema) {
    const channels = {};
    for (const key in schema.shape) {
        if (Object.prototype.hasOwnProperty.call(schema.shape, key)) {
            const keySchema = schema.shape[key];
            const meta = getMeta(keySchema);
            if (meta?.reducer) {
                channels[key] = new binop_js_1.BinaryOperatorAggregate(meta.reducer.fn, meta.default);
            }
            else {
                channels[key] = new last_value_js_1.LastValue();
            }
        }
    }
    return channels;
}
//# sourceMappingURL=state.js.map