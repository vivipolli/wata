import { AccountId, Client, PublicKey, TokenType, Transaction, TransactionReceipt, TransactionResponse } from "@hashgraph/sdk";
import { TransactionStrategy } from "../base_strategy";
import { CreateTokenResult } from "../../../results";
export interface CreateTokenOptions {
    name: string;
    symbol: string;
    decimals?: number;
    initialSupply?: number;
    isSupplyKey?: boolean;
    tokenType: TokenType;
    client: Client;
    maxSupply?: number;
    isMetadataKey?: boolean;
    isAdminKey?: boolean;
    tokenMetadata?: Uint8Array;
    memo?: string;
}
export declare class CreateTokenStrategy implements TransactionStrategy<CreateTokenResult> {
    private options;
    private publicKey;
    private issuerAccountId;
    constructor(options: CreateTokenOptions, publicKey: PublicKey, issuerAccountId: AccountId | string);
    build(): Transaction;
    formatResult(txResponse: TransactionResponse, receipt: TransactionReceipt): CreateTokenResult;
}
//# sourceMappingURL=create_token_strategy.d.ts.map