import "hardhat/types/config";
declare module "hardhat/types/config" {
    interface TestPathsUserConfig {
        nodejs?: string;
    }
    interface TestPathsConfig {
        nodejs: string;
    }
}
//# sourceMappingURL=type-extensions.d.ts.map