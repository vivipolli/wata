import type { KeystoreLoader } from "../types.js";
import type { HardhatConfig } from "hardhat/types/config";
/**
 * Factory for setting up the key loader based on the
 * keystore file path from the hre config.
 */
export declare function setupKeystoreLoaderFrom({ config, }: {
    config: HardhatConfig;
}, isDevKeystore: boolean): KeystoreLoader;
export declare function setupTmpKeystoreLoaderFrom({ config, }: {
    config: HardhatConfig;
}): KeystoreLoader;
//# sourceMappingURL=setup-keystore-loader-from.d.ts.map