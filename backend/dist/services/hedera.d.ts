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
    createAgreementWithSystem(agreementHash: string, producerAddress: string, baseValue: number, hectares: number): Promise<{
        agreementId: number;
        transactionId: string;
    }>;
    requestPayment(agreementId: number, auditHash: string): Promise<TransactionRecord>;
    submitValidatedBatch(agreementId: number, auditHash: string, score: number): Promise<TransactionRecord>;
    verifyTransaction(transactionHash: string): Promise<{
        status: string;
        success: boolean;
        details?: any;
    }>;
    recordAudit(auditHash: string): Promise<TransactionRecord>;
    getAgreement(agreementId: number): Promise<AgreementData>;
    getAccountBalance(accountId: string): Promise<string>;
    transferHBAR(toAddress: string, amountInTinybars: number): Promise<{
        success: boolean;
        transactionHash?: string;
        error?: string;
    }>;
    getAccountInfo(accountId: string): Promise<any>;
    investInAgreement(agreementId: number, amount: number, investorAddress: string): Promise<{
        success: boolean;
        transactionId?: string;
        error?: string;
    }>;
    createInvestmentTransaction(agreementId: number, amount: number, investorAddress: string): Promise<{
        success: boolean;
        transactionBytes?: string;
        error?: string;
    }>;
    private formatBytes32String;
}
export {};
//# sourceMappingURL=hedera.d.ts.map