"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _TokenId = _interopRequireDefault(require("../token/TokenId.cjs"));
var _TokenRelationship = _interopRequireDefault(require("./TokenRelationship.cjs"));
var _ObjectMap = _interopRequireDefault(require("../ObjectMap.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenRelationship} HieroProto.proto.ITokenRelationship
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HieroProto.proto.ITokenID
 */

/**
 * @typedef {import("long")} Long
 */

/**
 * @augments {ObjectMap<TokenId, TokenRelationship>}
 */
class TokenRelationshipMap extends _ObjectMap.default {
  constructor() {
    super(s => _TokenId.default.fromString(s));
  }

  /**
   * @param {HieroProto.proto.ITokenRelationship[]} relationships
   * @returns {TokenRelationshipMap}
   */
  static _fromProtobuf(relationships) {
    const tokenRelationships = new TokenRelationshipMap();
    for (const relationship of relationships) {
      const tokenId = _TokenId.default._fromProtobuf(/** @type {HieroProto.proto.ITokenID} */relationship.tokenId);
      tokenRelationships._set(tokenId, _TokenRelationship.default._fromProtobuf(relationship));
    }
    return tokenRelationships;
  }

  /**
   * @returns {HieroProto.proto.ITokenRelationship[]}
   */
  _toProtobuf() {
    const list = [];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, relationship] of this) {
      list.push(relationship._toProtobuf());
    }
    return list;
  }
}
exports.default = TokenRelationshipMap;