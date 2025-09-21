"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _StatusError = _interopRequireDefault(require("./StatusError.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @typedef {import("./Status.js").default} Status
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 * @typedef {import("./transaction/TransactionRecord").default} TransactionRecord
 */

class RecordStatusError extends _StatusError.default {
  /**
   * @param {object} props
   * @param {TransactionRecord} props.transactionRecord
   * @param {Status} props.status
   * @param {TransactionId} props.transactionId
   */
  constructor(props) {
    super(props, `Record for transaction ${props.transactionId.toString()} contained error status ${props.status.toString()}`);

    /**
     * @type {TransactionRecord}
     * @readonly
     */
    this.transactionRecord = props.transactionRecord;
  }
}
exports.default = RecordStatusError;