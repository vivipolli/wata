import type { FileManager, KeystoreLoader } from "../types.js";
import { Keystore } from "../keystores/keystore.js";
export declare class KeystoreFileLoader implements KeystoreLoader {
    #private;
    constructor(keystoreFilePath: string, keystoreDevPasswordFilePath: string, fileManger: FileManager);
    getKeystoreFilePath(): string;
    getKeystoreDevPasswordFilePath(): string;
    isKeystoreInitialized(): Promise<boolean>;
    loadKeystore(): Promise<Keystore>;
    createUnsavedKeystore({ masterKey, salt, }: {
        masterKey: Uint8Array;
        salt: Uint8Array;
    }): Promise<Keystore>;
    saveKeystoreToFile(): Promise<void>;
}
//# sourceMappingURL=keystore-file-loader.d.ts.map