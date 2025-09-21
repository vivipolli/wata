import { TokenId, Transaction, TransactionReceipt, TransactionResponse } from "@hashgraph/sdk";
import { TransactionStrategy } from "../base_strategy";
import { MintNFTResult } from "../../../results";
export declare class MintNftStrategy implements TransactionStrategy<MintNFTResult> {
    private tokenId;
    private tokenMetadata;
    constructor(tokenId: string | TokenId, tokenMetadata: Uint8Array);
    build(): Transaction;
    formatResult(txResponse: TransactionResponse, receipt: TransactionReceipt): MintNFTResult;
}
//# sourceMappingURL=mint_nft_strategy.d.ts.map