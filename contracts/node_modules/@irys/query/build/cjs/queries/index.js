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
exports.queries = void 0;
const blocks_1 = require("./arweave/blocks");
const transactions_1 = require("./arweave/transactions");
const paymentApprovals_1 = require("./irys/paymentApprovals");
const transactions_2 = require("./irys/transactions");
// import { arweaveTransactionQuery } from "./arweave/transaction.js";
// import { arweaveBlockQuery } from "./arweave/block.js";
// map query names to queries
exports.queries = {
    "irys:transactions": transactions_2.irysTransactionsQuery,
    "arweave:transactions": transactions_1.arweaveTransactionsQuery,
    "arweave:blocks": blocks_1.arweaveBlocksQuery,
    "irys:paymentApprovals": paymentApprovals_1.irysPaymentApprovalsQuery,
    // "arweave:transaction": arweaveTransactionQuery,
    // "arweave:block": arweaveBlockQuery,
};
__exportStar(require("./arweave/blocks"), exports);
__exportStar(require("./arweave/transactions"), exports);
__exportStar(require("./irys/transactions"), exports);
__exportStar(require("./irys/paymentApprovals"), exports);
//# sourceMappingURL=index.js.map