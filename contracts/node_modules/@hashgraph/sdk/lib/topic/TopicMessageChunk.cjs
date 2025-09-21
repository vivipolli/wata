"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Timestamp = _interopRequireDefault(require("../Timestamp.cjs"));
var _long = _interopRequireDefault(require("long"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITimestamp} HieroProto.proto.ITimestamp
 */

/**
 * @namespace com
 * @typedef {import("@hashgraph/proto").com.hedera.mirror.api.proto.IConsensusTopicResponse} com.hedera.mirror.api.proto.IConsensusTopicResponse
 */

class TopicMessageChunk {
  /**
   * @private
   * @param {object} props
   * @param {Timestamp} props.consensusTimestamp
   * @param {Uint8Array} props.contents
   * @param {Uint8Array} props.runningHash
   * @param {Long} props.sequenceNumber
   */
  constructor(props) {
    /** @readonly */
    this.consensusTimestamp = props.consensusTimestamp;
    /** @readonly */
    this.contents = props.contents;
    /** @readonly */
    this.runningHash = props.runningHash;
    /** @readonly */
    this.sequenceNumber = props.sequenceNumber;
    Object.freeze(this);
  }

  /**
   * @internal
   * @param {com.hedera.mirror.api.proto.IConsensusTopicResponse} response
   * @returns {TopicMessageChunk}
   */
  static _fromProtobuf(response) {
    return new TopicMessageChunk({
      consensusTimestamp: _Timestamp.default._fromProtobuf(/** @type {HieroProto.proto.ITimestamp} */
      response.consensusTimestamp),
      contents: response.message != null ? response.message : new Uint8Array(),
      runningHash: response.runningHash != null ? response.runningHash : new Uint8Array(),
      sequenceNumber: response.sequenceNumber != null ? response.sequenceNumber instanceof _long.default ? response.sequenceNumber : _long.default.fromValue(response.sequenceNumber) : _long.default.ZERO
    });
  }

  /**
   * @internal
   * @returns {com.hedera.mirror.api.proto.IConsensusTopicResponse}
   */
  _toProtobuf() {
    return {
      consensusTimestamp: this.consensusTimestamp._toProtobuf(),
      message: this.contents,
      runningHash: this.runningHash,
      sequenceNumber: this.sequenceNumber
    };
  }
}
exports.default = TopicMessageChunk;