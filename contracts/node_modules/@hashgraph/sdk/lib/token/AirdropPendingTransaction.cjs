"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Transaction = _interopRequireDefault(require("../transaction/Transaction.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @typedef {import("../token/PendingAirdropId.js").default} PendingAirdropId
 */
class AirdropPendingTransaction extends _Transaction.default {
  /**
   * @param {object} [props]
   * @param {PendingAirdropId[]} [props.pendingAirdropIds]
   */
  constructor(props) {
    /**
     * @private
     * @type {PendingAirdropId[]}
     */
    super();

    /**
     * @private
     * @type {PendingAirdropId[]}
     */
    this._pendingAirdropIds = [];
    if (props?.pendingAirdropIds != null) {
      this._pendingAirdropIds = props.pendingAirdropIds;
    }
  }

  /**
   * @returns {PendingAirdropId[]}
   */
  get pendingAirdropIds() {
    return this._pendingAirdropIds;
  }

  /**
   *
   * @param {PendingAirdropId} pendingAirdropId
   * @returns {this}
   */
  addPendingAirdropId(pendingAirdropId) {
    this._requireNotFrozen();
    this._pendingAirdropIds.push(pendingAirdropId);
    return this;
  }

  /**
   *
   * @param {PendingAirdropId[]} pendingAirdropIds
   * @returns {this}
   */
  setPendingAirdropIds(pendingAirdropIds) {
    this._requireNotFrozen();
    this._pendingAirdropIds = pendingAirdropIds;
    return this;
  }
}
exports.default = AirdropPendingTransaction;