import { PLUGIN_ID } from "../constants.js";
import { createMasterKey, deriveMasterKeyFromKeystore, } from "../keystores/encryption.js";
import { getPasswordHandlers } from "../keystores/password.js";
import { UserDisplayMessages } from "../ui/user-display-messages.js";
import { setupKeystoreLoaderFrom } from "../utils/setup-keystore-loader-from.js";
import { validateKey } from "../utils/validate-key.js";
const taskSet = async (args, hre) => {
    const keystoreLoader = setupKeystoreLoaderFrom(hre, args.dev);
    await set(args, keystoreLoader, hre.interruptions.requestSecretInput.bind(hre.interruptions));
};
export const set = async ({ dev, force, key }, keystoreLoader, requestSecretInput, consoleLog = console.log) => {
    if (!(await validateKey(key))) {
        consoleLog(UserDisplayMessages.displayInvalidKeyErrorMessage(key));
        process.exitCode = 1;
        return;
    }
    const isKeystoreInitialized = await keystoreLoader.isKeystoreInitialized();
    const { askPassword, setUpPassword } = getPasswordHandlers(requestSecretInput, consoleLog, dev, keystoreLoader.getKeystoreDevPasswordFilePath());
    const password = isKeystoreInitialized
        ? await askPassword()
        : await setUpPassword();
    if (isKeystoreInitialized === false) {
        await keystoreLoader.createUnsavedKeystore(createMasterKey({ password }));
    }
    const keystore = await keystoreLoader.loadKeystore();
    const masterKey = deriveMasterKeyFromKeystore({
        encryptedKeystore: keystore.toJSON(),
        password,
    });
    if (!force && (await keystore.hasKey(key, masterKey))) {
        consoleLog(UserDisplayMessages.displayKeyAlreadyExistsWarning(key, dev));
        process.exitCode = 1;
        return;
    }
    const secret = await requestSecretInput(PLUGIN_ID, UserDisplayMessages.enterSecretMessage(dev));
    if (secret.length === 0) {
        consoleLog(UserDisplayMessages.displaySecretCannotBeEmptyErrorMessage());
        process.exitCode = 1;
        return;
    }
    await keystore.addNewValue(key, secret, masterKey);
    await keystoreLoader.saveKeystoreToFile();
    consoleLog(UserDisplayMessages.displayKeySetInfoMessage(key, dev));
};
export default taskSet;
//# sourceMappingURL=set.js.map