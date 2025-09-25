import { HederaService } from './hedera.js';
import { Database } from '../database.js';
import { hcsService } from './hcs.js';
import { hfsService } from './hfs.js';
import { ethers } from 'ethers';
export class RelayerServiceV3 {
    hederaService;
    database;
    isRunning = false;
    eventListeners = new Map();
    intervalId = null;
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
            this.contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, this.getContractABI(), this.provider);
            console.log('RelayerV3 initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize RelayerV3:', error);
            throw error;
        }
    }
    async start() {
        if (this.isRunning) {
            console.log('RelayerV3 is already running');
            return;
        }
        try {
            await this.initialize();
            this.isRunning = true;
            // Listen for PaymentApproved events
            this.setupEventListeners();
            // Start periodic payment processing
            this.intervalId = setInterval(async () => {
                await this.processPendingPayments();
            }, 30000); // Check every 30 seconds
            console.log('RelayerV3 started successfully');
        }
        catch (error) {
            console.error('Failed to start RelayerV3:', error);
            this.isRunning = false;
            throw error;
        }
    }
    async stop() {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        // Remove event listeners
        this.eventListeners.clear();
        console.log('RelayerV3 stopped');
    }
    setupEventListeners() {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }
        // Listen for PaymentApproved events
        this.contract.on('PaymentApproved', async (agreementId, producer, investor, amount, auditHash, score, hcsTransactionId, hfsFileId, event) => {
            try {
                console.log('PaymentApproved event received:', {
                    agreementId: agreementId.toString(),
                    producer,
                    investor,
                    amount: amount.toString(),
                    auditHash,
                    score: score.toString(),
                    hcsTransactionId,
                    hfsFileId,
                    transactionHash: event.transactionHash
                });
                await this.handlePaymentApproved(Number(agreementId), producer, investor, Number(amount), auditHash, Number(score), hcsTransactionId, hfsFileId, event.transactionHash);
            }
            catch (error) {
                console.error('Error handling PaymentApproved event:', error);
            }
        });
        // Listen for PaymentPending events (for manual approval)
        this.contract.on('PaymentPending', async (agreementId, producer, amount, auditHash, score, requiredApproval, event) => {
            try {
                console.log('PaymentPending event received:', {
                    agreementId: agreementId.toString(),
                    producer,
                    amount: amount.toString(),
                    auditHash,
                    score: score.toString(),
                    requiredApproval,
                    transactionHash: event.transactionHash
                });
                await this.handlePaymentPending(Number(agreementId), producer, Number(amount), auditHash, Number(score), requiredApproval, event.transactionHash);
            }
            catch (error) {
                console.error('Error handling PaymentPending event:', error);
            }
        });
    }
    async handlePaymentApproved(agreementId, producer, investor, amount, auditHash, score, hcsTransactionId, hfsFileId, transactionHash) {
        try {
            // Get agreement details
            const agreement = await this.database.getAgreement(agreementId);
            if (!agreement) {
                console.error(`Agreement ${agreementId} not found`);
                return;
            }
            // Create audit record for HCS
            const auditRecord = {
                agreementId: agreementId.toString(),
                batchId: 0, // Will be updated when we get batch info
                auditHash,
                score,
                timestamp: new Date().toISOString(),
                transactionHash,
                producerAddress: producer,
                investorAddress: investor
            };
            // Publish to HCS if not already done
            if (!hcsTransactionId || hcsTransactionId === '') {
                hcsTransactionId = await hcsService.publishAuditRecord(auditRecord);
            }
            // Create detailed audit report for HFS
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
                    threshold: 70,
                    passed: score >= 70,
                    governanceMode: agreement.governance_mode || 'AUTO'
                },
                paymentDetails: {
                    amount,
                    currency: 'HBAR',
                    status: 'APPROVED',
                    automatic: true
                }
            };
            // Create HFS report if not already done
            if (!hfsFileId || hfsFileId === '') {
                hfsFileId = await hfsService.createAuditReport(auditReport);
            }
            // Execute HBAR payment
            const paymentResult = await this.executeHBARPayment(agreementId, producer, amount, auditHash, score, hcsTransactionId, hfsFileId);
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
    async handlePaymentPending(agreementId, producer, amount, auditHash, score, requiredApproval, transactionHash) {
        try {
            // Log pending payment for manual approval
            await this.database.createPayment({
                agreementId,
                amount,
                status: 'pending',
                auditHash,
                score,
                transactionHash
            });
            console.log(`Payment pending approval for agreement ${agreementId}`);
        }
        catch (error) {
            console.error('Error handling payment pending:', error);
        }
    }
    async executeHBARPayment(agreementId, producerAddress, amount, auditHash, score, hcsTransactionId, hfsFileId) {
        try {
            // Convert amount to tinybars (1 HBAR = 100,000,000 tinybars)
            const amountInTinybars = Math.floor(amount * 100000000);
            // Execute HBAR transfer using HederaService
            const transferResult = await this.hederaService.transferHBAR(producerAddress, amountInTinybars);
            if (transferResult.success) {
                // Record successful payment
                await this.database.createPayment({
                    agreementId,
                    amount,
                    status: 'completed',
                    auditHash,
                    score,
                    transactionHash: transferResult.transactionHash
                });
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
    async processPendingPayments() {
        try {
            const pendingPayments = await this.database.getPendingPayments();
            for (const payment of pendingPayments) {
                try {
                    await this.processPayment(payment);
                }
                catch (error) {
                    console.error(`Error processing payment ${payment.id}:`, error);
                }
            }
        }
        catch (error) {
            console.error('Error processing pending payments:', error);
        }
    }
    async processPayment(payment) {
        // Implementation for processing individual payments
        // This would handle retry logic, status updates, etc.
        console.log(`Processing payment ${payment.id} for agreement ${payment.agreementId}`);
    }
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
        // Return the ABI for PESContractV3
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
                        "indexed": true,
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
            },
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
                        "internalType": "enum PESContractV3.GovernanceMode",
                        "name": "requiredApproval",
                        "type": "uint8"
                    }
                ],
                "name": "PaymentPending",
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
export const relayerServiceV3 = new RelayerServiceV3(new HederaService(), new Database());
//# sourceMappingURL=relayerV3.js.map