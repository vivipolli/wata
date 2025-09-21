"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _AccountId = _interopRequireDefault(require("../account/AccountId.cjs"));
var _TokenId = _interopRequireDefault(require("./TokenId.cjs"));
var _NftId = _interopRequireDefault(require("./NftId.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0
/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.PendingAirdropId} HieroProto.proto.PendingAirdropId
 */

/**
 * Represents the identifier for a pending airdrop in the Hedera network.
 *
 * A PendingAirdropId contains information about a pending token or NFT airdrop,
 * including the sender, receiver, and the token or NFT being airdropped. This class
 * is used to track and identify specific airdrops in the system.
 */
class PendingAirdropId {
  /**
   *
   * @param {object} props
   * @param {AccountId} [props.senderId]
   * @param {AccountId} [props.receiverId]
   * @param {TokenId?} [props.tokenId]
   * @param {NftId?} [props.nftId]
   */
  constructor(props = {}) {
    this._senderId = null;
    this._receiverId = null;
    this._tokenId = null;
    this._nftId = null;
    if (props.receiverId) {
      this._receiverId = props.receiverId;
    }
    if (props.senderId) {
      this._senderId = props.senderId;
    }
    if (props.tokenId) {
      this._tokenId = new _TokenId.default(props.tokenId);
    } else if (props.nftId) {
      this._nftId = new _NftId.default(props.nftId?.tokenId, props.nftId?.serial);
    }
  }

  /**
   * @param {HieroProto.proto.PendingAirdropId} pb
   * @returns {PendingAirdropId}
   */
  static fromBytes(pb) {
    if (pb.senderId == null) {
      throw new Error("senderId is required");
    }
    if (pb.receiverId == null) {
      throw new Error("receiverId is required");
    }
    if (pb.fungibleTokenType == null && pb.nonFungibleToken == null) {
      throw new Error("Either fungibleTokenType or nonFungibleToken is required");
    }
    return new PendingAirdropId({
      senderId: _AccountId.default._fromProtobuf(pb.senderId),
      receiverId: _AccountId.default._fromProtobuf(pb.receiverId),
      nftId: pb.nonFungibleToken != null ? _NftId.default._fromProtobuf(pb.nonFungibleToken) : null,
      tokenId: pb.fungibleTokenType != null ? _TokenId.default._fromProtobuf(pb.fungibleTokenType) : null
    });
  }

  /**
   *
   * @param {AccountId} senderId
   * @returns {this}
   */
  setSenderid(senderId) {
    this._senderId = senderId;
    return this;
  }

  /**
   * @param {AccountId} receiverId
   * @returns {this}
   */
  setReceiverId(receiverId) {
    this._receiverId = receiverId;
    return this;
  }

  /**
   * @param {TokenId} tokenId
   * @returns {this}
   */
  setTokenId(tokenId) {
    this._nftId = null;
    this._tokenId = tokenId;
    return this;
  }

  /**
   * @param {NftId} nftId
   * @returns {this}
   */
  setNftId(nftId) {
    this._tokenId = null;
    this._nftId = nftId;
    return this;
  }

  /**
   * @returns {?AccountId}
   */
  get senderId() {
    return this._senderId;
  }

  /**
   * @returns {?AccountId}
   */
  get receiverId() {
    return this._receiverId;
  }

  /**
   * @returns {?TokenId}
   */
  get tokenId() {
    return this._tokenId;
  }

  /**
   * @returns {?NftId}
   */
  get nftId() {
    return this._nftId;
  }

  /**
   *  @returns {HieroProto.proto.PendingAirdropId}
   */
  toBytes() {
    return {
      senderId: this.senderId?._toProtobuf(),
      receiverId: this._receiverId?._toProtobuf(),
      fungibleTokenType: this._tokenId?._toProtobuf(),
      nonFungibleToken: this._nftId?._toProtobuf()
    };
  }
}
exports.default = PendingAirdropId;