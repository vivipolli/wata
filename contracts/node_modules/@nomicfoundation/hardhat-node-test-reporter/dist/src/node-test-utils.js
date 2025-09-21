export function getTestRunOptions() {
    const only = process.execArgv.includes("--test-only");
    return { only };
}
export function isTopLevelFilePassEvent(event) {
    return (event.type === "test:pass" &&
        event.data.nesting === 0 &&
        event.data.line === 1 &&
        event.data.column === 1);
}
//# sourceMappingURL=node-test-utils.js.map