interface DatabaseRow {
    [key: string]: any;
}
interface AgreementData {
    agreementHash: string;
    producerName: string;
    producerAddress: string;
    baseValue: number;
    hectares: number;
    locationLat?: number;
    locationLng?: number;
    durationDays?: number;
}
interface ReadingData {
    agreementId: number;
    turbidityNtu: number;
    locationLat?: number;
    locationLng?: number;
    isSimulated: boolean;
    auditHash?: string;
}
interface PaymentData {
    agreementId: number;
    batchId?: number;
    amount: number;
    transactionHash?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    auditHash?: string;
    score?: number;
}
interface BatchData {
    agreementId: number;
    auditHash: string;
    oracleSignature?: string;
    score: number;
    readingsCount: number;
    averageTurbidity: number;
    medianTurbidity?: number;
    outliersDetected?: number;
    validationStatus?: 'pending' | 'validated' | 'rejected';
    oracleAddress?: string;
}
interface OracleLogData {
    batchId: number;
    action: string;
    details?: string;
    oracleAddress?: string;
    transactionHash?: string;
}
interface UserData {
    email: string;
    name: string;
    password: string;
    role: string;
    address?: string;
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
}
export declare class Database {
    private dbPath;
    private db;
    private run;
    private get;
    private all;
    constructor();
    initialize(): Promise<void>;
    private createTables;
    createAgreement(agreementData: AgreementData): Promise<number>;
    getAgreement(id: number): Promise<DatabaseRow | undefined>;
    getAgreementByHash(agreementHash: string): Promise<DatabaseRow | undefined>;
    updateAgreementBlockchainId(id: number, blockchainId: number): Promise<void>;
    getAllAgreements(): Promise<DatabaseRow[]>;
    getAgreementsByProducer(producerAddress: string): Promise<DatabaseRow[]>;
    createReading(readingData: ReadingData): Promise<number>;
    getReadingsByAgreement(agreementId: number, limit?: number): Promise<DatabaseRow[]>;
    getRecentReadings(limit?: number): Promise<DatabaseRow[]>;
    createPayment(paymentData: PaymentData): Promise<number>;
    updatePaymentStatus(paymentId: number, status: string, transactionHash?: string): Promise<void>;
    getPaymentsByAgreement(agreementId: number): Promise<DatabaseRow[]>;
    getPendingPayments(): Promise<DatabaseRow[]>;
    getPayment(paymentId: number): Promise<DatabaseRow | undefined>;
    createBatch(batchData: BatchData): Promise<number>;
    getBatch(batchId: number): Promise<DatabaseRow | undefined>;
    getBatchByAuditHash(auditHash: string): Promise<DatabaseRow | undefined>;
    getBatchesByAgreement(agreementId: number, limit?: number): Promise<DatabaseRow[]>;
    updateBatchStatus(batchId: number, status: string, submittedAt?: Date): Promise<void>;
    getPendingBatches(): Promise<DatabaseRow[]>;
    createOracleLog(logData: OracleLogData): Promise<number>;
    getOracleLogsByBatch(batchId: number): Promise<DatabaseRow[]>;
    getRecentOracleLogs(limit?: number): Promise<DatabaseRow[]>;
    getWeeklyReadings(agreementId: number, weekStart: Date, weekEnd: Date): Promise<DatabaseRow[]>;
    getAgreementsWithRecentActivity(days?: number): Promise<DatabaseRow[]>;
    createInvestment(investmentData: {
        agreementId: number;
        investorAddress: string;
        amount: number;
        transactionHash?: string;
    }): Promise<number>;
    getInvestmentsByAgreement(agreementId: number): Promise<DatabaseRow[]>;
    getInvestmentsByUser(userAddress: string): Promise<DatabaseRow[]>;
    updateInvestmentTransactionHash(investmentId: number, transactionHash: string): Promise<void>;
    deleteInvestment(investmentId: number): Promise<void>;
    getInvestment(investmentId: number): Promise<DatabaseRow | undefined>;
    createAuditRecord(auditData: {
        agreementId: number;
        batchId?: number;
        auditHash: string;
        score?: number;
        transactionHash?: string;
        producerAddress?: string;
        investorAddress?: string;
        hcsTransactionId?: string;
        hfsFileId?: string;
    }): Promise<number>;
    getAuditRecordsByAgreement(agreementId: number): Promise<DatabaseRow[]>;
    getAuditRecord(auditId: number): Promise<DatabaseRow | undefined>;
    createUser(userData: UserData): Promise<number>;
    getUserByEmail(email: string): Promise<DatabaseRow | undefined>;
    getUserById(id: number): Promise<DatabaseRow | undefined>;
    updateUserLastLogin(id: number): Promise<void>;
    updateUserPassword(id: number, hashedPassword: string): Promise<void>;
    updateUserAddress(id: number, address: string): Promise<void>;
    deactivateUser(id: number): Promise<void>;
    getAllUsers(): Promise<DatabaseRow[]>;
    updateUser(id: number, updateData: {
        name?: string;
        address?: string;
    }): Promise<void>;
    close(): void;
}
export {};
//# sourceMappingURL=database.d.ts.map