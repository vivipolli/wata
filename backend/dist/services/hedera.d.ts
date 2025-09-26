import { TransactionRecord } from '@hashgraph/sdk';
interface AgreementData {
    agreementHash: string;
    producer: string;
    baseValue: bigint;
    hectares: bigint;
    isActive: boolean;
    createdAt: bigint;
}
export declare class HederaService {
    private client;
    private accountId;
    private privateKey;
    private contractAddress;
    private contractId;
    initialize(): Promise<void>;
    /**
     * Execute a transaction with user authorization
     * The user's signature serves as authorization, but we execute with server's key
     */
    executeSignedTransaction(signedTransaction: any): Promise<{
        agreementId: number;
        transactionId: string;
    } | undefined>;
    createAgreement(agreementHash: string, producerAddress: string, baseValue: number, hectares: number): Promise<{
        agreementId: number;
        transactionId: string;
    } | undefined>;
    requestPayment(agreementId: number, auditHash: string): Promise<TransactionRecord>;
    submitValidatedBatch(agreementId: number, auditHash: string, score: number): Promise<TransactionRecord>;
    /**
     * Verify transaction status using transaction hash
     */
    verifyTransaction(transactionHash: string): Promise<{
        status: string;
        success: boolean;
        details?: any;
    }>;
    recordAudit(auditHash: string): Promise<TransactionRecord>;
    getAgreement(agreementId: number): Promise<AgreementData>;
    transferHbar(toAddress: string, amount: number): Promise<string>;
    getAccountBalance(accountId: string): Promise<string>;
    transferHBAR(toAddress: string, amountInTinybars: number): Promise<{
        success: boolean;
        transactionHash?: string;
        error?: string;
    }>;
    getAccountInfo(accountId: string): Promise<any>;
}
export {};
//# sourceMappingURL=hedera.d.ts.map