import { HardhatError } from "@nomicfoundation/hardhat-errors";
import { move, remove } from "@nomicfoundation/hardhat-utils/fs";
import { createMasterKey, deriveMasterKeyFromKeystore, } from "../keystores/encryption.js";
import { askPassword, setNewPassword } from "../keystores/password.js";
import { UserDisplayMessages } from "../ui/user-display-messages.js";
import { setupKeystoreLoaderFrom, setupTmpKeystoreLoaderFrom, } from "../utils/setup-keystore-loader-from.js";
const taskChangePassword = async ({ dev }, hre) => {
    if (dev === true) {
        throw new HardhatError(HardhatError.ERRORS.HARDHAT_KEYSTORE.GENERAL.CANNOT_CHANGED_PASSWORD_FOR_DEV_KEYSTORE);
    }
    const keystoreLoader = setupKeystoreLoaderFrom(hre, false);
    const newKeystoreLoader = setupTmpKeystoreLoaderFrom(hre);
    await changePassword(keystoreLoader, newKeystoreLoader, hre.interruptions.requestSecretInput.bind(hre.interruptions));
};
export const changePassword = async (oldKeystoreLoader, newKeystoreLoader, requestSecretInput, consoleLog = console.log) => {
    if (!(await oldKeystoreLoader.isKeystoreInitialized())) {
        consoleLog(UserDisplayMessages.displayNoKeystoreSetErrorMessage(false));
        process.exitCode = 1;
        return;
    }
    consoleLog(UserDisplayMessages.unlockBeforePasswordChangeMessage());
    const oldKeystore = await oldKeystoreLoader.loadKeystore();
    const oldMasterKey = await deriveOldMasterKey(oldKeystore, requestSecretInput);
    const newMasterKey = await deriveNewMasterKey(requestSecretInput, consoleLog);
    await migrateNewKeystoreToTmpFile(oldKeystore, oldMasterKey, newKeystoreLoader, newMasterKey);
    try {
        // Overwrite the old keystore with the new one
        await move(newKeystoreLoader.getKeystoreFilePath(), oldKeystoreLoader.getKeystoreFilePath());
        consoleLog(UserDisplayMessages.passwordChangedSuccessMessage());
    }
    finally {
        // If anything goes wrong, delete the new temporary keystore file.
        // If the file does not exist, no error is thrown.
        await remove(newKeystoreLoader.getKeystoreFilePath());
    }
};
async function deriveOldMasterKey(oldKeystore, requestSecretInput) {
    const oldPassword = await askPassword(requestSecretInput);
    const oldMasterKey = deriveMasterKeyFromKeystore({
        encryptedKeystore: oldKeystore.toJSON(),
        password: oldPassword,
    });
    await oldKeystore.isValidPassword(oldMasterKey);
    return oldMasterKey;
}
async function deriveNewMasterKey(requestSecretInput, consoleLog) {
    const newPassword = await setNewPassword(requestSecretInput, consoleLog);
    const newMasterKey = createMasterKey({ password: newPassword });
    return newMasterKey;
}
async function migrateNewKeystoreToTmpFile(oldKeystore, oldMasterKey, newKeystoreLoader, newMasterKey) {
    const newKeystore = await newKeystoreLoader.createUnsavedKeystore(newMasterKey);
    const keys = await oldKeystore.listUnverifiedKeys();
    for (const key of keys) {
        const secret = await oldKeystore.readValue(key, oldMasterKey);
        await newKeystore.addNewValue(key, secret, newMasterKey.masterKey);
    }
    // Save it into the tmp file
    await newKeystoreLoader.saveKeystoreToFile();
}
export default taskChangePassword;
//# sourceMappingURL=change-password.js.map