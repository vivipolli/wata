import type { KeystoreConsoleLog } from "../types.js";
import type { HardhatRuntimeEnvironment } from "hardhat/types/hre";
import type { NewTaskActionFunction } from "hardhat/types/tasks";
interface TaskPathArguments {
    dev: boolean;
}
declare const taskPath: NewTaskActionFunction<TaskPathArguments>;
export declare const path: ({ dev }: TaskPathArguments, hre: HardhatRuntimeEnvironment, consoleLog?: KeystoreConsoleLog) => Promise<void>;
export default taskPath;
//# sourceMappingURL=path.d.ts.map