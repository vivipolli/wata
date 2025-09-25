export interface AuditReport {
    agreementId: string;
    batchId: number;
    auditHash: string;
    score: number;
    timestamp: string;
    transactionHash: string;
    producerAddress: string;
    investorAddress?: string;
    readings: any[];
    validationDetails: any;
    paymentDetails?: any;
}
export declare class HederaFileService {
    private client;
    private operatorId;
    private operatorKey;
    constructor();
    createAuditReport(report: AuditReport): Promise<string>;
    appendToReport(fileId: string, additionalData: any): Promise<void>;
    private generateReportContent;
    getHederaExplorerUrl(fileId: string): Promise<string>;
    shutdown(): Promise<void>;
}
export declare const hfsService: HederaFileService;
//# sourceMappingURL=hfs.d.ts.map