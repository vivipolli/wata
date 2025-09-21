import type { GlobalDiagnostics } from "./diagnostics.js";
import type { TestEventData } from "./types.js";
export declare const INFO_SYMBOL: string;
export declare const SUCCESS_SYMBOL: string;
export interface Failure {
    index: number;
    testFail: TestEventData["test:fail"];
    contextStack: Array<TestEventData["test:start"]>;
}
export declare function formatTestContext(contextStack: Array<TestEventData["test:start"]>, prefix?: string, suffix?: string, isSkipped?: boolean): string;
export declare function formatTestPass(passData: TestEventData["test:pass"]): string;
export declare function formatTestCancelledByParentFailure(failure: Failure): string;
export declare function formatTestFailure(failure: Failure): string;
export declare function formatFailureReason(failure: Failure): string;
export declare function formatSlowTestInfo(durationMs: number): string;
export declare function formatGlobalDiagnostics(diagnostics: GlobalDiagnostics): string;
export declare function formatUnusedDiagnostics(unusedDiagnostics: Array<TestEventData["test:diagnostic"]>, testOnlyMessage?: string): string;
export declare function indent(str: string, spaces: number): string;
//# sourceMappingURL=formatting.d.ts.map