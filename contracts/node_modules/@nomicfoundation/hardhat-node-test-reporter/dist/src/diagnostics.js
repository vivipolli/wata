/**
 * This function receives all the diagnostics that have been emitted by the test
 * run, and tries to parse a set of well-known global diagnostics that node:test
 * emits to report the overall status of the test run.
 *
 * If the diagnostics are not recognized, or can't be parsed effectively, they
 * are returned as `unsaidDiagnostics`, so that we can print them at the end.
 */
export function processGlobalDiagnostics(diagnostics) {
    const globalDiagnostics = {
        tests: 0,
        suites: 0,
        pass: 0,
        fail: 0,
        cancelled: 0,
        skipped: 0,
        todo: 0,
        duration_ms: 0,
    };
    const unusedDiagnostics = [];
    for (const diagnostic of diagnostics) {
        if (diagnostic.nesting !== 0) {
            unusedDiagnostics.push(diagnostic);
            continue;
        }
        const [name, numberString] = diagnostic.message.split(" ");
        if (!(name in globalDiagnostics) || numberString === undefined) {
            unusedDiagnostics.push(diagnostic);
            continue;
        }
        /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions --
        We checked that this is a key of globalDiagnostics */
        const nameAsKey = name;
        try {
            const value = parseFloat(numberString);
            globalDiagnostics[nameAsKey] = value;
        }
        catch {
            // If this threw, the format of the diagnostic isn't what we expected,
            // so we just print it as an unused diagnostic.
            unusedDiagnostics.push(diagnostic);
        }
    }
    return { globalDiagnostics, unusedDiagnostics };
}
//# sourceMappingURL=diagnostics.js.map