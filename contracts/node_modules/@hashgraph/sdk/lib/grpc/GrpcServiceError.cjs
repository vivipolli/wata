"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _GrpcStatus = _interopRequireDefault(require("./GrpcStatus.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * Describes how the gRPC request failed.
 *
 * Exists in order for the Hiero JavaScript SDK to produce the same error type for gRPC errors regardless of
 * operating in node or the browser.
 *
 * Definition taken from <https://grpc.github.io/grpc/node/grpc.html#~ServiceError>.
 */
class GrpcServiceError extends Error {
  /**
   * @param {GrpcStatus} status
   * @param {string} [nodeAccountId]
   */
  constructor(status, nodeAccountId) {
    super(`gRPC service failed with: Status: ${status.toString()}, Code: ${status.valueOf()}`);

    /**
     * @readonly
     */
    this.status = status;

    /**
     * Optional: node account ID associated with the error
     */
    this.nodeAccountId = nodeAccountId;
    this.name = "GrpcServiceError";
    if (typeof Error.captureStackTrace !== "undefined") {
      Error.captureStackTrace(this, GrpcServiceError);
    }
  }

  /**
   * @param {Error & { code?: number; details?: string }} obj
   * @returns {Error}
   */
  static _fromResponse(obj) {
    if (obj.code != null && obj.details != null) {
      const status = _GrpcStatus.default._fromValue(obj.code);
      const err = new GrpcServiceError(status);
      err.stack += `\nCaused by: ${obj.stack ? obj.stack.toString() : ""}`;
      err.message += `: ${obj.details}`;
      return err;
    } else {
      return /** @type {Error} */obj;
    }
  }

  /**
   * @returns {string}
   */
  toString() {
    return `${this.name}: ${this.message}`;
  }
}
exports.default = GrpcServiceError;