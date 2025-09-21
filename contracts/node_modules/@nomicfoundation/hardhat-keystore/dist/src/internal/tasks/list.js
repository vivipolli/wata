import { UserDisplayMessages } from "../ui/user-display-messages.js";
import { setupKeystoreLoaderFrom } from "../utils/setup-keystore-loader-from.js";
const taskList = async (args, hre) => {
    const keystoreLoader = setupKeystoreLoaderFrom(hre, args.dev);
    await list(args, keystoreLoader);
};
export const list = async ({ dev }, keystoreLoader, consoleLog = console.log) => {
    if (!(await keystoreLoader.isKeystoreInitialized())) {
        consoleLog(UserDisplayMessages.displayNoKeystoreSetErrorMessage(dev));
        process.exitCode = 1;
        return;
    }
    const keystore = await keystoreLoader.loadKeystore();
    const keys = await keystore.listUnverifiedKeys();
    if (keys.length === 0) {
        consoleLog(UserDisplayMessages.displayNoKeysInfoMessage(dev));
        return;
    }
    consoleLog(UserDisplayMessages.displayKeyListInfoMessage(keys, dev));
};
export default taskList;
//# sourceMappingURL=list.js.map