import type { Keystore as KeystoreI } from "../types.js";
import { type EncryptedKeystore } from "./encryption.js";
export declare class Keystore implements KeystoreI {
    #private;
    constructor(keystoreData: EncryptedKeystore);
    toJSON(): EncryptedKeystore;
    listUnverifiedKeys(): Promise<string[]>;
    hasKey(key: string, masterKey: Uint8Array): Promise<boolean>;
    readValue(key: string, masterKey: Uint8Array): Promise<string>;
    removeKey(key: string, masterKey: Uint8Array): Promise<void>;
    addNewValue(key: string, value: string, masterKey: Uint8Array): Promise<void>;
    isValidPassword(masterKey: Uint8Array): Promise<void>;
}
//# sourceMappingURL=keystore.d.ts.map