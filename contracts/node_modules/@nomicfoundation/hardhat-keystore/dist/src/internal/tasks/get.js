import { deriveMasterKeyFromKeystore } from "../keystores/encryption.js";
import { getPasswordHandlers } from "../keystores/password.js";
import { UserDisplayMessages } from "../ui/user-display-messages.js";
import { setupKeystoreLoaderFrom } from "../utils/setup-keystore-loader-from.js";
const taskGet = async (args, hre) => {
    const keystoreLoader = setupKeystoreLoaderFrom(hre, args.dev);
    await get(args, keystoreLoader, hre.interruptions.requestSecretInput.bind(hre.interruptions));
};
export const get = async ({ dev, key }, keystoreLoader, requestSecretInput, consoleLog = console.log) => {
    if (!(await keystoreLoader.isKeystoreInitialized())) {
        consoleLog(UserDisplayMessages.displayNoKeystoreSetErrorMessage(dev));
        process.exitCode = 1;
        return;
    }
    const keystore = await keystoreLoader.loadKeystore();
    const { askPassword } = getPasswordHandlers(requestSecretInput, consoleLog, dev, keystoreLoader.getKeystoreDevPasswordFilePath());
    const password = await askPassword();
    const masterKey = deriveMasterKeyFromKeystore({
        encryptedKeystore: keystore.toJSON(),
        password,
    });
    if (!(await keystore.hasKey(key, masterKey))) {
        consoleLog(UserDisplayMessages.displayKeyNotFoundErrorMessage(key, dev));
        process.exitCode = 1;
        return;
    }
    const value = await keystore.readValue(key, masterKey);
    consoleLog(UserDisplayMessages.displayValueInfoMessage(value));
};
export default taskGet;
//# sourceMappingURL=get.js.map