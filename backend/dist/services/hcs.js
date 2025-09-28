import { Client, TopicCreateTransaction, TopicMessageSubmitTransaction, PrivateKey, AccountId, Hbar, } from '@hashgraph/sdk';
import { config } from 'dotenv';
config();
export class HederaConsensusService {
    client;
    topicId = null;
    operatorId;
    operatorKey;
    constructor() {
        this.operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
        const privateKeyString = process.env.HEDERA_PRIVATE_KEY;
        if (privateKeyString.startsWith('0x')) {
            this.operatorKey = PrivateKey.fromString(privateKeyString.slice(2));
        }
        else {
            this.operatorKey = PrivateKey.fromString(privateKeyString);
        }
        this.client = Client.forTestnet();
        this.client.setOperator(this.operatorId, this.operatorKey);
    }
    async initialize() {
        try {
            console.log('HCS service initialized successfully (topic will be created on first use)');
        }
        catch (error) {
            console.error('Failed to initialize HCS:', error);
            throw error;
        }
    }
    async publishAuditRecord(record) {
        if (!this.topicId) {
            try {
                const createTopicTx = new TopicCreateTransaction()
                    .setTopicMemo('WATA Audit Records')
                    .setMaxTransactionFee(new Hbar(5));
                const createTopicResponse = await createTopicTx.execute(this.client);
                const createTopicReceipt = await createTopicResponse.getReceipt(this.client);
                this.topicId = createTopicReceipt.topicId;
                console.log(`HCS Topic created: ${this.topicId}`);
                process.env.HCS_TOPIC_ID = this.topicId.toString();
            }
            catch (error) {
                console.error('Failed to create HCS topic:', error);
                throw error;
            }
        }
        try {
            const message = JSON.stringify({
                type: 'audit_record',
                data: record,
                timestamp: new Date().toISOString(),
                version: '1.0'
            });
            const submitTx = new TopicMessageSubmitTransaction()
                .setTopicId(this.topicId)
                .setMessage(message)
                .setMaxTransactionFee(new Hbar(2));
            const submitResponse = await submitTx.execute(this.client);
            const submitReceipt = await submitResponse.getReceipt(this.client);
            const transactionId = submitResponse.transactionId.toString();
            console.log(`Audit record published to HCS: ${transactionId}`);
            return transactionId;
        }
        catch (error) {
            console.error('Failed to publish audit record to HCS:', error);
            throw error;
        }
    }
    async getTopicId() {
        return this.topicId?.toString() || null;
    }
    async getHederaExplorerUrl(transactionId) {
        return `https://hashscan.io/testnet/transaction/${transactionId}`;
    }
    async shutdown() {
        this.client.close();
    }
}
export const hcsService = new HederaConsensusService();
//# sourceMappingURL=hcs.js.map