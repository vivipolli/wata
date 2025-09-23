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
    createAgreement(agreementHash: string, producerAddress: string, baseValue: number, hectares: number): Promise<number | undefined>;
    requestPayment(agreementId: number, auditHash: string): Promise<TransactionRecord>;
    submitValidatedBatch(agreementId: number, auditHash: string, score: number): Promise<TransactionRecord>;
    recordAudit(auditHash: string): Promise<TransactionRecord>;
    getAgreement(agreementId: number): Promise<AgreementData>;
    transferHbar(toAddress: string, amount: number): Promise<string>;
    getAccountBalance(accountId: string): Promise<string>;
}
export {};
//# sourceMappingURL=hedera.d.ts.map