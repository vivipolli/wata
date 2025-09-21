import debug from "debug";
import { getDevKeystoreFilePath, getDevKeystorePasswordFilePath, getKeystoreFilePath, } from "../utils/get-keystore-file-path.js";
const log = debug("hardhat:keystore:hooks:config");
export default async () => {
    const handlers = {
        resolveUserConfig: async (userConfig, resolveConfigurationVariable, next) => {
            const resolvedConfig = await next(userConfig, resolveConfigurationVariable);
            const defaultKeystoreFilePath = await getKeystoreFilePath();
            const defaultDevKeystoreFilePath = await getDevKeystoreFilePath();
            const defaultDevKeystorePasswordFilePath = await getDevKeystorePasswordFilePath();
            log(`path to keystore file: ${defaultKeystoreFilePath}`);
            return {
                ...resolvedConfig,
                keystore: {
                    filePath: defaultKeystoreFilePath,
                    devFilePath: defaultDevKeystoreFilePath,
                    devPasswordFilePath: defaultDevKeystorePasswordFilePath,
                },
            };
        },
    };
    return handlers;
};
//# sourceMappingURL=config.js.map