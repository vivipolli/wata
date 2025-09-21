"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _AccountId = _interopRequireDefault(require("./AccountId.cjs"));
var _Duration = _interopRequireDefault(require("../Duration.cjs"));
var _KeyList = _interopRequireDefault(require("../KeyList.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HieroProto.proto.IAccountID
 * @typedef {import("@hashgraph/proto").proto.ILiveHash} HieroProto.proto.ILiveHash
 * @typedef {import("@hashgraph/proto").proto.IDuration} HieroProto.proto.IDuration
 */

/**
 * Response when the client sends the node CryptoGetInfoQuery.
 */
class LiveHash {
  /**
   * @private
   * @param {object} props
   * @param {AccountId} props.accountId
   * @param {Uint8Array} props.hash
   * @param {KeyList} props.keys
   * @param {Duration} props.duration
   */
  constructor(props) {
    /** @readonly */
    this.accountId = props.accountId;

    /** @readonly */
    this.hash = props.hash;

    /** @readonly */
    this.keys = props.keys;

    /** @readonly */
    this.duration = props.duration;
    Object.freeze(this);
  }

  /**
   * @internal
   * @param {HieroProto.proto.ILiveHash} liveHash
   * @returns {LiveHash}
   */
  static _fromProtobuf(liveHash) {
    const liveHash_ = /** @type {HieroProto.proto.ILiveHash} */liveHash;
    return new LiveHash({
      accountId: _AccountId.default._fromProtobuf(/** @type {HieroProto.proto.IAccountID} */
      liveHash_.accountId),
      hash: liveHash_.hash != null ? liveHash_.hash : new Uint8Array(),
      keys: liveHash_.keys != null ? _KeyList.default.__fromProtobufKeyList(liveHash_.keys) : new _KeyList.default(),
      duration: _Duration.default._fromProtobuf(/** @type {HieroProto.proto.IDuration} */liveHash_.duration)
    });
  }

  /**
   * @internal
   * @returns {HieroProto.proto.ILiveHash}
   */
  _toProtobuf() {
    return {
      accountId: this.accountId._toProtobuf(),
      hash: this.hash,
      keys: this.keys._toProtobufKey().keyList,
      duration: this.duration._toProtobuf()
    };
  }
}
exports.default = LiveHash;