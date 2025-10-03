import { HederaService } from './hedera';
import { PrismaDatabase } from './orm/prismaDatabase';
interface PaymentCheckResult {
    success: boolean;
    message: string;
    averageTurbidity?: number;
    amount?: number;
    threshold?: number;
    hcsTransactionId?: string;
    hfsFileId?: string;
}
export declare class RelayerService {
    private hederaService;
    private database;
    private isRunning;
    private contract;
    private provider;
    constructor(hederaService: HederaService, database: PrismaDatabase);
    initialize(): Promise<void>;
    start(): Promise<void>;
    stop(): void;
    private setupEventListeners;
    private handlePaymentApproved;
    executeHBARPayment(agreementId: number, producerAddress: string, amount: number, auditHash: string, score: number, hcsTransactionId: string, hfsFileId: string): Promise<PaymentCheckResult>;
    private getBatchByAuditHash;
    private getInvestorAddress;
    private getBatchReadings;
    private getContractABI;
    getStatus(): Promise<any>;
}
export {};
//# sourceMappingURL=relayer.d.ts.map