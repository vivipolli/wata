"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _AccountId = _interopRequireDefault(require("../account/AccountId.cjs"));
var _ObjectMap = _interopRequireDefault(require("../ObjectMap.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @augments {ObjectMap<AccountId, Long>}
 */
class TokenTransferAccountMap extends _ObjectMap.default {
  constructor() {
    super(s => _AccountId.default.fromString(s));
  }
  toJSON() {
    const obj = {};
    this._map.forEach((value, key) => {
      // @ts-ignore
      obj[key] = value.toString();
    });
    return obj;
  }
}
exports.default = TokenTransferAccountMap;