import type { KeystoreConsoleLog, KeystoreLoader, KeystoreRequestSecretInput } from "../types.js";
import type { NewTaskActionFunction } from "hardhat/types/tasks";
interface TaskDeleteArguments {
    dev: boolean;
    force: boolean;
    key: string;
}
declare const taskDelete: NewTaskActionFunction<TaskDeleteArguments>;
export declare const remove: ({ dev, force, key }: TaskDeleteArguments, keystoreLoader: KeystoreLoader, requestSecretInput: KeystoreRequestSecretInput, consoleLog?: KeystoreConsoleLog) => Promise<void>;
export default taskDelete;
//# sourceMappingURL=delete.d.ts.map