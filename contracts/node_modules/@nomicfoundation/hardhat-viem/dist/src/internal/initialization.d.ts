import type { HardhatViemHelpers } from "../types.js";
import type { ArtifactManager } from "hardhat/types/artifacts";
import type { ChainType } from "hardhat/types/network";
import type { EthereumProvider } from "hardhat/types/providers";
export declare function initializeViem<ChainTypeT extends ChainType | string>(chainType: ChainTypeT, provider: EthereumProvider, artifactManager: ArtifactManager): HardhatViemHelpers<ChainTypeT>;
//# sourceMappingURL=initialization.d.ts.map