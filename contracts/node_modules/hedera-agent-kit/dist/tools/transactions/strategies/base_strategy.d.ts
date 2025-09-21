import { Transaction, TransactionReceipt, TransactionResponse } from "@hashgraph/sdk";
export interface TransactionStrategy<T> {
    build(): Transaction;
    formatResult(txResponse: TransactionResponse, receipt: TransactionReceipt): T;
}
//# sourceMappingURL=base_strategy.d.ts.map