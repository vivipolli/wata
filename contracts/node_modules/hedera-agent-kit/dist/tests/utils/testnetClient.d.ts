import { AccountData } from "./testnetUtils";
import { CreateFTOptions, CreateNFTOptions, HederaNetworkType } from "../../types";
import { AirdropRecipient } from "../../tools/transactions/strategies";
import { AirdropResult, CreateTopicResult, SubmitMessageResult } from "../../tools";
export declare class NetworkClientWrapper {
    private readonly accountId;
    private readonly privateKey;
    private readonly publicKey;
    private readonly client;
    private readonly agentKit;
    constructor(accountIdString: string, privateKeyString: string, publicKey: string, keyType: string, networkType: HederaNetworkType);
    createAccount(initialHBARAmount?: number, maxAutoAssociation?: number): Promise<AccountData>;
    setMaxAutoAssociation(maxAutoAssociation: number): Promise<void>;
    createFT(options: CreateFTOptions): Promise<string>;
    createNFT(options: CreateNFTOptions): Promise<string>;
    transferToken(receiverId: string, tokenId: string, amount: number): Promise<void>;
    airdropToken(tokenId: string, recipients: AirdropRecipient[]): Promise<AirdropResult>;
    getAccountId(): string;
    createTopic(topicMemo: string, submitKey: boolean): Promise<CreateTopicResult>;
    getAccountTokenBalance(tokenId: string, networkType: string, accountId: string): Promise<number>;
    submitTopicMessage(topicId: string, message: string): Promise<SubmitMessageResult>;
}
//# sourceMappingURL=testnetClient.d.ts.map