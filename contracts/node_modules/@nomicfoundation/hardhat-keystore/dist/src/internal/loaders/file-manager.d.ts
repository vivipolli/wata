import type { EncryptedKeystore } from "../keystores/encryption.js";
import type { FileManager } from "../types.js";
export declare class FileManagerImpl implements FileManager {
    fileExists(absolutePath: string): Promise<boolean>;
    writeJsonFile(absolutePathToFile: string, keystoreFile: EncryptedKeystore): Promise<void>;
    readJsonFile(absolutePathToFile: string): Promise<EncryptedKeystore>;
}
//# sourceMappingURL=file-manager.d.ts.map