import type { TestEventData } from "./types.js";
export interface GlobalDiagnostics {
    tests: number;
    suites: number;
    pass: number;
    fail: number;
    cancelled: number;
    skipped: number;
    todo: number;
    duration_ms: number;
}
/**
 * This function receives all the diagnostics that have been emitted by the test
 * run, and tries to parse a set of well-known global diagnostics that node:test
 * emits to report the overall status of the test run.
 *
 * If the diagnostics are not recognized, or can't be parsed effectively, they
 * are returned as `unsaidDiagnostics`, so that we can print them at the end.
 */
export declare function processGlobalDiagnostics(diagnostics: Array<TestEventData["test:diagnostic"]>): {
    globalDiagnostics: GlobalDiagnostics;
    unusedDiagnostics: Array<TestEventData["test:diagnostic"]>;
};
//# sourceMappingURL=diagnostics.d.ts.map