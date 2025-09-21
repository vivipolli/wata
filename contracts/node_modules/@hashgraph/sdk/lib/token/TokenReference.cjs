"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _NftId = _interopRequireDefault(require("./NftId.cjs"));
var _TokenId = _interopRequireDefault(require("./TokenId.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.TokenReference} HieroProto.proto.TokenReference
 */

class TokenReference {
  constructor() {
    /**
     * @public
     * @type {?TokenId}
     */
    this.fungibleToken = null;
    /**
     * @public
     * @type {?NftId}
     */
    this.nft = null;
  }

  /**
   * @public
   * @param {HieroProto.proto.TokenReference} reference
   * @returns {TokenReference}
   */
  static _fromProtobuf(reference) {
    return {
      fungibleToken: reference.fungibleToken != undefined ? _TokenId.default._fromProtobuf(reference.fungibleToken) : null,
      nft: reference.nft != undefined ? _NftId.default._fromProtobuf(reference.nft) : null
    };
  }
}
exports.default = TokenReference;