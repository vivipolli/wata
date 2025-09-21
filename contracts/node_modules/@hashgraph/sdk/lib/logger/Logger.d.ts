/**
 * A Logger class for logging messages in the Hiero JavaScript SDK.
 * This class provides a flexible logging mechanism that can log messages
 * to various outputs, including the console and log files. It supports
 * different log levels (e.g., trace, debug, info, warn, error, fatal)
 * and allows for configuration of logging behavior, such as synchronous
 * writes and file management.
 *
 * The Logger can be initialized with a specific log level, a log file path,
 * and options for synchronous writes and file synchronization. It also
 * provides methods to change the logging level and to enable or disable
 * silent mode, which suppresses all log messages.
 */
export default class Logger {
    /**
     * @param {LogLevel} level
     * @param {string} logFile the file to log to, if empty, logs to console
     * @param {boolean} sync perform writes synchronously (similar to console.log)
     * @param {boolean} fsync perform a fsyncSync every time a write is completed
     * @param {boolean} mkdir ensure directory for dest file exists when true (default false)
     * @param {number} minLength the minimum length of the internal buffer that is required to be full before flushing
     */
    constructor(level: LogLevel, logFile?: string, sync?: boolean, fsync?: boolean, mkdir?: boolean, minLength?: number);
    /**
     * @private
     * @type {import("pino").Logger}
     */
    private _logger;
    /**
     * @private
     * @type {LogLevel}
     */
    private _previousLevel;
    /**
     * Set logger
     *
     * @public
     * @param {import("pino").Logger} logger
     * @returns {this}
     */
    public setLogger(logger: import("pino").Logger): this;
    /**
     * Set log level
     *
     * @public
     * @param {LogLevel} level
     * @returns {this}
     */
    public setLevel(level: LogLevel): this;
    /**
     * Get logging level
     *
     * @public
     * @returns {LogLevel}
     */
    public get level(): LogLevel;
    /**
     * Get logging level
     *
     * @public
     * @returns {{[level: number]: string}}
     */
    public get levels(): {
        [level: number]: string;
    };
    /**
     * Set silent mode on/off
     *
     * @public
     * @description If set to true, the logger will not display any log messages
     * - This can also be achieved by calling `.setLevel(LogLevel.Silent)`
     * @param {boolean} silent
     * @returns {this}
     */
    public setSilent(silent: boolean): this;
    /**
     * Get silent mode
     *
     * @public
     * @returns {boolean}
     */
    public get silent(): boolean;
    /**
     * Log trace
     *
     * @public
     * @param {string} message
     * @returns {void}
     */
    public trace(message: string): void;
    /**
     * Log debug
     *
     * @public
     * @param {string} message
     * @returns {void}
     */
    public debug(message: string): void;
    /**
     * Log info
     *
     * @public
     * @param {string} message
     * @returns {void}
     */
    public info(message: string): void;
    /**
     * Log warn
     *
     * @public
     * @param {string} message
     * @returns {void}
     */
    public warn(message: string): void;
    /**
     * Log error
     *
     * @public
     * @param {string} message
     * @returns {void}
     */
    public error(message: string): void;
    /**
     * Log fatal
     *
     * @public
     * @param {string} message
     * @returns {void}
     */
    public fatal(message: string): void;
}
import LogLevel from "./LogLevel.js";
