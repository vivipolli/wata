"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _pino = _interopRequireDefault(require("pino"));
var _LogLevel = _interopRequireDefault(require("./LogLevel.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

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
class Logger {
  /**
   * @param {LogLevel} level
   * @param {string} logFile the file to log to, if empty, logs to console
   * @param {boolean} sync perform writes synchronously (similar to console.log)
   * @param {boolean} fsync perform a fsyncSync every time a write is completed
   * @param {boolean} mkdir ensure directory for dest file exists when true (default false)
   * @param {number} minLength the minimum length of the internal buffer that is required to be full before flushing
   */
  constructor(level, logFile = "", sync = true, fsync = true, mkdir = true, minLength = 0) {
    const fileTransport = logFile ? _pino.default.destination({
      dest: logFile,
      sync,
      fsync,
      mkdir,
      minLength
    }) : null;
    const loggerOptions = fileTransport ? {
      level: level.toString(),
      timestamp: _pino.default.stdTimeFunctions.isoTime,
      formatters: {
        bindings: () => {
          return {};
        },
        // @ts-ignore
        level: label => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
          return {
            level: label.toUpperCase()
          };
        }
      }
    } : {
      level: level.toString(),
      transport: {
        target: "pino-pretty",
        options: {
          translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
          ignore: "pid,hostname"
        }
      }
    };

    /**
     * @private
     * @type {import("pino").Logger}
     */
    this._logger = fileTransport ? (0, _pino.default)(loggerOptions, fileTransport) : (0, _pino.default)(loggerOptions);

    /**
     * @private
     * @type {LogLevel}
     */
    this._previousLevel = level;
  }

  /**
   * Set logger
   *
   * @public
   * @param {import("pino").Logger} logger
   * @returns {this}
   */
  setLogger(logger) {
    this._logger = logger;
    return this;
  }

  /**
   * Set log level
   *
   * @public
   * @param {LogLevel} level
   * @returns {this}
   */
  setLevel(level) {
    this._previousLevel = _LogLevel.default._fromString(this._logger.level);
    this._logger.level = level.toString();
    return this;
  }

  /**
   * Get logging level
   *
   * @public
   * @returns {LogLevel}
   */
  get level() {
    return _LogLevel.default._fromString(this._logger.level);
  }

  /**
   * Get logging level
   *
   * @public
   * @returns {{[level: number]: string}}
   */
  get levels() {
    return this._logger.levels.labels;
  }

  /**
   * Set silent mode on/off
   *
   * @public
   * @description If set to true, the logger will not display any log messages
   * - This can also be achieved by calling `.setLevel(LogLevel.Silent)`
   * @param {boolean} silent
   * @returns {this}
   */
  setSilent(silent) {
    if (silent) {
      this._logger.level = _LogLevel.default.Silent.toString();
    } else {
      // Here we are setting the level to the previous level, before silencing the logger
      this._logger.level = this._previousLevel.toString();
    }
    return this;
  }

  /**
   * Get silent mode
   *
   * @public
   * @returns {boolean}
   */
  get silent() {
    return this._logger.level == _LogLevel.default.Silent.toString();
  }

  /**
   * Log trace
   *
   * @public
   * @param {string} message
   * @returns {void}
   */
  trace(message) {
    this._logger.trace(message);
  }

  /**
   * Log debug
   *
   * @public
   * @param {string} message
   * @returns {void}
   */
  debug(message) {
    this._logger.debug(message);
  }

  /**
   * Log info
   *
   * @public
   * @param {string} message
   * @returns {void}
   */
  info(message) {
    this._logger.info(message);
  }

  /**
   * Log warn
   *
   * @public
   * @param {string} message
   * @returns {void}
   */
  warn(message) {
    this._logger.warn(message);
  }

  /**
   * Log error
   *
   * @public
   * @param {string} message
   * @returns {void}
   */
  error(message) {
    this._logger.error(message);
  }

  /**
   * Log fatal
   *
   * @public
   * @param {string} message
   * @returns {void}
   */
  fatal(message) {
    this._logger.fatal(message);
  }
}
exports.default = Logger;