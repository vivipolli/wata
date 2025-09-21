import { HederaNetworkType } from "../types";
import BigNumber from "bignumber.js";
export declare const toDisplayUnit: (tokenId: string, value: BigNumber | number, networkType: HederaNetworkType) => Promise<BigNumber>;
export declare const toBaseUnit: (tokenId: string, displayValue: BigNumber | number, networkType: HederaNetworkType) => Promise<BigNumber>;
export declare const getHTSDecimals: (tokenId: string, networkType: HederaNetworkType) => Promise<string>;
export declare const getHtsTokenDetails: (tokenId: string, networkType: HederaNetworkType) => Promise<import("../types").HtsTokenDetails>;
//# sourceMappingURL=hts-format-utils.d.ts.map