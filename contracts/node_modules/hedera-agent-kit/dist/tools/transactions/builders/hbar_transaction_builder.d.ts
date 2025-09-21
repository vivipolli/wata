import { AccountId } from "@hashgraph/sdk";
import { BaseTransactionBuilder } from "./base_transaction_builder";
import { TransferHBARResult } from "../../results";
export declare class HbarTransactionBuilder {
    static transferHbar(fromAccountId: string | AccountId, toAccountId: string | AccountId, amount: string): BaseTransactionBuilder<TransferHBARResult>;
}
//# sourceMappingURL=hbar_transaction_builder.d.ts.map