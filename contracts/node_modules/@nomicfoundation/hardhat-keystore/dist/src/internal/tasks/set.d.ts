import type { KeystoreConsoleLog, KeystoreLoader, KeystoreRequestSecretInput } from "../types.js";
import type { NewTaskActionFunction } from "hardhat/types/tasks";
interface TaskGetArguments {
    dev: boolean;
    force: boolean;
    key: string;
}
declare const taskSet: NewTaskActionFunction<TaskGetArguments>;
export declare const set: ({ dev, force, key }: TaskGetArguments, keystoreLoader: KeystoreLoader, requestSecretInput: KeystoreRequestSecretInput, consoleLog?: KeystoreConsoleLog) => Promise<void>;
export default taskSet;
//# sourceMappingURL=set.d.ts.map