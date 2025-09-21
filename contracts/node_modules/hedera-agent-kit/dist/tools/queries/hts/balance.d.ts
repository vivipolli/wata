import { DetailedTokenBalance, HederaNetworkType } from "../../../types";
export declare const get_hts_balance: (tokenId: string, networkType: HederaNetworkType, accountId: string) => Promise<number>;
export declare const get_all_tokens_balances: (networkType: HederaNetworkType, accountId: string) => Promise<Array<DetailedTokenBalance>>;
//# sourceMappingURL=balance.d.ts.map