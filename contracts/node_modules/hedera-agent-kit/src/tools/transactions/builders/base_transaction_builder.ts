import { AccountId, Client, TransactionId } from "@hashgraph/sdk";
import { TransactionStrategy } from "../strategies";

export class BaseTransactionBuilder<T> {
    constructor(private strategy: TransactionStrategy<T>) {}

    async signAndExecute(client: Client): Promise<T> {
        try {
            const tx = this.strategy.build();
            const txResponse = await tx.execute(client);
            const receipt = await txResponse.getReceipt(client);
            const status = receipt.status.toString();

            if (!status.includes('SUCCESS')) {
                throw new Error(`Transaction failed with status: ${status}`);
            }

            return this.strategy.formatResult(txResponse, receipt);
        } catch (error) {
            throw new Error(`Transaction failed: ${error}`);
        }
    }

    async getTxBytesString(client: Client, fromAccountId: AccountId | string): Promise<string> {
        const tx = this.strategy.build();

        if (fromAccountId) {
            const txId = TransactionId.generate(fromAccountId);
            tx.setTransactionId(txId);
        }

        const frozenTx = tx.freezeWith(client);
        const frozenTxBytes = frozenTx.toBytes();
        return Buffer.from(frozenTxBytes.buffer, frozenTxBytes.byteOffset, frozenTxBytes.byteLength).toString("base64");
    }
}