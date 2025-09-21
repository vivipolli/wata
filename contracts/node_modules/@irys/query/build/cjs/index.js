"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.Query = void 0;
var query_1 = require("./query");
Object.defineProperty(exports, "Query", { enumerable: true, get: function () { return query_1.Query; } });
var query_2 = require("./query");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return query_2.Query; } });
// for TS type portability
__exportStar(require("./types"), exports);
__exportStar(require("./graphql"), exports);
__exportStar(require("./queries"), exports);
//# sourceMappingURL=index.js.map