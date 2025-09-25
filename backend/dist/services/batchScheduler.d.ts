import { Database } from '../database';
import { OracleService } from './oracle';
/**
 * Batch Scheduler Service
 * Business Rule: Leituras válidas devem ser agregadas em batches (ex.: a cada 6h)
 */
export declare class BatchSchedulerService {
    private database;
    private oracleService;
    private intervalId;
    private isRunning;
    constructor(database: Database, oracleService: OracleService);
    /**
     * Start the batch scheduler
     * Processes batches every 6 hours for all active agreements
     */
    start(): Promise<void>;
    /**
     * Stop the batch scheduler
     */
    stop(): void;
    /**
     * Process batches for all active agreements
     */
    private processAllBatches;
    /**
     * Get unprocessed readings for an agreement
     * Unprocessed readings are those that haven't been included in any batch yet
     */
    private getUnprocessedReadings;
    /**
     * Manually trigger batch processing for a specific agreement
     * Useful for testing or immediate processing
     */
    processBatchForAgreement(agreementId: number): Promise<void>;
    /**
     * Get scheduler status
     */
    getStatus(): {
        isRunning: boolean;
        nextRun?: Date;
    };
}
//# sourceMappingURL=batchScheduler.d.ts.map