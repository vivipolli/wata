export interface Agreement {
    id: string;
    producerName: string;
    producerAddress: string;
    location: string;
    hectares: number;
    baseValue: number;
    duration: number;
    agreementHash: string;
    contractAddress: string;
    createdAt: string;
    status: 'active' | 'completed' | 'cancelled';
}
export interface Reading {
    id: string;
    agreementId: string;
    turbidity: number;
    timestamp: string;
    location: string;
    producerId: string;
    auditHash?: string;
    status: 'pending' | 'verified' | 'rejected';
}
export interface Payment {
    id: string;
    agreementId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    transactionHash?: string;
    auditHash: string;
    createdAt: string;
    processedAt?: string;
}
export interface DatabaseConfig {
    filename: string;
}
export interface HederaConfig {
    accountId: string;
    privateKey: string;
    network: 'testnet' | 'mainnet';
    contractAddress: string;
}
export interface ServerConfig {
    port: number;
    corsOrigin: string;
    database: DatabaseConfig;
    hedera: HederaConfig;
}
export interface CreateAgreementRequest {
    producerName: string;
    producerAddress: string;
    location: string;
    hectares: number;
    baseValue: number;
    duration: number;
    locationLat?: number;
    locationLng?: number;
    durationDays?: number;
}
export interface SimulateReadingRequest {
    agreementId: number;
    locationLat?: number;
    locationLng?: number;
}
export interface SubmitReadingRequest {
    agreementId: number;
    turbidityNtu: number;
    locationLat?: number;
    locationLng?: number;
    producerId?: string;
}
export interface TriggerCheckRequest {
    agreementId: number;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface HealthStatus {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    services: {
        database: boolean;
        hedera: boolean;
        relayer: boolean;
    };
    version: string;
}
//# sourceMappingURL=index.d.ts.map