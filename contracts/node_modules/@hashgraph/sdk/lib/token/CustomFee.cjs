"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _AccountId = _interopRequireDefault(require("../account/AccountId.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ICustomFee} HieroProto.proto.ICustomFee
 */

class CustomFee {
  /**
   * @param {object} props
   * @param {AccountId | string} [props.feeCollectorAccountId]
   * @param {boolean} [props.allCollectorsAreExempt]
   */
  constructor(props = {}) {
    /**
     * @type {?AccountId}
     */
    this._feeCollectorAccountId = null;
    this._allCollectorsAreExempt = false;
    if (props.feeCollectorAccountId != null) {
      this.setFeeCollectorAccountId(props.feeCollectorAccountId);
    }
    if (props.allCollectorsAreExempt != null) {
      this.setAllCollectorsAreExempt(props.allCollectorsAreExempt);
    }
  }

  /**
   * @returns {?AccountId}
   */
  get feeCollectorAccountId() {
    return this._feeCollectorAccountId;
  }

  /**
   * @param {AccountId | string} feeCollectorAccountId
   * @returns {this}
   */
  setFeeCollectorAccountId(feeCollectorAccountId) {
    this._feeCollectorAccountId = typeof feeCollectorAccountId === "string" ? _AccountId.default.fromString(feeCollectorAccountId) : feeCollectorAccountId;
    return this;
  }

  /**
   * @returns {boolean}
   */
  get allCollectorsAreExempt() {
    return this._allCollectorsAreExempt;
  }

  /**
   * @param {boolean} allCollectorsAreExempt
   * @returns {this}
   */
  setAllCollectorsAreExempt(allCollectorsAreExempt) {
    this._allCollectorsAreExempt = allCollectorsAreExempt;
    return this;
  }

  /**
   * @internal
   * @abstract
   * @param {HieroProto.proto.ICustomFee} info
   * @returns {CustomFee}
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static _fromProtobuf(info) {
    throw new Error("not implemented");
  }

  /**
   * @internal
   * @abstract
   * @returns {HieroProto.proto.ICustomFee}
   */
  _toProtobuf() {
    throw new Error("not implemented");
  }
}
exports.default = CustomFee;