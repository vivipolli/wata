import { DetailedTokenBalance, HtsTokenDetails, NetworkType, txReport, PendingAirdrop, Topic, MirrorNodeTopicMessage, Account, AccountToken } from "../types";
export declare class HederaMirrorNodeClient {
    private baseUrl;
    constructor(networkType: NetworkType);
    getHbarBalance(accountId: string): Promise<number>;
    getTokenBalance(accountId: string, tokenId: string): Promise<number>;
    getTransactionReport(transactionId: string, senderId: string, receiversId: string[]): Promise<txReport>;
    getTokenDetails(tokenId: string): Promise<HtsTokenDetails>;
    getAllTokensBalances(accountId: string): Promise<Array<DetailedTokenBalance>>;
    getPendingAirdrops(accountId: string): Promise<PendingAirdrop[]>;
    getTopic(topicId: string): Promise<Topic>;
    getAccountInfo(accountId: string): Promise<Account>;
    getAccountToken(accountId: string, tokenId: string): Promise<AccountToken | undefined>;
    getAccountTokens(accountId: string): Promise<AccountToken[]>;
    getAutomaticAssociationsCount(accountId: string): Promise<number>;
    getTopicMessages(topicId: string, range?: {
        lowerTimestamp: string | undefined;
        upperTimestamp: string | undefined;
    }): Promise<MirrorNodeTopicMessage[]>;
}
//# sourceMappingURL=hederaMirrorNodeClient.d.ts.map