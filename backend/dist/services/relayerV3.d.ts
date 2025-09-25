import { HederaService } from './hedera.js';
import { Database } from '../database.js';
export declare class RelayerServiceV3 {
    private hederaService;
    private database;
    private isRunning;
    private eventListeners;
    private intervalId;
    private contract;
    private provider;
    constructor(hederaService: HederaService, database: Database);
    initialize(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    private setupEventListeners;
    private handlePaymentApproved;
    private handlePaymentPending;
    private executeHBARPayment;
    private processPendingPayments;
    private processPayment;
    private getBatchByAuditHash;
    private getBatchReadings;
    private getContractABI;
    getStatus(): Promise<any>;
}
export declare const relayerServiceV3: RelayerServiceV3;
//# sourceMappingURL=relayerV3.d.ts.map