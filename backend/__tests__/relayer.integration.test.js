import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { Database } from '../src/database';
import { HederaService } from '../src/services/hedera';
import { RelayerService } from '../src/services/relayer';
// Mock Hedera service for testing
class MockHederaService extends HederaService {
    async initialize() {
        console.log('Mock Hedera service initialized');
    }
    async recordAudit(auditHash) {
        return {
            transactionId: { toString: () => `0.0.123456@${Date.now()}` }
        };
    }
    async transferHbar(toAddress, amount) {
        return `0x${Math.random().toString(16).substr(2, 64)}`;
    }
}
describe('Relayer Integration Tests', () => {
    let database;
    let hederaService;
    let relayerService;
    beforeAll(async () => {
        // Setup test database
        database = new Database();
        process.env.DB_PATH = ':memory:'; // Use in-memory database for testing
        await database.initialize();
        // Setup mock Hedera service
        hederaService = new MockHederaService();
        await hederaService.initialize();
        // Setup Relayer service
        relayerService = new RelayerService(hederaService, database);
    });
    afterAll(async () => {
        relayerService.stop();
        database.close();
    });
    beforeEach(async () => {
        // Clean up database before each test
        await database.run('DELETE FROM oracle_logs');
        await database.run('DELETE FROM batches');
        await database.run('DELETE FROM payments');
        await database.run('DELETE FROM readings');
        await database.run('DELETE FROM agreements');
    });
    describe('Payment Processing', () => {
        it('should process approved payments automatically', async () => {
            // Create test agreement
            const agreementId = await database.createAgreement({
                agreementHash: 'test-hash-1',
                producerName: 'Test Producer',
                producerAddress: '0.0.123456',
                baseValue: 100,
                hectares: 50
            });
            // Create batch with high score (>= 70)
            const batchId = await database.createBatch({
                agreementId,
                auditHash: 'audit-hash-123',
                oracleSignature: 'signature-123',
                score: 85, // Above threshold
                readingsCount: 10,
                averageTurbidity: 5.2,
                medianTurbidity: 5.0,
                outliersDetected: 0,
                validationStatus: 'submitted',
                oracleAddress: '0.0.oracle'
            });
            // Mark batch as submitted
            await database.updateBatchStatus(batchId, 'submitted', new Date());
            // Simulate the relayer processing approved payments
            await relayerService.processApprovedPayments();
            // Check that payment was created
            const payments = await database.getPaymentsByAgreement(agreementId);
            expect(payments).toHaveLength(1);
            expect(payments[0].batch_id).toBe(batchId);
            expect(payments[0].score).toBe(85);
            expect(payments[0].amount).toBe(5000); // 100 * 50
            expect(payments[0].status).toBe('completed');
            expect(payments[0].transaction_hash).toBeDefined();
        });
        it('should not process payments for scores below threshold', async () => {
            // Create test agreement
            const agreementId = await database.createAgreement({
                agreementHash: 'test-hash-1',
                producerName: 'Test Producer',
                producerAddress: '0.0.123456',
                baseValue: 100,
                hectares: 50
            });
            // Create batch with low score (< 70)
            const batchId = await database.createBatch({
                agreementId,
                auditHash: 'audit-hash-123',
                oracleSignature: 'signature-123',
                score: 65, // Below threshold
                readingsCount: 10,
                averageTurbidity: 15.2,
                medianTurbidity: 15.0,
                outliersDetected: 2,
                validationStatus: 'submitted',
                oracleAddress: '0.0.oracle'
            });
            await database.updateBatchStatus(batchId, 'submitted', new Date());
            // Process approved payments
            await relayerService.processApprovedPayments();
            // Check that no payment was created
            const payments = await database.getPaymentsByAgreement(agreementId);
            expect(payments).toHaveLength(0);
        });
        it('should not process the same batch twice', async () => {
            // Create test agreement
            const agreementId = await database.createAgreement({
                agreementHash: 'test-hash-1',
                producerName: 'Test Producer',
                producerAddress: '0.0.123456',
                baseValue: 100,
                hectares: 50
            });
            // Create batch with high score
            const batchId = await database.createBatch({
                agreementId,
                auditHash: 'audit-hash-123',
                oracleSignature: 'signature-123',
                score: 85,
                readingsCount: 10,
                averageTurbidity: 5.2,
                medianTurbidity: 5.0,
                outliersDetected: 0,
                validationStatus: 'submitted',
                oracleAddress: '0.0.oracle'
            });
            await database.updateBatchStatus(batchId, 'submitted', new Date());
            // Process approved payments twice
            await relayerService.processApprovedPayments();
            await relayerService.processApprovedPayments();
            // Check that only one payment was created
            const payments = await database.getPaymentsByAgreement(agreementId);
            expect(payments).toHaveLength(1);
        });
    });
    describe('Payment Event Handling', () => {
        it('should handle PaymentApproved event correctly', async () => {
            // Create test agreement
            const agreementId = await database.createAgreement({
                agreementHash: 'test-hash-1',
                producerName: 'Test Producer',
                producerAddress: '0.0.123456',
                baseValue: 100,
                hectares: 50
            });
            const batchId = 1;
            const auditHash = 'audit-hash-123';
            const score = 85;
            const amount = 5000;
            // Simulate PaymentApproved event
            await relayerService.handlePaymentApproved(agreementId, '0.0.123456', amount, auditHash, score, batchId);
            // Check payment was created and processed
            const payments = await database.getPaymentsByAgreement(agreementId);
            expect(payments).toHaveLength(1);
            expect(payments[0].batch_id).toBe(batchId);
            expect(payments[0].audit_hash).toBe(auditHash);
            expect(payments[0].score).toBe(score);
            expect(payments[0].amount).toBe(amount);
            expect(payments[0].status).toBe('completed');
            // Check oracle log was created
            const logs = await database.getOracleLogsByBatch(batchId);
            expect(logs.length).toBeGreaterThan(0);
            const paymentLog = logs.find(log => log.action === 'payment_processed');
            expect(paymentLog).toBeDefined();
            expect(paymentLog?.details).toContain(`Payment of ${amount} processed`);
        });
        it('should handle payment processing errors gracefully', async () => {
            // Create test agreement
            const agreementId = await database.createAgreement({
                agreementHash: 'test-hash-1',
                producerName: 'Test Producer',
                producerAddress: '0.0.123456',
                baseValue: 100,
                hectares: 50
            });
            // Mock the processPayment method to throw an error
            const originalProcessPayment = relayerService.processPayment;
            relayerService.processPayment = jest.fn().mockRejectedValue(new Error('Payment processing failed'));
            const batchId = 1;
            const auditHash = 'audit-hash-123';
            const score = 85;
            const amount = 5000;
            // This should not throw an error, but handle it gracefully
            await expect(relayerService.handlePaymentApproved(agreementId, '0.0.123456', amount, auditHash, score, batchId)).resolves.not.toThrow();
            relayerService.processPayment = originalProcessPayment;
        });
    });
    describe('Legacy Payment Processing', () => {
        it('should handle legacy PaymentRequested events', async () => {
            // Create test agreement
            const agreementId = await database.createAgreement({
                agreementHash: 'test-hash-1',
                producerName: 'Test Producer',
                producerAddress: '0.0.123456',
                baseValue: 100,
                hectares: 50
            });
            const auditHash = 'audit-hash-123';
            const amount = 5000;
            // Simulate PaymentRequested event
            await relayerService.handlePaymentRequested(agreementId, '0.0.123456', amount, auditHash);
            // Check payment was created and processed
            const payments = await database.getPaymentsByAgreement(agreementId);
            expect(payments).toHaveLength(1);
            expect(payments[0].audit_hash).toBe(auditHash);
            expect(payments[0].amount).toBe(amount);
            expect(payments[0].status).toBe('completed');
        });
        it('should trigger payment check manually', async () => {
            // Create test agreement
            const agreementId = await database.createAgreement({
                agreementHash: 'test-hash-1',
                producerName: 'Test Producer',
                producerAddress: '0.0.123456',
                baseValue: 100,
                hectares: 50
            });
            // Create readings with good water quality
            for (let i = 0; i < 7; i++) {
                await database.createReading({
                    agreementId,
                    turbidityNtu: 8, // Good quality (≤ 10 NTU)
                    isSimulated: true
                });
            }
            // Trigger payment check
            const result = await relayerService.triggerPaymentCheck(agreementId);
            expect(result.success).toBe(true);
            expect(result.message).toBe('Payment approved and processed');
            expect(result.averageTurbidity).toBe(8);
            expect(result.amount).toBe(5000);
            // Check payment was created
            const payments = await database.getPaymentsByAgreement(agreementId);
            expect(payments).toHaveLength(1);
            expect(payments[0].status).toBe('completed');
        });
        it('should reject payment for poor water quality', async () => {
            // Create test agreement
            const agreementId = await database.createAgreement({
                agreementHash: 'test-hash-1',
                producerName: 'Test Producer',
                producerAddress: '0.0.123456',
                baseValue: 100,
                hectares: 50
            });
            // Create readings with poor water quality
            for (let i = 0; i < 7; i++) {
                await database.createReading({
                    agreementId,
                    turbidityNtu: 25, // Poor quality (> 10 NTU)
                    isSimulated: true
                });
            }
            // Trigger payment check
            const result = await relayerService.triggerPaymentCheck(agreementId);
            expect(result.success).toBe(false);
            expect(result.message).toBe('Water quality does not meet standards');
            expect(result.averageTurbidity).toBe(25);
            expect(result.threshold).toBe(10);
            // Check no payment was created
            const payments = await database.getPaymentsByAgreement(agreementId);
            expect(payments).toHaveLength(0);
        });
    });
    describe('Relayer Service Lifecycle', () => {
        it('should start and stop correctly', async () => {
            const newRelayerService = new RelayerService(hederaService, database);
            // Start service
            await newRelayerService.start();
            expect(newRelayerService.isRunning).toBe(true);
            // Stop service
            newRelayerService.stop();
            expect(newRelayerService.isRunning).toBe(false);
        });
        it('should handle starting already running service', async () => {
            const newRelayerService = new RelayerService(hederaService, database);
            await newRelayerService.start();
            // Starting again should not cause issues
            await expect(newRelayerService.start()).resolves.not.toThrow();
            newRelayerService.stop();
        });
    });
    describe('Error Handling', () => {
        it('should handle database errors gracefully', async () => {
            // Create a payment with invalid agreement ID
            const payment = {
                id: 1,
                agreement_id: 999, // Non-existent agreement
                amount: 1000,
                status: 'pending',
                transaction_hash: null,
                created_at: new Date().toISOString(),
                processed_at: null
            };
            // This should not throw an error
            await expect(relayerService.processPayment(payment)).resolves.not.toThrow();
        });
        it('should mark failed payments correctly', async () => {
            // Create test agreement
            const agreementId = await database.createAgreement({
                agreementHash: 'test-hash-1',
                producerName: 'Test Producer',
                producerAddress: 'invalid-address', // Invalid address to cause failure
                baseValue: 100,
                hectares: 50
            });
            // Create a payment
            const paymentId = await database.createPayment({
                agreementId,
                amount: 5000,
                status: 'pending'
            });
            const payment = await database.getPayment(paymentId);
            // Mock simulateHbarTransfer to throw an error
            const originalSimulateHbarTransfer = relayerService.simulateHbarTransfer;
            relayerService.simulateHbarTransfer = jest.fn().mockRejectedValue(new Error('Transfer failed'));
            // Process payment (should fail)
            await relayerService.processPayment(payment);
            // Check payment status was updated to failed
            const updatedPayment = await database.getPayment(paymentId);
            expect(updatedPayment?.status).toBe('failed');
            relayerService.simulateHbarTransfer = originalSimulateHbarTransfer;
        });
    });
});
//# sourceMappingURL=relayer.integration.test.js.map