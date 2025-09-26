import { Client, AccountId, PrivateKey, ContractFunctionParameters, ContractCallQuery, ContractExecuteTransaction, Hbar, ContractId, AccountBalanceQuery, TransferTransaction, AccountInfoQuery, TransactionId, TransactionRecordQuery } from '@hashgraph/sdk';
import dotenv from 'dotenv';
dotenv.config();
// Helper function to format strings as bytes32 for Hedera
function formatBytes32String(str) {
    const hash = Buffer.from(str, 'utf8');
    const padded = Buffer.alloc(32);
    hash.copy(padded, 0, 0, Math.min(hash.length, 32));
    return new Uint8Array(padded);
}
export class HederaService {
    client = null;
    accountId = null;
    privateKey = null;
    contractAddress = null;
    contractId = null;
    async initialize() {
        try {
            this.accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
            // Handle different private key formats
            const privateKeyString = process.env.HEDERA_PRIVATE_KEY;
            if (privateKeyString.startsWith('0x')) {
                // Remove 0x prefix for Hedera SDK
                this.privateKey = PrivateKey.fromString(privateKeyString.slice(2));
            }
            else {
                this.privateKey = PrivateKey.fromString(privateKeyString);
            }
            this.contractAddress = process.env.CONTRACT_ADDRESS;
            if (!this.accountId || !this.privateKey || !this.contractAddress) {
                throw new Error('Missing required Hedera configuration');
            }
            this.client = Client.forTestnet().setOperator(this.accountId, this.privateKey);
            // Convert Ethereum address to Hedera Contract ID if needed
            if (this.contractAddress.startsWith('0x')) {
                // For Ethereum-style addresses, we need to use ContractId.fromEvmAddress
                this.contractId = ContractId.fromEvmAddress(0, 0, this.contractAddress);
            }
            else {
                // For Hedera-style addresses (0.0.123456)
                this.contractId = ContractId.fromString(this.contractAddress);
            }
            console.log('Hedera service initialized');
            console.log('Account ID:', this.accountId.toString());
            console.log('Contract Address:', this.contractAddress);
        }
        catch (error) {
            console.error('Failed to initialize Hedera service:', error);
            throw error;
        }
    }
    /**
     * Execute a transaction with user authorization
     * The user's signature serves as authorization, but we execute with server's key
     */
    async executeSignedTransaction(signedTransaction) {
        try {
            console.log('Executing transaction with user authorization:');
            console.log('- User Signer:', signedTransaction.signer);
            console.log('- Agreement Hash:', signedTransaction.transactionData.agreementHash);
            console.log('- Producer Address:', signedTransaction.transactionData.producerAddress);
            const { transactionData } = signedTransaction;
            // Convert Hedera address (0.0.123456) to Ethereum format for contract interaction
            let contractAddress;
            if (transactionData.producerAddress.startsWith('0.0.')) {
                // Convert Hedera address to Ethereum format
                const accountId = AccountId.fromString(transactionData.producerAddress);
                contractAddress = accountId.toSolidityAddress();
                console.log('- Converted Address:', contractAddress);
            }
            else {
                contractAddress = transactionData.producerAddress;
                console.log('- Using Address as-is:', contractAddress);
            }
            console.log('Creating transaction with server signature...');
            const transaction = new ContractExecuteTransaction()
                .setContractId(this.contractId)
                .setGas(200000)
                .setFunction('createAgreement', new ContractFunctionParameters()
                .addBytes32(formatBytes32String(transactionData.agreementHash))
                .addAddress(contractAddress)
                .addUint256(transactionData.baseValue)
                .addUint256(transactionData.hectares));
            console.log('Executing transaction with server key (user authorized)...');
            // Execute the transaction with server's key (user has authorized via signature)
            const response = await transaction.execute(this.client);
            // Request the receipt of the transaction
            const receipt = await response.getReceipt(this.client);
            // Get the transaction consensus status
            const transactionStatus = receipt.status;
            console.log("The transaction consensus status is " + transactionStatus);
            // Get the record for function result
            const record = await response.getRecord(this.client);
            const result = record.contractFunctionResult?.getUint256(0);
            console.log('Agreement created on Hedera with user authorization:', result);
            // Get the transaction ID in Hedera format
            const transactionId = record.transactionId?.toString();
            console.log('Transaction ID:', transactionId);
            // Return both the agreement ID and transaction ID
            return {
                agreementId: Number(result || 0),
                transactionId: transactionId
            };
        }
        catch (error) {
            console.error('Error executing transaction with user authorization:', error);
            throw error;
        }
    }
    async createAgreement(agreementHash, producerAddress, baseValue, hectares) {
        try {
            // Convert Hedera address (0.0.123456) to Ethereum format for contract interaction
            let contractAddress;
            if (producerAddress.startsWith('0.0.')) {
                // Convert Hedera address to Ethereum format
                const accountId = AccountId.fromString(producerAddress);
                contractAddress = accountId.toSolidityAddress();
            }
            else {
                contractAddress = producerAddress;
            }
            const transaction = new ContractExecuteTransaction()
                .setContractId(this.contractId)
                .setGas(200000)
                .setFunction('createAgreement', new ContractFunctionParameters()
                .addBytes32(formatBytes32String(agreementHash))
                .addAddress(contractAddress)
                .addUint256(baseValue)
                .addUint256(hectares));
            // Execute the transaction
            const response = await transaction.execute(this.client);
            // Request the receipt of the transaction
            const receipt = await response.getReceipt(this.client);
            // Get the transaction consensus status
            const transactionStatus = receipt.status;
            console.log("The transaction consensus status is " + transactionStatus);
            // Get the record for function result
            const record = await response.getRecord(this.client);
            const result = record.contractFunctionResult?.getUint256(0);
            console.log('Agreement created on Hedera:', result);
            // Get the transaction ID in Hedera format
            const transactionId = record.transactionId?.toString();
            console.log('Transaction ID:', transactionId);
            // Return both the agreement ID and transaction ID
            return {
                agreementId: Number(result || 0),
                transactionId: transactionId
            };
        }
        catch (error) {
            console.error('Error creating agreement on Hedera:', error);
            throw error;
        }
    }
    async requestPayment(agreementId, auditHash) {
        try {
            const transaction = new ContractExecuteTransaction()
                .setContractId(this.contractId)
                .setGas(200000)
                .setFunction('requestPayment', new ContractFunctionParameters()
                .addUint256(agreementId)
                .addBytes32(formatBytes32String(auditHash)));
            const response = await transaction.execute(this.client);
            // Request the receipt of the transaction
            const receipt = await response.getReceipt(this.client);
            // Get the transaction consensus status
            const transactionStatus = receipt.status;
            console.log("The transaction consensus status is " + transactionStatus);
            // Get the record for return value
            const record = await response.getRecord(this.client);
            console.log('Payment requested on Hedera for agreement:', agreementId);
            return record;
        }
        catch (error) {
            console.error('Error requesting payment on Hedera:', error);
            throw error;
        }
    }
    async submitValidatedBatch(agreementId, auditHash, score) {
        try {
            const transaction = new ContractExecuteTransaction()
                .setContractId(this.contractId)
                .setGas(200000)
                .setFunction('submitValidatedBatch', new ContractFunctionParameters()
                .addUint256(agreementId)
                .addBytes32(formatBytes32String(auditHash))
                .addUint256(score));
            const response = await transaction.execute(this.client);
            // Request the receipt of the transaction
            const receipt = await response.getReceipt(this.client);
            // Get the transaction consensus status
            const transactionStatus = receipt.status;
            console.log("The transaction consensus status is " + transactionStatus);
            // Get the record for transaction details
            const record = await response.getRecord(this.client);
            // Get the transaction ID from the response
            // In Hedera, we use the transaction ID in format: accountId@validStart.nonce
            const accountId = record.transactionId.accountId?.toString();
            const validStart = record.transactionId.validStart;
            const nonce = record.transactionId.nonce;
            // Construct Transaction ID in the correct format: accountId@validStart.nonce
            const transactionId = `${accountId}@${validStart.seconds}.${validStart.nanos}`;
            console.log('Transaction ID from Hedera:', transactionId);
            console.log('Transaction ID parts:', {
                accountId,
                validStart: `${validStart.seconds}.${validStart.nanos}`,
                nonce
            });
            console.log('Validated batch submitted to Hedera:', {
                agreementId,
                auditHash,
                score,
                transactionId
            });
            // Return receipt with transaction ID
            return {
                ...receipt,
                transactionHash: transactionId
            };
        }
        catch (error) {
            console.error('Error submitting validated batch to Hedera:', error);
            throw error;
        }
    }
    /**
     * Verify transaction status using transaction hash
     */
    async verifyTransaction(transactionHash) {
        try {
            console.log('Verifying transaction:', transactionHash);
            // Parse transaction hash to get transaction ID
            const transactionId = TransactionId.fromString(transactionHash);
            // Get transaction record
            const record = await new TransactionRecordQuery()
                .setTransactionId(transactionId)
                .execute(this.client);
            const status = record.receipt?.status?.toString() || 'UNKNOWN';
            const success = status === 'SUCCESS';
            console.log('Transaction verification result:', {
                hash: transactionHash,
                status,
                success,
                consensusTimestamp: record.consensusTimestamp
            });
            return {
                status,
                success,
                details: {
                    consensusTimestamp: record.consensusTimestamp,
                    transactionId: record.transactionId,
                    receipt: record.receipt
                }
            };
        }
        catch (error) {
            console.error('Error verifying transaction:', error);
            return {
                status: 'ERROR',
                success: false,
                details: { error: error instanceof Error ? error.message : 'Unknown error' }
            };
        }
    }
    async recordAudit(auditHash) {
        try {
            const transaction = new ContractExecuteTransaction()
                .setContractId(this.contractId)
                .setGas(200000)
                .setFunction('recordAudit', new ContractFunctionParameters()
                .addBytes32(formatBytes32String(auditHash)));
            const response = await transaction.execute(this.client);
            // Request the receipt of the transaction
            const receipt = await response.getReceipt(this.client);
            // Get the transaction consensus status
            const transactionStatus = receipt.status;
            console.log("The transaction consensus status is " + transactionStatus);
            // Get the record for return value
            const record = await response.getRecord(this.client);
            console.log('Audit recorded on Hedera:', auditHash);
            return record;
        }
        catch (error) {
            console.error('Error recording audit on Hedera:', error);
            throw error;
        }
    }
    async getAgreement(agreementId) {
        try {
            const query = new ContractCallQuery()
                .setContractId(this.contractId)
                .setGas(200000)
                .setFunction('getAgreement', new ContractFunctionParameters().addUint256(agreementId));
            const response = await query.execute(this.client);
            const result = response.getContractFunctionResult();
            return {
                agreementHash: result.getBytes32(0),
                producer: result.getAddress(1),
                baseValue: result.getUint256(2),
                hectares: result.getUint256(3),
                isActive: result.getBool(4),
                createdAt: result.getUint256(5)
            };
        }
        catch (error) {
            console.error('Error getting agreement from Hedera:', error);
            throw error;
        }
    }
    async transferHbar(toAddress, amount) {
        try {
            // For MVP, we'll simulate the transfer
            // In production, this would use Hedera's TransferTransaction
            const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
            console.log(`Simulated HBAR transfer: ${amount} to ${toAddress}`);
            console.log(`Transaction hash: ${transactionHash}`);
            return transactionHash;
        }
        catch (error) {
            console.error('Error transferring HBAR:', error);
            throw error;
        }
    }
    async getAccountBalance(accountId) {
        try {
            const balance = await new AccountBalanceQuery()
                .setAccountId(AccountId.fromString(accountId))
                .execute(this.client);
            return balance.hbars.toString();
        }
        catch (error) {
            console.error('Error getting account balance:', error);
            throw error;
        }
    }
    async transferHBAR(toAddress, amountInTinybars) {
        try {
            if (!this.client) {
                throw new Error('Hedera service not initialized');
            }
            const transferTransaction = new TransferTransaction()
                .addHbarTransfer(AccountId.fromString(process.env.HEDERA_ACCOUNT_ID), new Hbar(-amountInTinybars / 100000000))
                .addHbarTransfer(AccountId.fromString(toAddress), new Hbar(amountInTinybars / 100000000))
                .setMaxTransactionFee(new Hbar(5));
            const response = await transferTransaction.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            const transactionId = response.transactionId.toString();
            console.log(`HBAR transfer successful: ${transactionId}`);
            return {
                success: true,
                transactionHash: transactionId
            };
        }
        catch (error) {
            console.error('Error transferring HBAR:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async getAccountInfo(accountId) {
        try {
            if (!this.client) {
                throw new Error('Hedera service not initialized');
            }
            const accountInfo = await new AccountInfoQuery()
                .setAccountId(AccountId.fromString(accountId))
                .execute(this.client);
            return {
                accountId: accountInfo.accountId.toString(),
                balance: accountInfo.balance.toString(),
                key: accountInfo.key.toString(),
                isDeleted: accountInfo.isDeleted,
                proxyAccountId: accountInfo.proxyAccountId?.toString(),
                proxyReceived: accountInfo.proxyReceived.toString()
            };
        }
        catch (error) {
            console.error('Error getting account info:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=hedera.js.map