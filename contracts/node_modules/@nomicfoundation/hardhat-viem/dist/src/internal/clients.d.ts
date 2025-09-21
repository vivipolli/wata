import type { GetPublicClientReturnType, GetWalletClientReturnType, TestClient } from "../types.js";
import type { ChainType } from "hardhat/types/network";
import type { EthereumProvider } from "hardhat/types/providers";
import type { Address as ViemAddress, PublicClientConfig as ViemPublicClientConfig, TestClientConfig as ViemTestClientConfig, WalletClientConfig as ViemWalletClientConfig } from "viem";
export declare function getPublicClient<ChainTypeT extends ChainType | string>(provider: EthereumProvider, chainType: ChainTypeT, publicClientConfig?: Partial<ViemPublicClientConfig>): Promise<GetPublicClientReturnType<ChainTypeT>>;
export declare function getWalletClients<ChainTypeT extends ChainType | string>(provider: EthereumProvider, chainType: ChainTypeT, walletClientConfig?: Partial<ViemWalletClientConfig>): Promise<Array<GetWalletClientReturnType<ChainTypeT>>>;
export declare function getWalletClient<ChainTypeT extends ChainType | string>(provider: EthereumProvider, chainType: ChainTypeT, address: ViemAddress, walletClientConfig?: Partial<ViemWalletClientConfig>): Promise<GetWalletClientReturnType<ChainTypeT>>;
export declare function getDefaultWalletClient<ChainTypeT extends ChainType | string>(provider: EthereumProvider, chainType: ChainTypeT, walletClientConfig?: Partial<ViemWalletClientConfig>): Promise<GetWalletClientReturnType<ChainTypeT>>;
export declare function getTestClient<ChainTypeT extends ChainType | string>(provider: EthereumProvider, chainType: ChainTypeT, testClientConfig?: Partial<ViemTestClientConfig>): Promise<TestClient>;
//# sourceMappingURL=clients.d.ts.map