import { arweaveBlocksQuery } from "./arweave/blocks.js";
import { arweaveTransactionsQuery } from "./arweave/transactions.js";
import { irysPaymentApprovalsQuery } from "./irys/paymentApprovals.js";
import { irysTransactionsQuery } from "./irys/transactions.js";
// import { arweaveTransactionQuery } from "./arweave/transaction.js";
// import { arweaveBlockQuery } from "./arweave/block.js";
// map query names to queries
export const queries = {
    "irys:transactions": irysTransactionsQuery,
    "arweave:transactions": arweaveTransactionsQuery,
    "arweave:blocks": arweaveBlocksQuery,
    "irys:paymentApprovals": irysPaymentApprovalsQuery,
    // "arweave:transaction": arweaveTransactionQuery,
    // "arweave:block": arweaveBlockQuery,
};
export * from "./arweave/blocks.js";
export * from "./arweave/transactions.js";
export * from "./irys/transactions.js";
export * from "./irys/paymentApprovals.js";
//# sourceMappingURL=index.js.map