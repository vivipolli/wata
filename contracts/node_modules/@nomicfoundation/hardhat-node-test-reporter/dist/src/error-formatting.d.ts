/**
 * Represents the result of successful parsing of a stack trace line.
 *
 * Example of a complete stack trace line:
 * `at Object.<anonymous> (file:///Users/user/project/test.js:20:34)`
 *
 * The `context` field indicates the namespace or function context in which the error occurred, if available.
 * Example: `Object.<anonymous>`
 *
 * The `location` field specifies the URI or path of the file where the error occurred.
 * Example: `file:///Users/user/project/test.js`
 *
 * The `lineNumber` and `columnNumber` fields represent the exact position within the file, if available.
 * Example: `20` (line number), `34` (column number)
 */
interface StackReference {
    context: string | undefined;
    location: string;
    lineNumber: string | undefined;
    columnNumber: string | undefined;
}
/**
 * Represents the result of attempting to parse a stack trace line. It consists
 * of the original stack trace line and the parsed stack reference, if successful.
 */
interface StackLine {
    line: string;
    reference: StackReference | undefined;
}
export declare function formatError(error: Error): string;
/**
 * This function takes an error and formats it into a human-readable string.
 *
 * The error is formatted as follows:
 * - The error message is the beginning of the error stack up to the first
 *   line that starts with "at" if it contains the original error message.
 *   Otherwise, the original error message is used as is. The error message is
 *   prefixed with the prefix, if provided. The error message is printed in red
 *   if it's the first error in the error chain, otherwise it's printed in grey.
 *   The following strings are removed from the error message:
 *   - "[ERR_ASSERTION]"
 *   - "[ERR_TEST_FAILURE]"
 * - If the error is diffable (i.e. it has `actual` and `expected` properties),
 *   the diff is printed.
 * - The error stack is formatted as a series of references (lines starting with
 *   "at"). All the node references and test runner internal references are
 *   removed. The location part of the stack is normalized. The stack is printed
 *   in grey, indented by 4 spaces.
 * - If the error has a cause, the cause is formatted in the same way,
 *   recursively. Formatting a cause increases the depth by 1. If the depth is
 *   greater than 3, the cause is replaced by an error indicating that the error
 *   chain has been truncated. The formatted cause is printed in grey, indented
 *   by 2 spaces.
 * - If the error is an aggregate, all the errors in the aggregate are formatted
 *   in the same way, recursively. Then, they are printed in grey, indented by 2
 *   spaces.
 *
 * @param error - The error to format
 * @param prefix - A prefix to add to the error message
 * @param depth - The depth of the error in the error chain
 * @returns The formatted error
 */
export declare function formatSingleError(error: Error, prefix?: string, depth?: number): string;
/**
 * This function parses a single stack trace line. It attempts to extract a
 * stack reference from the line, and returns a parsed StackLine.
 *
 * Stack trace lines from which a reference can be extracted are of the form:
 * - at <context> (<location>:<lineNumber>:<columnNumber>)
 * - at <context> (<location>:<lineNumber>)
 * - at <context> (<location>)
 * - at <location>:<lineNumber>:<columnNumber>
 * - at <location>:<lineNumber>
 * - at <location>
 */
export declare function parseStackLine(line: string): StackLine;
export declare function formatStackLine({ line, reference }: StackLine): string;
/**
 * This functions normlizes a location string by:
 * - Turning file URLs into file paths
 * - Turning absolute paths into relative paths if they are inside the current
 *   working directory
 *
 * @param location - The location string to format
 * @param cwd - The current working directory, exposed for testing
 * @param sep - The path separator, exposed for testing
 * @param windows - Whether the platform is windows, exposed for testing
 * @returns The formatted location string
 */
export declare function formatLocation(location: string, cwd?: string, sep?: string, windows?: boolean): string;
export {};
//# sourceMappingURL=error-formatting.d.ts.map