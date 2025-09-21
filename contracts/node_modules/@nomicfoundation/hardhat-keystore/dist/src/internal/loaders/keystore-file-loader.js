import { assertHardhatInvariant } from "@nomicfoundation/hardhat-errors";
import { createEmptyEncryptedKeystore } from "../keystores/encryption.js";
import { Keystore } from "../keystores/keystore.js";
export class KeystoreFileLoader {
    #keystoreFilePath;
    #keystoreDevPasswordFilePath;
    #fileManager;
    #keystoreCache;
    constructor(keystoreFilePath, keystoreDevPasswordFilePath, fileManger) {
        this.#keystoreFilePath = keystoreFilePath;
        this.#keystoreDevPasswordFilePath = keystoreDevPasswordFilePath;
        this.#fileManager = fileManger;
        this.#keystoreCache = null;
    }
    getKeystoreFilePath() {
        return this.#keystoreFilePath;
    }
    getKeystoreDevPasswordFilePath() {
        return this.#keystoreDevPasswordFilePath;
    }
    async isKeystoreInitialized() {
        if (this.#keystoreCache !== null) {
            return true;
        }
        return this.#fileManager.fileExists(this.#keystoreFilePath);
    }
    async loadKeystore() {
        if (this.#keystoreCache !== null) {
            return this.#keystoreCache;
        }
        const keystoreFile = await this.#fileManager.readJsonFile(this.#keystoreFilePath);
        const keystore = new Keystore(keystoreFile);
        this.#keystoreCache = keystore;
        return keystore;
    }
    async createUnsavedKeystore({ masterKey, salt, }) {
        assertHardhatInvariant(this.#keystoreCache === null, "Cannot create a new Keystore when one is already loaded");
        const keystore = new Keystore(createEmptyEncryptedKeystore({ masterKey, salt }));
        this.#keystoreCache = keystore;
        return keystore;
    }
    async saveKeystoreToFile() {
        assertHardhatInvariant(this.#keystoreCache !== null, "Cannot save a keystore that has not been loaded or created");
        const keystoreFile = this.#keystoreCache.toJSON();
        await this.#fileManager.writeJsonFile(this.#keystoreFilePath, keystoreFile);
    }
}
//# sourceMappingURL=keystore-file-loader.js.map