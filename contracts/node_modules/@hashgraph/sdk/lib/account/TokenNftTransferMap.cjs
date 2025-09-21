"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _long = _interopRequireDefault(require("long"));
var _TokenId = _interopRequireDefault(require("../token/TokenId.cjs"));
var _AccountId = _interopRequireDefault(require("../account/AccountId.cjs"));
var _ObjectMap = _interopRequireDefault(require("../ObjectMap.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenTransferList} HieroProto.proto.ITokenTransferList
 * @typedef {import("@hashgraph/proto").proto.INftTransfer} HieroProto.proto.INftTransfer
 * @typedef {import("@hashgraph/proto").proto.IAccountAmount} HieroProto.proto.IAccountAmount
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HieroProto.proto.ITokenID
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 */

/**
 * @typedef {object} NftTransfer
 * @property {AccountId} sender
 * @property {AccountId} recipient
 * @property {Long} serial
 * @property {boolean} isApproved
 */

/**
 * @augments {ObjectMap<TokenId, NftTransfer[]>}
 */
class TokenNftTransferMap extends _ObjectMap.default {
  constructor() {
    super(s => _TokenId.default.fromString(s));
  }

  /**
   * @internal
   * @param {TokenId} tokenId
   * @param {NftTransfer} nftTransfer
   */
  __set(tokenId, nftTransfer) {
    const token = tokenId.toString();
    let _map = this._map.get(token);
    if (_map == null) {
      _map = [];
      this._map.set(token, _map);
      this.__map.set(tokenId, _map);
    }
    _map.push(nftTransfer);
  }

  /**
   * @param {HieroProto.proto.ITokenTransferList[]} transfers
   * @returns {TokenNftTransferMap}
   */
  static _fromProtobuf(transfers) {
    const tokenTransfersMap = new TokenNftTransferMap();
    for (const transfer of transfers) {
      const token = _TokenId.default._fromProtobuf(/** @type {HieroProto.proto.ITokenID} */transfer.token);
      for (const aa of transfer.nftTransfers != null ? transfer.nftTransfers : []) {
        const sender = _AccountId.default._fromProtobuf(/** @type {HieroProto.proto.IAccountID} */
        aa.senderAccountID);
        const recipient = _AccountId.default._fromProtobuf(/** @type {HieroProto.proto.IAccountID} */
        aa.receiverAccountID);
        tokenTransfersMap.__set(token, {
          sender,
          recipient,
          serial: _long.default.fromValue(/** @type {Long} */aa.serialNumber),
          isApproved: false
        });
      }
    }
    return tokenTransfersMap;
  }

  /**
   * @returns {HieroProto.proto.ITokenTransferList[]}
   */
  _toProtobuf() {
    /** @type {HieroProto.proto.ITokenTransferList[]} */
    const tokenTransferList = [];
    for (const [tokenId, value] of this) {
      /** @type {HieroProto.proto.INftTransfer[]} */
      const transfers = [];
      for (const transfer of value) {
        transfers.push({
          senderAccountID: transfer.sender._toProtobuf(),
          receiverAccountID: transfer.recipient._toProtobuf(),
          serialNumber: transfer.serial
        });
      }
      tokenTransferList.push({
        token: tokenId._toProtobuf(),
        nftTransfers: transfers
      });
    }
    return tokenTransferList;
  }
  toJSON() {
    const obj = {};
    this._map.forEach((value, key) => {
      // @ts-ignore
      obj[key] = value.map(nftTransfer => ({
        sender: nftTransfer.sender.toString(),
        recipient: nftTransfer.recipient.toString(),
        serial: nftTransfer.serial,
        isApproved: nftTransfer.isApproved
      }));
    });
    return obj;
  }
}
exports.default = TokenNftTransferMap;