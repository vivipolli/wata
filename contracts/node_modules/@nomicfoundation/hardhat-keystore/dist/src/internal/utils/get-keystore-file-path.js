import path from "node:path";
import { getConfigDir } from "@nomicfoundation/hardhat-utils/global-dir";
/**
 * Get the path for the keystore in the Hardhat global config directory.
 */
export async function getKeystoreFilePath() {
    const configDirPath = await getConfigDir();
    return path.join(configDirPath, "keystore.json");
}
/**
 * Get the path for the development keystore in the Hardhat global config directory.
 */
export async function getDevKeystoreFilePath() {
    const configDirPath = await getConfigDir();
    return path.join(configDirPath, "dev.keystore.json");
}
/**
 * Get the path for the file containing the unencrypted password for the development keystore in the Hardhat global config directory.
 */
export async function getDevKeystorePasswordFilePath() {
    const configDirPath = await getConfigDir();
    return path.join(configDirPath, "hardhat.checksum");
}
//# sourceMappingURL=get-keystore-file-path.js.map