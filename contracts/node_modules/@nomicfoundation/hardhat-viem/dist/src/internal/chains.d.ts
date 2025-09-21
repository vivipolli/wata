import type { TestClientMode } from "../types.js";
import type { ChainType } from "hardhat/types/network";
import type { EthereumProvider } from "hardhat/types/providers";
import type { Chain as ViemChain } from "viem";
export declare function getChain<ChainTypeT extends ChainType | string>(provider: EthereumProvider, chainType: ChainTypeT): Promise<ViemChain>;
export declare function getChainId(provider: EthereumProvider): Promise<number>;
export declare function isDevelopmentNetwork(provider: EthereumProvider): Promise<boolean>;
export declare function isHardhatNetwork(provider: EthereumProvider): Promise<boolean>;
export declare function isAnvilNetwork(provider: EthereumProvider): Promise<boolean>;
export declare function getMode(provider: EthereumProvider): Promise<TestClientMode>;
//# sourceMappingURL=chains.d.ts.map