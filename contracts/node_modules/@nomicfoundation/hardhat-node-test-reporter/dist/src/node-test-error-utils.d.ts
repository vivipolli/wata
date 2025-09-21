/**
 * Returns true if the error represents that a test/suite failed because one of
 * its subtests failed.
 */
export declare function isSubtestFailedError(error: Error): boolean;
/**
 * Returns true if the error represents that a test was cancelled because its
 * parent failed.
 */
export declare function isCancelledByParentError(error: Error): boolean;
/**
 * Returns true if the error represents that an entire file execution failed,
 * outside of the context of any particular test.
 */
export declare function isTestFileExecutionFailureError(error: Error): error is Error & {
    exitCode: number;
};
/**
 * Cleans the test:fail event error, as it's usually wrapped by a node:test
 * error.
 */
export declare function cleanupTestFailError(error: Error): Error;
//# sourceMappingURL=node-test-error-utils.d.ts.map