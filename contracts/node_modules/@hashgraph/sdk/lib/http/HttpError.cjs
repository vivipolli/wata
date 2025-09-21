"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _HttpStatus = _interopRequireDefault(require("./HttpStatus.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0
// eslint-disable-next-line @typescript-eslint/no-unused-vars

/**
 * Describes how the http request failed.
 */
class HttpError extends Error {
  /**
   * @param {HttpStatus} status
   */
  constructor(status) {
    super(`failed with error code: ${status.toString()}`);

    /**
     * @readonly
     */
    this.status = status;
    this.name = "HttpError";
    if (typeof Error.captureStackTrace !== "undefined") {
      Error.captureStackTrace(this, HttpError);
    }
  }
}
exports.default = HttpError;