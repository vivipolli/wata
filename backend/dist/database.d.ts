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
    amount: number;
    transactionHash?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
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
    getAllAgreements(): Promise<DatabaseRow[]>;
    createReading(readingData: ReadingData): Promise<number>;
    getReadingsByAgreement(agreementId: number, limit?: number): Promise<DatabaseRow[]>;
    getRecentReadings(limit?: number): Promise<DatabaseRow[]>;
    createPayment(paymentData: PaymentData): Promise<number>;
    updatePaymentStatus(paymentId: number, status: string, transactionHash?: string): Promise<void>;
    getPaymentsByAgreement(agreementId: number): Promise<DatabaseRow[]>;
    getPendingPayments(): Promise<DatabaseRow[]>;
    getPayment(paymentId: number): Promise<DatabaseRow | undefined>;
    close(): void;
}
export {};
//# sourceMappingURL=database.d.ts.map