"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HederaService = void 0;
const tslib_1 = require("tslib");
const sdk_1 = require("@hashgraph/sdk");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
dotenv_1.default.config();
function formatBytes32String(str) {
    const hash = Buffer.from(str, 'utf8');
    const padded = Buffer.alloc(32);
    hash.copy(padded, 0, 0, Math.min(hash.length, 32));
    return new Uint8Array(padded);
}
class HederaService {
    client = null;
    accountId = null;
    privateKey = null;
    contractAddress = null;
    contractId = null;
    async initialize() {
        try {
            this.accountId = sdk_1.AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
            const privateKeyString = process.env.HEDERA_PRIVATE_KEY;
            if (privateKeyString.startsWith('0x')) {
                this.privateKey = sdk_1.PrivateKey.fromStringECDSA(privateKeyString.slice(2));
            }
            else {
                this.privateKey = sdk_1.PrivateKey.fromString(privateKeyString);
            }
            this.contractAddress = process.env.CONTRACT_ADDRESS;
            this.client = sdk_1.Client.forTestnet().setOperator(this.accountId, this.privateKey);
            if (this.contractAddress.startsWith('0x')) {
                this.contractId = sdk_1.ContractId.fromEvmAddress(0, 0, this.contractAddress);
            }
            else {
                this.contractId = sdk_1.ContractId.fromString(this.contractAddress);
            }
        }
        catch (error) {
            throw error;
        }
    }
    async createAgreementWithSystem(agreementHash, producerAddress, baseValue, hectares) {
        try {
            let contractAddress;
            if (producerAddress.startsWith('0.0.')) {
                const accountId = sdk_1.AccountId.fromString(producerAddress);
                contractAddress = accountId.toSolidityAddress();
            }
            else {
                contractAddress = producerAddress;
            }
            const transaction = new sdk_1.ContractExecuteTransaction()
                .setContractId(this.contractId)
                .setGas(200000)
                .setFunction('createAgreement', new sdk_1.ContractFunctionParameters()
                .addBytes32(this.formatBytes32String(agreementHash))
                .addAddress(contractAddress)
                .addUint256(baseValue)
                .addUint256(hectares));
            const serverTransactionId = sdk_1.TransactionId.generate(this.accountId);
            transaction.setTransactionId(serverTransactionId);
            const response = await transaction.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            const record = await response.getRecord(this.client);
            const result = record.contractFunctionResult?.getUint256(0);
            const transactionId = record.transactionId?.toString();
            return {
                agreementId: Number(result || 0),
                transactionId: transactionId
            };
        }
        catch (error) {
            throw error;
        }
    }
    async requestPayment(agreementId, auditHash) {
        try {
            const transaction = new sdk_1.ContractExecuteTransaction()
                .setContractId(this.contractId)
                .setGas(200000)
                .setFunction('requestPayment', new sdk_1.ContractFunctionParameters()
                .addUint256(agreementId)
                .addBytes32(formatBytes32String(auditHash)));
            const frozenTransaction = await transaction.freezeWith(this.client);
            const response = await frozenTransaction.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            const record = await response.getRecord(this.client);
            return record;
        }
        catch (error) {
            throw error;
        }
    }
    async submitValidatedBatch(agreementId, auditHash, score) {
        try {
            const transaction = new sdk_1.ContractExecuteTransaction()
                .setContractId(this.contractId)
                .setGas(200000)
                .setFunction('submitValidatedBatch', new sdk_1.ContractFunctionParameters()
                .addUint256(agreementId)
                .addBytes32(formatBytes32String(auditHash))
                .addUint256(score));
            const frozenTransaction = await transaction.freezeWith(this.client);
            const response = await frozenTransaction.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            const record = await response.getRecord(this.client);
            const accountId = record.transactionId.accountId?.toString();
            const validStart = record.transactionId.validStart;
            const transactionId = `${accountId}@${validStart.seconds}.${validStart.nanos}`;
            return {
                ...receipt,
                transactionHash: transactionId
            };
        }
        catch (error) {
            throw error;
        }
    }
    async verifyTransaction(transactionHash) {
        try {
            const transactionId = sdk_1.TransactionId.fromString(transactionHash);
            const record = await new sdk_1.TransactionRecordQuery()
                .setTransactionId(transactionId)
                .execute(this.client);
            const status = record.receipt?.status?.toString() || 'UNKNOWN';
            const success = status === 'SUCCESS';
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
            return {
                status: 'ERROR',
                success: false,
                details: { error: error instanceof Error ? error.message : 'Unknown error' }
            };
        }
    }
    async recordAudit(auditHash) {
        try {
            const transaction = new sdk_1.ContractExecuteTransaction()
                .setContractId(this.contractId)
                .setGas(200000)
                .setFunction('recordAudit', new sdk_1.ContractFunctionParameters()
                .addBytes32(formatBytes32String(auditHash)));
            const frozenTransaction = await transaction.freezeWith(this.client);
            const response = await frozenTransaction.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            const record = await response.getRecord(this.client);
            return record;
        }
        catch (error) {
            throw error;
        }
    }
    async getAgreement(agreementId) {
        try {
            const query = new sdk_1.ContractCallQuery()
                .setContractId(this.contractId)
                .setGas(200000)
                .setFunction('getAgreement', new sdk_1.ContractFunctionParameters().addUint256(agreementId));
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
    async getAccountBalance(accountId) {
        try {
            const balance = await new sdk_1.AccountBalanceQuery()
                .setAccountId(sdk_1.AccountId.fromString(accountId))
                .execute(this.client);
            return balance.hbars.toString();
        }
        catch (error) {
            throw error;
        }
    }
    async transferHBAR(toAddress, amountInTinybars) {
        try {
            const transferTransaction = new sdk_1.TransferTransaction()
                .addHbarTransfer(sdk_1.AccountId.fromString(process.env.HEDERA_ACCOUNT_ID), new sdk_1.Hbar(-amountInTinybars / 100000000))
                .addHbarTransfer(sdk_1.AccountId.fromString(toAddress), new sdk_1.Hbar(amountInTinybars / 100000000))
                .setMaxTransactionFee(new sdk_1.Hbar(5));
            const frozenTransaction = await transferTransaction.freezeWith(this.client);
            const response = await frozenTransaction.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            const transactionId = response.transactionId.toString();
            return {
                success: true,
                transactionHash: transactionId
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async getAccountInfo(accountId) {
        try {
            const accountInfo = await new sdk_1.AccountInfoQuery()
                .setAccountId(sdk_1.AccountId.fromString(accountId))
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
            throw error;
        }
    }
    async investInAgreement(agreementId, amount, investorAddress) {
        try {
            if (!this.client || !this.contractId || !this.accountId || !this.privateKey) {
                throw new Error('Hedera service not initialized');
            }
            // Convert amount to tinybars (1 HBAR = 100,000,000 tinybars)
            const amountInTinybars = Math.floor(amount * 100000000);
            // Create investment transaction
            const transaction = new sdk_1.ContractExecuteTransaction()
                .setContractId(this.contractId)
                .setGas(1000000)
                .setFunction('investInAgreement', new sdk_1.ContractFunctionParameters().addUint256(agreementId))
                .setPayableAmount(sdk_1.Hbar.fromTinybars(amountInTinybars))
                .setTransactionMemo(`Investment in agreement ${agreementId} by ${investorAddress}`);
            // Freeze, sign and execute transaction
            const frozenTransaction = await transaction.freezeWith(this.client);
            const signedTransaction = await frozenTransaction.sign(this.privateKey);
            const txResponse = await signedTransaction.execute(this.client);
            // Get transaction receipt
            const receipt = await txResponse.getReceipt(this.client);
            const transactionId = txResponse.transactionId.toString();
            console.log(`Investment successful for agreement ${agreementId}: ${transactionId}`);
            console.log(`Investment made by server on behalf of investor: ${investorAddress}`);
            return {
                success: true,
                transactionId
            };
        }
        catch (error) {
            console.error('Error investing in agreement:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    // New method: Create investment transaction for investor to sign
    async createInvestmentTransaction(agreementId, amount, investorAddress) {
        try {
            if (!this.client || !this.contractId) {
                throw new Error('Hedera service not initialized');
            }
            // Convert amount to tinybars (1 HBAR = 100,000,000 tinybars)
            const amountInTinybars = Math.floor(amount * 100000000);
            // Create investment transaction
            const transaction = new sdk_1.ContractExecuteTransaction()
                .setContractId(this.contractId)
                .setGas(1000000)
                .setFunction('investInAgreement', new sdk_1.ContractFunctionParameters().addUint256(agreementId))
                .setPayableAmount(sdk_1.Hbar.fromTinybars(amountInTinybars))
                .setTransactionMemo(`Investment in agreement ${agreementId} by ${investorAddress}`);
            // Freeze transaction for investor to sign
            const frozenTransaction = await transaction.freezeWith(this.client);
            // Convert to bytes for investor to sign
            const transactionBytes = frozenTransaction.toBytes();
            return {
                success: true,
                transactionBytes: Buffer.from(transactionBytes).toString('hex')
            };
        }
        catch (error) {
            console.error('Error creating investment transaction:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    formatBytes32String(str) {
        const hash = Buffer.from(str, 'utf8');
        const padded = Buffer.alloc(32);
        hash.copy(padded, 0, 0, Math.min(hash.length, 32));
        return new Uint8Array(padded);
    }
}
exports.HederaService = HederaService;
//# sourceMappingURL=hedera.js.map