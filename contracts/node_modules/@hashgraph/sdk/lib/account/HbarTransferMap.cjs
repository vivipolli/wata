"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _AccountId = _interopRequireDefault(require("./AccountId.cjs"));
var _Hbar = _interopRequireDefault(require("../Hbar.cjs"));
var _ObjectMap = _interopRequireDefault(require("../ObjectMap.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransferList} HieroProto.proto.ITransferList
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 */

/**
 * @typedef {import("../long.js").LongObject} LongObject
 * @typedef {import("bignumber.js").default} BigNumber
 */

/**
 * @augments {ObjectMap<AccountId, Hbar>}
 */
class HbarTransferMap extends _ObjectMap.default {
  constructor() {
    super(s => _AccountId.default.fromString(s));
  }

  /**
   * @param {HieroProto.proto.ITransferList} transfers
   * @returns {HbarTransferMap}
   */
  static _fromProtobuf(transfers) {
    const accountTransfers = new HbarTransferMap();
    for (const transfer of transfers.accountAmounts != null ? transfers.accountAmounts : []) {
      const account = _AccountId.default._fromProtobuf(/** @type {HieroProto.proto.IAccountID} */transfer.accountID);
      accountTransfers._set(account, _Hbar.default.fromTinybars(/** @type {Long} */transfer.amount));
    }
    return accountTransfers;
  }
}
exports.default = HbarTransferMap;