export interface AuditRecord {
    agreementId: string;
    batchId: number;
    auditHash: string;
    score: number;
    timestamp: string;
    transactionHash: string;
    producerAddress: string;
    investorAddress?: string;
}
export declare class HederaConsensusService {
    private client;
    private topicId;
    private operatorId;
    private operatorKey;
    constructor();
    initialize(): Promise<void>;
    publishAuditRecord(record: AuditRecord): Promise<string>;
    getTopicId(): Promise<string | null>;
    getHederaExplorerUrl(transactionId: string): Promise<string>;
    shutdown(): Promise<void>;
}
export declare const hcsService: HederaConsensusService;
//# sourceMappingURL=hcs.d.ts.map