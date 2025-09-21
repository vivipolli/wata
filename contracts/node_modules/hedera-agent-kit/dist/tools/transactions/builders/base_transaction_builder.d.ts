import { AccountId, Client } from "@hashgraph/sdk";
import { TransactionStrategy } from "../strategies";
export declare class BaseTransactionBuilder<T> {
    private strategy;
    constructor(strategy: TransactionStrategy<T>);
    signAndExecute(client: Client): Promise<T>;
    getTxBytesString(client: Client, fromAccountId: AccountId | string): Promise<string>;
}
//# sourceMappingURL=base_transaction_builder.d.ts.map