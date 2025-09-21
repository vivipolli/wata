import "hardhat/types/config";
declare module "hardhat/types/config" {
    interface HardhatConfig {
        keystore: {
            filePath: string;
            devFilePath: string;
            devPasswordFilePath: string;
        };
    }
}
//# sourceMappingURL=type-extensions.d.ts.map