export declare const KEYSTORE_VERSION: "hardhat-v3-keystore-1";
export declare const PASSWORD_NORMALIZATION_FORM: "NFKC";
export declare const KEY_DERIVARION_ALGORITHM: "scrypt";
export declare const KEY_DERIVATION_PARAM_N: 131072;
export declare const KEY_DERIVATION_PARAM_R: 8;
export declare const KEY_DERIVATION_PARAM_P: 1;
export declare const KEY_DERIVATION_SALT_LENGTH_BYTES: 32;
export declare const MASTER_KEY_LENGTH_BITS: 256;
export declare const HMAC_ALGORITHM: "HMAC-SHA-256";
export declare const HMAC_KEY_LENGTH_BITS: 256;
export declare const DATA_ENCRYPTION_ALGORITHM: "AES-GCM-SIV";
export declare const DATA_ENCRYPTION_KEY_LENGTH_BITS: 256;
export declare const DATA_ENCRYPTION_IV_LENGTH_BYTES: 12;
/**
 * This interface represents an encrypted keystore.
 *
 * Every data buffer here is represented as a hex string (withoyt "0x" prefix).
 */
export interface EncryptedKeystore {
    version: typeof KEYSTORE_VERSION;
    crypto: {
        masterKeyDerivation: {
            algorithm: typeof KEY_DERIVARION_ALGORITHM;
            paramN: typeof KEY_DERIVATION_PARAM_N;
            paramP: typeof KEY_DERIVATION_PARAM_P;
            paramR: typeof KEY_DERIVATION_PARAM_R;
            unicodeNormalizationForm: typeof PASSWORD_NORMALIZATION_FORM;
            keyLength: typeof MASTER_KEY_LENGTH_BITS;
            salt: string;
        };
        encryption: {
            algorithm: typeof DATA_ENCRYPTION_ALGORITHM;
            keyLength: typeof DATA_ENCRYPTION_KEY_LENGTH_BITS;
        };
        hmac: {
            algorithm: typeof HMAC_ALGORITHM;
            keyLength: typeof HMAC_KEY_LENGTH_BITS;
        };
    };
    dataEncryptionKey: SerializedEncryptedData;
    hmacKey: SerializedEncryptedData;
    hmac: string;
    secrets: Record<string, SerializedEncryptedData>;
}
/**
 * This interface represents an encrypted data buffer.
 */
export interface EncryptedData {
    /**
     * The initialization vector used to encrypt the data.
     */
    iv: Uint8Array;
    /**
     * The encrypted data buffer.
     */
    cypherText: Uint8Array;
}
/**
 * The hex-encoding serialization of EncryptedData.
 */
export interface SerializedEncryptedData {
    iv: string;
    cypherText: string;
}
/**
 * Serializes an EncryptedData object into a SerializedEncryptedData object.
 */
export declare function serializeEncryptedData(data: EncryptedData): SerializedEncryptedData;
/**
 * Deserializes a SerializedEncryptedData object into an EncryptedData object.
 */
export declare function deserializeEncryptedData(serializedData: SerializedEncryptedData): EncryptedData;
/**
 * Uses JSON.stringify with a custom replacer to make sure that a
 * JsonWithNumbersAndStrings is serialized deterministically.
 *
 * This function only supports objects whose values are numbers, strings, or
 * objects with the same constraints.
 */
export declare function deterministicJsonStringify<ObjectT extends object>(obj: ObjectT): string;
declare abstract class CustomError extends Error {
    stack: string;
    constructor(message: string, cause?: Error);
}
export declare class UnsupportedTypeInDeterministicJsonError extends CustomError {
    readonly type: string;
    constructor(type: string);
}
export declare class DecryptionError extends CustomError {
    constructor(cause?: Error);
}
export declare class SecretNotFoundError extends CustomError {
    readonly key: string;
    constructor(key: string);
}
export declare class HmacKeyDecryptionError extends CustomError {
    constructor(cause?: Error);
}
export declare class InvalidHmacError extends CustomError {
    constructor();
}
/**
 * Encrypts the utf-8 encoded value using the master key, and a new random iv.
 *
 * @param encryptionKey The encryption key to use.
 * @param value The value to encrypt, which will be utf-8 encoded.
 * @returns An object containing the iv and cypherText.
 *
 * @remarks
 * The random IV is only 12 bytes, so we are assuming that no more than 2^20 encryptions are done with the same key
 * as the probability of IV collision reaches 2^-57 at that point.
 */
export declare function encryptUtf8String({ encryptionKey, value, }: {
    encryptionKey: Uint8Array;
    value: string;
}): EncryptedData;
/**
 * Decrypts an utf-8 string using the master key and the iv.
 *
 * @param encryptionKey The encryption key to use.
 * @param iv The iv to use.
 * @param cypherText The cypherText to decrypt, which will then be utf-8
 * decoded.
 * @returns The decrypted value.
 */
export declare function decryptUtf8String({ encryptionKey, data, }: {
    encryptionKey: Uint8Array;
    data: EncryptedData;
}): string;
/**
 * Creates a new master key from the password. This function can be called
 * multiple times to derive new keys from the same password.
 *
 * @param password The user's password.
 * @returns An object containing the salt and master key.
 */
export declare function createMasterKey({ password }: {
    password: string;
}): {
    salt: Uint8Array;
    masterKey: Uint8Array;
};
/**
 * Creates an empty EncryptedKeystore.
 *
 * To add and remove secrets to it see `addSecretToKeystore` and
 * `removeSecretFromKeystore`.
 *
 * @param masterKey The master key to use.
 * @param salt The salt of the master key.
 * @returns The empty EncryptedKeystore.
 */
export declare function createEmptyEncryptedKeystore({ masterKey, salt, }: {
    masterKey: Uint8Array;
    salt: Uint8Array;
}): EncryptedKeystore;
/**
 * Derives the master key from an existing keystore, using the user's password.
 *
 * @param password The user's password.
 * @param encryptedKeystore The keystore, where the master key's salt is stored.
 * @returns The derived master key. This value is safe to keep in memory.
 */
export declare function deriveMasterKeyFromKeystore({ password, encryptedKeystore, }: {
    password: string;
    encryptedKeystore: EncryptedKeystore;
}): Uint8Array;
/**
 * Checks if the specified key exists in the provided encrypted keystore.
 *
 * @param masterKey The master key to use.
 * @param encryptedKeystore - The encrypted keystore object containing the secrets.
 * @param key - The name of the secret to check for existence.
 * @returns True if the key is present in the keystore, otherwise false.
 *
 * @remarks
 * This function first calls `validateHmac` to verify the cryptographic integrity of
 * the keystore before checking for the existence of the specified key.
 */
export declare function doesKeyExist({ masterKey, encryptedKeystore, key, }: {
    masterKey: Uint8Array;
    encryptedKeystore: EncryptedKeystore;
    key: string;
}): boolean;
/**
 * Adds a secret to an existing keystore.
 *
 * @param masterKey The master key to use.
 * @param encryptedKeystore The keystore to add the secret to.
 * @param key The key of the secret to add.
 * @param value The value of the secret to add.
 * @returns A new EncryptedKeystore, where the secret has been added.
 */
export declare function addSecretToKeystore({ masterKey, encryptedKeystore, key, value, }: {
    masterKey: Uint8Array;
    encryptedKeystore: EncryptedKeystore;
    key: string;
    value: string;
}): EncryptedKeystore;
/**
 * Removes a secret from an existing keystore.
 *
 * @param masterKey The master key to use.
 * @param encryptedKeystore The keystore to remove the secret from.
 * @param keyToRemove The key of the secret to remove.
 * @returns A new EncryptedKeystore, where the secret has been removed.
 */
export declare function removeSecretFromKeystore({ masterKey, encryptedKeystore, keyToRemove, }: {
    masterKey: Uint8Array;
    encryptedKeystore: EncryptedKeystore;
    keyToRemove: string;
}): EncryptedKeystore;
/**
 * Decrypts an individual secret from the EncryptedKeystoreValuesEnvelope.
 *
 * @param masterKey The master key to use.
 * @param valuesEnvelope The EncryptedKeystoreValuesEnvelope, where the secret
 * is stored.
 * @param key The key of the secret to decrypt.
 * @returns The decrypted secret. Do not keep this value in memory.
 */
export declare function decryptSecret({ masterKey, encryptedKeystore, key, }: {
    masterKey: Uint8Array;
    encryptedKeystore: EncryptedKeystore;
    key: string;
}): string;
/**
 * Generates the hmac of an encrypted keystore.
 *
 * @param masterKey The keystore's master key to use.
 * @param encryptedKeystore The keystore to generate the hmac for, without the
 * hmac field.
 * @returns The hmac.
 */
export declare function generateEncryptedKeystoreHmac({ masterKey, encryptedKeystore, }: {
    masterKey: Uint8Array;
    encryptedKeystore: Omit<EncryptedKeystore, "hmac">;
}): Uint8Array;
/**
 * Throws an error if the hmac present in the encrypted keystore doesn't match
 * a newly generated one.
 *
 * @param masterKey The keystore's master key to use.
 * @param encryptedKeystore The keystore whose hmac should be validated.
 */
export declare function validateHmac({ masterKey, encryptedKeystore, }: {
    masterKey: Uint8Array;
    encryptedKeystore: EncryptedKeystore;
}): void;
export {};
//# sourceMappingURL=encryption.d.ts.map