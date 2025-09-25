import { HederaService } from './hedera';
import { Database } from '../database';
export declare class RelayerService {
    private hederaService;
    private database;
    private isRunning;
    private contract;
    private provider;
    constructor(hederaService: HederaService, database: Database);
    initialize(): Promise<void>;
    start(): Promise<void>;
    stop(): void;
    private setupEventListeners;
    private handlePaymentApproved;
    private executeHBARPayment;
    private getBatchByAuditHash;
    private getInvestorAddress;
    private getBatchReadings;
    private getContractABI;
    getStatus(): Promise<any>;
}
//# sourceMappingURL=relayer.d.ts.map