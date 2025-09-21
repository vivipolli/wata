import { assertHardhatInvariant, HardhatError, } from "@nomicfoundation/hardhat-errors";
import { addSecretToKeystore, decryptSecret, doesKeyExist, HmacKeyDecryptionError, removeSecretFromKeystore, validateHmac, } from "./encryption.js";
export class Keystore {
    #keystoreData;
    constructor(keystoreData) {
        this.#keystoreData = keystoreData;
    }
    toJSON() {
        return this.#keystoreData;
    }
    async listUnverifiedKeys() {
        // In this scenario the keystore is not validated for integrity, so the returned keys might have been tampered with.
        // This is acceptable if the keys are only listed for display purposes.
        // This risk is considered acceptable for this use case.
        return Object.keys(this.#keystoreData.secrets);
    }
    async hasKey(key, masterKey) {
        try {
            return doesKeyExist({
                masterKey,
                encryptedKeystore: this.#keystoreData,
                key,
            });
        }
        catch (error) {
            if (error instanceof HmacKeyDecryptionError) {
                throw new HardhatError(HardhatError.ERRORS.HARDHAT_KEYSTORE.GENERAL.INVALID_PASSWORD_OR_CORRUPTED_KEYSTORE);
            }
            throw error;
        }
    }
    async readValue(key, masterKey) {
        assertHardhatInvariant(key in this.#keystoreData.secrets, "Unknown key should never be read");
        try {
            return decryptSecret({
                masterKey,
                encryptedKeystore: this.#keystoreData,
                key,
            });
        }
        catch (error) {
            if (error instanceof HmacKeyDecryptionError) {
                throw new HardhatError(HardhatError.ERRORS.HARDHAT_KEYSTORE.GENERAL.INVALID_PASSWORD_OR_CORRUPTED_KEYSTORE);
            }
            throw error;
        }
    }
    async removeKey(key, masterKey) {
        assertHardhatInvariant(key in this.#keystoreData.secrets, "Unknown key should never be removed");
        try {
            this.#keystoreData = removeSecretFromKeystore({
                masterKey,
                encryptedKeystore: this.#keystoreData,
                keyToRemove: key,
            });
        }
        catch (error) {
            if (error instanceof HmacKeyDecryptionError) {
                throw new HardhatError(HardhatError.ERRORS.HARDHAT_KEYSTORE.GENERAL.INVALID_PASSWORD_OR_CORRUPTED_KEYSTORE);
            }
            throw error;
        }
    }
    async addNewValue(key, value, masterKey) {
        try {
            this.#keystoreData = addSecretToKeystore({
                masterKey,
                encryptedKeystore: this.#keystoreData,
                key,
                value,
            });
        }
        catch (error) {
            if (error instanceof HmacKeyDecryptionError) {
                throw new HardhatError(HardhatError.ERRORS.HARDHAT_KEYSTORE.GENERAL.INVALID_PASSWORD_OR_CORRUPTED_KEYSTORE);
            }
            throw error;
        }
    }
    async isValidPassword(masterKey) {
        try {
            validateHmac({
                masterKey,
                encryptedKeystore: this.#keystoreData,
            });
        }
        catch (error) {
            if (error instanceof HmacKeyDecryptionError) {
                throw new HardhatError(HardhatError.ERRORS.HARDHAT_KEYSTORE.GENERAL.INVALID_PASSWORD_OR_CORRUPTED_KEYSTORE);
            }
            throw error;
        }
    }
}
//# sourceMappingURL=keystore.js.map