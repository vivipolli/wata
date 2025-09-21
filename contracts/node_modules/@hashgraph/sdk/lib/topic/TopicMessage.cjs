"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Timestamp = _interopRequireDefault(require("../Timestamp.cjs"));
var _TopicMessageChunk = _interopRequireDefault(require("./TopicMessageChunk.cjs"));
var _long = _interopRequireDefault(require("long"));
var _TransactionId = _interopRequireDefault(require("../transaction/TransactionId.cjs"));
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

class TopicMessage {
  /**
   * @private
   * @param {object} props
   * @param {Timestamp} props.consensusTimestamp
   * @param {Uint8Array} props.contents
   * @param {Uint8Array} props.runningHash
   * @param {Long} props.sequenceNumber
   * @param {?TransactionId} props.initialTransactionId
   * @param {TopicMessageChunk[]} props.chunks
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
    /** @readonly */
    this.chunks = props.chunks;
    /** @readonly */
    this.initialTransactionId = props.initialTransactionId;
    Object.freeze(this);
  }

  /**
   * @internal
   * @param {com.hedera.mirror.api.proto.IConsensusTopicResponse} response
   * @returns {TopicMessage}
   */
  static _ofSingle(response) {
    return new TopicMessage({
      consensusTimestamp: _Timestamp.default._fromProtobuf(/** @type {HieroProto.proto.ITimestamp} */
      response.consensusTimestamp),
      contents: response.message != null ? response.message : new Uint8Array(),
      runningHash: response.runningHash != null ? response.runningHash : new Uint8Array(),
      sequenceNumber: response.sequenceNumber != null ? response.sequenceNumber instanceof _long.default ? response.sequenceNumber : _long.default.fromNumber(response.sequenceNumber) : _long.default.ZERO,
      initialTransactionId: response.chunkInfo != null && response.chunkInfo.initialTransactionID != null ? _TransactionId.default._fromProtobuf(response.chunkInfo.initialTransactionID) : null,
      chunks: [_TopicMessageChunk.default._fromProtobuf(response)]
    });
  }

  /**
   * @internal
   * @param {com.hedera.mirror.api.proto.IConsensusTopicResponse[]} responses
   * @returns {TopicMessage}
   */
  static _ofMany(responses) {
    const length = responses.length;
    const last = /** @type {com.hedera.mirror.api.proto.IConsensusTopicResponse} */
    responses[length - 1];
    const consensusTimestamp = _Timestamp.default._fromProtobuf(/** @type {HieroProto.proto.ITimestamp} */
    last.consensusTimestamp);
    const runningHash = /** @type {Uint8Array} */last.runningHash;

    /**
     * @type {Long}
     */
    const sequenceNumber = last.sequenceNumber != null ? last.sequenceNumber instanceof _long.default ? last.sequenceNumber : _long.default.fromValue(last.sequenceNumber) : _long.default.ZERO;
    responses.sort((a, b) => (a != null ? a.chunkInfo != null ? a.chunkInfo.number != null ? a.chunkInfo.number : 0 : 0 : 0) < (b != null ? b.chunkInfo != null ? b.chunkInfo.number != null ? b.chunkInfo.number : 0 : 0 : 0) ? -1 : 1);

    /**
     * @type {TopicMessageChunk[]}
     */
    const chunks = responses.map(
    /**
     * @type {com.hedera.mirror.api.proto.IConsensusTopicResponse}
     */
    m => _TopicMessageChunk.default._fromProtobuf(m));
    const size = chunks.map(chunk => chunk.contents.length).reduce((sum, current) => sum + current, 0);
    const contents = new Uint8Array(size);
    let offset = 0;
    responses.forEach(value => {
      contents.set(/** @type {Uint8Array} */value.message, offset);
      offset += /** @type {Uint8Array} */value.message.length;
    });
    let initialTransactionId = null;
    if (responses.length > 0 && responses[0].chunkInfo != null && responses[0].chunkInfo.initialTransactionID != null) {
      initialTransactionId = _TransactionId.default._fromProtobuf(responses[0].chunkInfo.initialTransactionID);
    }
    return new TopicMessage({
      consensusTimestamp,
      contents,
      runningHash,
      sequenceNumber,
      chunks,
      initialTransactionId
    });
  }
}
exports.default = TopicMessage;