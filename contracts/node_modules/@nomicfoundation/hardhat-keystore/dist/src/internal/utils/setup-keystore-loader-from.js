import { FileManagerImpl } from "../loaders/file-manager.js";
import { KeystoreFileLoader } from "../loaders/keystore-file-loader.js";
/**
 * Factory for setting up the key loader based on the
 * keystore file path from the hre config.
 */
export function setupKeystoreLoaderFrom({ config, }, isDevKeystore) {
    const keystoreFilePath = isDevKeystore
        ? config.keystore.devFilePath
        : config.keystore.filePath;
    const fileManager = new FileManagerImpl();
    return new KeystoreFileLoader(keystoreFilePath, config.keystore.devPasswordFilePath, fileManager);
}
export function setupTmpKeystoreLoaderFrom({ config, }) {
    const keystoreFilePath = `${config.keystore.filePath}.tmp`;
    const fileManager = new FileManagerImpl();
    return new KeystoreFileLoader(keystoreFilePath, config.keystore.devFilePath, fileManager);
}
//# sourceMappingURL=setup-keystore-loader-from.js.map