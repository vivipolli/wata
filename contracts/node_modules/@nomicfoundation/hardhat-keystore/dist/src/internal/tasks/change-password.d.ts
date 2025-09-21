import type { KeystoreConsoleLog, KeystoreLoader, KeystoreRequestSecretInput } from "../types.js";
import type { NewTaskActionFunction } from "hardhat/types/tasks";
interface TaskChangePasswordArguments {
    dev: boolean;
}
declare const taskChangePassword: NewTaskActionFunction<TaskChangePasswordArguments>;
export declare const changePassword: (oldKeystoreLoader: KeystoreLoader, newKeystoreLoader: KeystoreLoader, requestSecretInput: KeystoreRequestSecretInput, consoleLog?: KeystoreConsoleLog) => Promise<void>;
export default taskChangePassword;
//# sourceMappingURL=change-password.d.ts.map