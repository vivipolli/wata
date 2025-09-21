"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTransactionBuilder = void 0;
const sdk_1 = require("@hashgraph/sdk");
class BaseTransactionBuilder {
    constructor(strategy) {
        this.strategy = strategy;
    }
    async signAndExecute(client) {
        try {
            const tx = this.strategy.build();
            const txResponse = await tx.execute(client);
            const receipt = await txResponse.getReceipt(client);
            const status = receipt.status.toString();
            if (!status.includes('SUCCESS')) {
                throw new Error(`Transaction failed with status: ${status}`);
            }
            return this.strategy.formatResult(txResponse, receipt);
        }
        catch (error) {
            throw new Error(`Transaction failed: ${error}`);
        }
    }
    async getTxBytesString(client, fromAccountId) {
        const tx = this.strategy.build();
        if (fromAccountId) {
            const txId = sdk_1.TransactionId.generate(fromAccountId);
            tx.setTransactionId(txId);
        }
        const frozenTx = tx.freezeWith(client);
        const frozenTxBytes = frozenTx.toBytes();
        return Buffer.from(frozenTxBytes.buffer, frozenTxBytes.byteOffset, frozenTxBytes.byteLength).toString("base64");
    }
}
exports.BaseTransactionBuilder = BaseTransactionBuilder;
//# sourceMappingURL=base_transaction_builder.js.map