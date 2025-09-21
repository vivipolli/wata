import * as bundlesSrc from "./src/index.js";
import * as stream from "./src/stream/index.js";
const expObj = { ...bundlesSrc, stream };
globalThis.bundles ??= expObj;
export * from "./src/index.js";
export * from "./src/stream/index.js";
export default expObj;
export const bundles = expObj;
//# sourceMappingURL=webIndex.js.map