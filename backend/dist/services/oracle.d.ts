import { Database } from '../database.js';
import { HederaService } from './hedera.js';
interface ReadingData {
    id: number;
    agreementId: number;
    turbidityNtu: number;
    timestamp: string;
    locationLat?: number;
    locationLng?: number;
    isSimulated: boolean;
}
interface BatchValidationResult {
    readings: ReadingData[];
    validReadings: ReadingData[];
    invalidReadings: ReadingData[];
    score: number;
    averageTurbidity: number;
    medianTurbidity: number;
    outliersDetected: number;
    auditHash: string;
    signature: string;
}
export declare class OracleService {
    private database;
    private hederaService;
    private oraclePrivateKey;
    private oracleAddress;
    constructor(database: Database, hederaService: HederaService);
    collectReadingsForValidation(agreementId: number, hoursBack?: number): Promise<ReadingData[]>;
    private validateReading;
    private calculateScore;
    processBatch(agreementId: number): Promise<BatchValidationResult>;
    submitValidatedBatch(agreementId: number, batchResult: BatchValidationResult): Promise<string>;
    private calculateMedian;
    private calculateVariance;
    private generateAuditHash;
    private signBatch;
}
export {};
//# sourceMappingURL=oracle.d.ts.map