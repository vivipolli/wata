import { AccountId, PendingAirdropId, PublicKey, TokenId } from "@hashgraph/sdk";
import { BaseTransactionBuilder } from "./base_transaction_builder";
import { AirdropRecipient, CreateTokenOptions } from "../strategies";
import { AirdropResult, ClaimAirdropResult, CreateTokenResult, DissociateTokenResult, MintNFTResult, MintTokenResult, RejectTokenResult, TransferTokenResult } from "../../results";
export declare class HtsTransactionBuilder {
    static airdropToken(tokenId: TokenId | string, recipients: AirdropRecipient[], issuerAccountId: string | AccountId): BaseTransactionBuilder<AirdropResult>;
    static associateToken(tokenId: string | TokenId, issuerAccountId: string | AccountId): BaseTransactionBuilder<AirdropResult>;
    static claimAirdrop(airdropId: PendingAirdropId): BaseTransactionBuilder<ClaimAirdropResult>;
    static createToken(options: CreateTokenOptions, publicKey: PublicKey, issuerAccountId: string | AccountId): BaseTransactionBuilder<CreateTokenResult>;
    static dissociateToken(tokenId: string | TokenId, issuerAccountId: string | AccountId): BaseTransactionBuilder<DissociateTokenResult>;
    static mintNft(tokenId: string | TokenId, tokenMetadata: Uint8Array): BaseTransactionBuilder<MintNFTResult>;
    static mintToken(tokenId: string | TokenId, amount: number): BaseTransactionBuilder<MintTokenResult>;
    static rejectToken(tokenId: TokenId, issuerAccountId: AccountId): BaseTransactionBuilder<RejectTokenResult>;
    static transferToken(tokenId: TokenId | string, amount: number, targetAccountId: AccountId | string, issuerAccountId: AccountId | string): BaseTransactionBuilder<TransferTokenResult>;
}
//# sourceMappingURL=hts_transaction_builder.d.ts.map