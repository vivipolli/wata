import { HederaService } from './hedera.js';
import { Database } from '../database.js';
interface PaymentCheckResult {
    success: boolean;
    message: string;
    averageTurbidity?: number;
    amount?: number;
    threshold?: number;
}
export declare class RelayerService {
    private hederaService;
    private database;
    private isRunning;
    private eventListeners;
    private intervalId;
    constructor(hederaService: HederaService, database: Database);
    start(): Promise<void>;
    stop(): void;
    private startEventProcessing;
    private processPendingPayments;
    private processApprovedPayments;
    private processPayment;
    private simulateHbarTransfer;
    handlePaymentApproved(agreementId: number, producerAddress: string, amount: number, auditHash: string, score: number, batchId: number): Promise<void>;
    handlePaymentRequested(agreementId: number, producerAddress: string, amount: number, auditHash: string): Promise<void>;
    triggerPaymentCheck(agreementId: number): Promise<PaymentCheckResult>;
}
export {};
//# sourceMappingURL=relayer.d.ts.map