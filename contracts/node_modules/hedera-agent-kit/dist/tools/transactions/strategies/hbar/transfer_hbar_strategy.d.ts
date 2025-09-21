import { AccountId, Transaction, TransactionReceipt, TransactionResponse } from "@hashgraph/sdk";
import { TransactionStrategy } from "../base_strategy";
import { TransferHBARResult } from "../../../results";
export declare class TransferHbarStrategy implements TransactionStrategy<TransferHBARResult> {
    private fromAccountId;
    private toAccountId;
    private amount;
    constructor(fromAccountId: string | AccountId, toAccountId: string | AccountId, amount: string);
    build(): Transaction;
    formatResult(txResponse: TransactionResponse, receipt: TransactionReceipt): TransferHBARResult;
}
//# sourceMappingURL=transfer_hbar_strategy.d.ts.map