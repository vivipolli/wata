"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _TopicId = _interopRequireDefault(require("./TopicId.cjs"));
var _AccountId = _interopRequireDefault(require("../account/AccountId.cjs"));
var _Timestamp = _interopRequireDefault(require("../Timestamp.cjs"));
var _long = _interopRequireDefault(require("long"));
var _Duration = _interopRequireDefault(require("../Duration.cjs"));
var HieroProto = _interopRequireWildcard(require("@hashgraph/proto"));
var _Key = _interopRequireDefault(require("../Key.cjs"));
var _LedgerId = _interopRequireDefault(require("../LedgerId.cjs"));
var _CustomFixedFee = _interopRequireDefault(require("../token/CustomFixedFee.cjs"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * Current state of a topic.
 */
class TopicInfo {
  /**
   * @private
   * @param {object} props
   * @param {TopicId} props.topicId
   * @param {string} props.topicMemo
   * @param {Uint8Array} props.runningHash
   * @param {Long} props.sequenceNumber
   * @param {?Timestamp} props.expirationTime
   * @param {?Key} props.adminKey
   * @param {?Key} props.submitKey
   * @param {?Key} props.feeScheduleKey
   * @param {?Key[]} props.feeExemptKeys
   * @param {?Duration} props.autoRenewPeriod
   * @param {?AccountId} props.autoRenewAccountId
   * @param {?CustomFixedFee[]} props.customFees
   * @param {LedgerId|null} props.ledgerId
   */
  constructor(props) {
    /**
     * The ID of the topic for which information is requested.
     *
     * @readonly
     */
    this.topicId = props.topicId;

    /**
     * Short publicly visible memo about the topic. No guarantee of uniqueness.
     *
     * @readonly
     */
    this.topicMemo = props.topicMemo;

    /**
     * SHA-384 running hash of (previousRunningHash, topicId, consensusTimestamp, sequenceNumber, message).
     *
     * @readonly
     */
    this.runningHash = props.runningHash;

    /**
     * Sequence number (starting at 1 for the first submitMessage) of messages on the topic.
     *
     * @readonly
     */
    this.sequenceNumber = props.sequenceNumber;

    /**
     * Effective consensus timestamp at (and after) which submitMessage calls will no longer succeed on the topic.
     *
     * @readonly
     */
    this.expirationTime = props.expirationTime;

    /**
     * Access control for update/delete of the topic. Null if there is no key.
     *
     * @readonly
     */
    this.adminKey = props.adminKey;

    /**
     * Access control for ConsensusService.submitMessage. Null if there is no key.
     *
     * @readonly
     */
    this.submitKey = props.submitKey;

    /**
     * Access control for updating topic fees. Null If there is no key.
     *
     * @readonly
     */
    this.feeScheduleKey = props.feeScheduleKey;

    /**
     * The keys that will are exempt from paying fees.
     * @readonly
     */
    this.feeExemptKeys = props.feeExemptKeys;
    /**
     * @readonly
     */
    this.autoRenewPeriod = props.autoRenewPeriod;

    /**
     * @readonly
     */
    this.autoRenewAccountId = props.autoRenewAccountId;

    /**
     * The fixed fees assessed when a message is submitted to the topic.
     * @readonly
     */
    this.customFees = props.customFees;
    this.ledgerId = props.ledgerId;
    Object.freeze(this);
  }

  /**
   * @internal
   * @param {HieroProto.proto.IConsensusGetTopicInfoResponse} infoResponse
   * @returns {TopicInfo}
   */
  static _fromProtobuf(infoResponse) {
    const info = /** @type {HieroProto.proto.IConsensusTopicInfo} */
    infoResponse.topicInfo;
    return new TopicInfo({
      topicId: _TopicId.default._fromProtobuf(/** @type {HieroProto.proto.ITopicID} */infoResponse.topicID),
      topicMemo: info.memo != null ? info.memo : "",
      runningHash: info.runningHash != null ? info.runningHash : new Uint8Array(),
      sequenceNumber: info.sequenceNumber != null ? info.sequenceNumber instanceof _long.default ? info.sequenceNumber : _long.default.fromValue(info.sequenceNumber) : _long.default.ZERO,
      expirationTime: info.expirationTime != null ? _Timestamp.default._fromProtobuf(info.expirationTime) : null,
      adminKey: info.adminKey != null ? _Key.default._fromProtobufKey(info.adminKey) : null,
      submitKey: info.submitKey != null ? _Key.default._fromProtobufKey(info.submitKey) : null,
      feeScheduleKey: info.feeScheduleKey != null ? _Key.default._fromProtobufKey(info.feeScheduleKey) : null,
      feeExemptKeys: info.feeExemptKeyList != null ? info.feeExemptKeyList.map(key => _Key.default._fromProtobufKey(key)) : null,
      autoRenewPeriod: info.autoRenewPeriod != null ? new _Duration.default(/** @type {Long} */info.autoRenewPeriod.seconds) : null,
      autoRenewAccountId: info.autoRenewAccount != null ? _AccountId.default._fromProtobuf(info.autoRenewAccount) : null,
      customFees: info.customFees != null ? info.customFees.map(customFee => _CustomFixedFee.default._fromProtobuf(customFee)) : null,
      ledgerId: info.ledgerId != null ? _LedgerId.default.fromBytes(info.ledgerId) : null
    });
  }

  /**
   * @internal
   * @returns {HieroProto.proto.IConsensusGetTopicInfoResponse}
   */
  _toProtobuf() {
    return {
      topicID: this.topicId._toProtobuf(),
      topicInfo: {
        memo: this.topicMemo,
        runningHash: this.runningHash,
        sequenceNumber: this.sequenceNumber,
        expirationTime: this.expirationTime != null ? this.expirationTime._toProtobuf() : null,
        adminKey: this.adminKey != null ? this.adminKey._toProtobufKey() : null,
        submitKey: this.submitKey != null ? this.submitKey._toProtobufKey() : null,
        feeScheduleKey: this.feeScheduleKey != null ? this.feeScheduleKey._toProtobufKey() : null,
        feeExemptKeyList: this.feeExemptKeys != null ? this.feeExemptKeys.map(key => key._toProtobufKey()) : null,
        autoRenewPeriod: this.autoRenewPeriod != null ? this.autoRenewPeriod._toProtobuf() : null,
        autoRenewAccount: this.autoRenewAccountId != null ? this.autoRenewAccountId._toProtobuf() : null,
        customFees: this.customFees != null ? this.customFees.map(customFee => customFee._toProtobuf()) : null
      }
    };
  }

  /**
   * @param {Uint8Array} bytes
   * @returns {TopicInfo}
   */
  static fromBytes(bytes) {
    return TopicInfo._fromProtobuf(HieroProto.proto.ConsensusGetTopicInfoResponse.decode(bytes));
  }

  /**
   * @returns {Uint8Array}
   */
  toBytes() {
    return HieroProto.proto.ConsensusGetTopicInfoResponse.encode(/** @type {HieroProto.proto.ConsensusGetTopicInfoResponse} */
    this._toProtobuf()).finish();
  }
}
exports.default = TopicInfo;