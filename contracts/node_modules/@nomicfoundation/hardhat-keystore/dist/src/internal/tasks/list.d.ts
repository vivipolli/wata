import type { KeystoreConsoleLog, KeystoreLoader } from "../types.js";
import type { NewTaskActionFunction } from "hardhat/types/tasks";
interface TaskListArguments {
    dev: boolean;
}
declare const taskList: NewTaskActionFunction<TaskListArguments>;
export declare const list: ({ dev }: TaskListArguments, keystoreLoader: KeystoreLoader, consoleLog?: KeystoreConsoleLog) => Promise<void>;
export default taskList;
//# sourceMappingURL=list.d.ts.map