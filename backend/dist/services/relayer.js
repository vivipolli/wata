import { hcsService } from './hcs';
import { hfsService } from './hfs';
import { ethers } from 'ethers';
export class RelayerService {
    hederaService;
    database;
    isRunning = false;
    contract = null;
    provider = null;
    constructor(hederaService, database) {
        this.hederaService = hederaService;
        this.database = database;
    }
    async initialize() {
        try {
            await this.hederaService.initialize();
            await hcsService.initialize();
            this.provider = new ethers.JsonRpcProvider(process.env.HEDERA_RPC_URL || 'https://testnet.hashio.io/api');
            const contractAddress = process.env.CONTRACT_ADDRESS;
            if (contractAddress) {
                this.contract = new ethers.Contract(contractAddress, this.getContractABI(), this.provider);
            }
            console.log('RelayerService initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize RelayerService:', error);
            throw error;
        }
    }
    async start() {
        if (this.isRunning) {
            console.log('Relayer service is already running');
            return;
        }
        try {
            await this.initialize();
            this.isRunning = true;
            console.log('🔄 Relayer service started - listening for payment events');
            this.setupEventListeners();
        }
        catch (error) {
            console.error('Failed to start RelayerService:', error);
            this.isRunning = false;
            throw error;
        }
    }
    stop() {
        this.isRunning = false;
        console.log('Relayer service stopped');
    }
    setupEventListeners() {
        if (!this.contract) {
            console.warn('No contract available for event listening');
            return;
        }
        // Skip event listeners for Hedera (not supported)
        if (process.env.HEDERA_NETWORK === 'testnet' || process.env.HEDERA_NETWORK === 'mainnet') {
            console.log('Skipping Ethereum event listeners for Hedera network');
            return;
        }
        // Listen for PaymentApproved events
        this.contract.on('PaymentApproved', async (...args) => {
            try {
                console.log('PaymentApproved event received:', args);
                await this.handlePaymentApproved(Number(args[0]), // agreementId
                args[1], // producer
                args[2], // investor
                Number(args[3]), // amount
                args[4], // auditHash
                Number(args[5]), // score
                args[6], // hcsTransactionId
                args[7], // hfsFileId
                args[8]?.transactionHash // transactionHash
                );
            }
            catch (error) {
                console.error('Error handling PaymentApproved event:', error);
            }
        });
    }
    // Main payment handler - processes PaymentApproved events
    async handlePaymentApproved(agreementId, producer, investor, amount, auditHash, score, hcsTransactionId, hfsFileId, transactionHash) {
        try {
            console.log(`Processing payment for agreement ${agreementId}`);
            // Get agreement details
            const agreement = await this.database.getAgreement(agreementId);
            if (!agreement) {
                console.error(`Agreement ${agreementId} not found`);
                return;
            }
            // Use HCS/HFS IDs from contract if available, otherwise create new ones
            let finalHcsTransactionId = hcsTransactionId;
            let finalHfsFileId = hfsFileId;
            // Create audit record for HCS if no HCS ID provided
            if (!finalHcsTransactionId || finalHcsTransactionId === '') {
                const auditRecord = {
                    agreementId: agreementId.toString(),
                    batchId: 0,
                    auditHash,
                    score,
                    timestamp: new Date().toISOString(),
                    transactionHash,
                    producerAddress: producer,
                    investorAddress: investor
                };
                finalHcsTransactionId = await hcsService.publishAuditRecord(auditRecord);
            }
            // Create detailed audit report for HFS if no HFS ID provided
            if (!finalHfsFileId || finalHfsFileId === '' || finalHfsFileId === '0.0.0') {
                const batch = await this.getBatchByAuditHash(auditHash);
                const auditReport = {
                    agreementId: agreementId.toString(),
                    batchId: batch?.id || 0,
                    auditHash,
                    score,
                    timestamp: new Date().toISOString(),
                    transactionHash,
                    producerAddress: producer,
                    investorAddress: investor,
                    readings: batch ? await this.getBatchReadings(batch.id) : [],
                    validationDetails: {
                        score,
                        threshold: 0.7,
                        passed: score >= 0.7,
                        governanceMode: agreement.governance_mode || 'AUTO'
                    },
                    paymentDetails: {
                        amount,
                        currency: 'HBAR',
                        status: 'APPROVED',
                        automatic: true
                    }
                };
                finalHfsFileId = await hfsService.createAuditReport(auditReport);
            }
            // Execute HBAR payment
            const paymentResult = await this.executeHBARPayment(agreementId, producer, amount, auditHash, score, finalHcsTransactionId, finalHfsFileId);
            if (paymentResult.success) {
                console.log(`Payment executed successfully for agreement ${agreementId}`);
            }
            else {
                console.error(`Payment failed for agreement ${agreementId}:`, paymentResult.message);
            }
        }
        catch (error) {
            console.error('Error handling payment approval:', error);
        }
    }
    // Execute HBAR payment using HederaService
    async executeHBARPayment(agreementId, producerAddress, amount, auditHash, score, hcsTransactionId, hfsFileId) {
        try {
            // Check if payment already exists for this audit hash
            const existingPayments = await this.database.getPaymentsByAgreement(agreementId);
            const existingPayment = existingPayments.find(p => p.audit_hash === auditHash);
            if (existingPayment) {
                console.log(`Payment already exists for audit hash ${auditHash}, skipping`);
                return {
                    success: true,
                    message: 'Payment already exists',
                    amount,
                    hcsTransactionId,
                    hfsFileId
                };
            }
            // Convert amount to tinybars (1 HBAR = 100,000,000 tinybars)
            const amountInTinybars = Math.floor(amount * 100000000);
            // Execute HBAR transfer using HederaService
            const transferResult = await this.hederaService.transferHBAR(producerAddress, amountInTinybars);
            if (transferResult.success) {
                // Get batch ID from audit hash
                const batch = await this.getBatchByAuditHash(auditHash);
                // Record successful payment with V3 fields if available
                const paymentData = {
                    agreementId,
                    batchId: batch?.id || null,
                    amount,
                    status: 'completed',
                    auditHash,
                    score,
                    transactionHash: transferResult.transactionHash
                };
                // Add HCS/HFS fields and investor address
                paymentData.hcsTransactionId = hcsTransactionId;
                paymentData.hfsFileId = hfsFileId;
                paymentData.investorAddress = await this.getInvestorAddress(agreementId);
                await this.database.createPayment(paymentData);
                return {
                    success: true,
                    message: 'Payment executed successfully',
                    amount,
                    hcsTransactionId,
                    hfsFileId
                };
            }
            else {
                return {
                    success: false,
                    message: transferResult.error || 'Payment execution failed'
                };
            }
        }
        catch (error) {
            console.error('Error executing HBAR payment:', error);
            return {
                success: false,
                message: `Payment execution error: ${error}`
            };
        }
    }
    // Helper methods
    async getBatchByAuditHash(auditHash) {
        try {
            const batch = await this.database.getBatchByAuditHash(auditHash);
            return batch;
        }
        catch (error) {
            console.error('Error getting batch by audit hash:', error);
            return null;
        }
    }
    // Helper method to get investor address from agreement
    async getInvestorAddress(agreementId) {
        try {
            const agreement = await this.database.getAgreement(agreementId);
            return agreement?.investor_address || null;
        }
        catch (error) {
            console.error('Error getting investor address:', error);
            return null;
        }
    }
    async getBatchReadings(batchId) {
        try {
            // This would need to be implemented in the database service
            return [];
        }
        catch (error) {
            console.error('Error getting batch readings:', error);
            return [];
        }
    }
    getContractABI() {
        return [
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "agreementId",
                        "type": "uint256"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "producer",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "investor",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "indexed": true,
                        "internalType": "bytes32",
                        "name": "auditHash",
                        "type": "bytes32"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "score",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "hcsTransactionId",
                        "type": "string"
                    },
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "hfsFileId",
                        "type": "string"
                    }
                ],
                "name": "PaymentApproved",
                "type": "event"
            }
        ];
    }
    async getStatus() {
        return {
            isRunning: this.isRunning,
            contractAddress: process.env.CONTRACT_ADDRESS,
            hcsTopicId: await hcsService.getTopicId(),
            lastProcessedAt: new Date().toISOString()
        };
    }
}
//# sourceMappingURL=relayer.js.map