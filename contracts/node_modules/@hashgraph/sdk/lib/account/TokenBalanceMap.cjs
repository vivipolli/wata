"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _TokenId = _interopRequireDefault(require("../token/TokenId.cjs"));
var _ObjectMap = _interopRequireDefault(require("../ObjectMap.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenBalance} HieroProto.proto.ITokenBalance
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HieroProto.proto.ITokenID
 */

/**
 * @typedef {import("long")} Long
 */

/**
 * @augments {ObjectMap<TokenId, Long>}
 */
class TokenBalanceMap extends _ObjectMap.default {
  constructor() {
    super(s => _TokenId.default.fromString(s));
  }
}
exports.default = TokenBalanceMap;