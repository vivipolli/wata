import type { KeystoreConsoleLog, KeystoreLoader, KeystoreRequestSecretInput } from "../types.js";
import type { NewTaskActionFunction } from "hardhat/types/tasks";
interface TaskGetArguments {
    dev: boolean;
    key: string;
}
declare const taskGet: NewTaskActionFunction<TaskGetArguments>;
export declare const get: ({ dev, key }: TaskGetArguments, keystoreLoader: KeystoreLoader, requestSecretInput: KeystoreRequestSecretInput, consoleLog?: KeystoreConsoleLog) => Promise<void>;
export default taskGet;
//# sourceMappingURL=get.d.ts.map