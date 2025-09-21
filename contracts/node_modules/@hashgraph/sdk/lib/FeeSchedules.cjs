"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var HieroProto = _interopRequireWildcard(require("@hashgraph/proto"));
var _FeeSchedule = _interopRequireDefault(require("./FeeSchedule.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
// SPDX-License-Identifier: Apache-2.0

/**
 * Represents a pair of fee schedules on the Hedera network - the currently active fee schedule
 * and the next upcoming fee schedule. This structure allows for transparent fee updates by making
 * future fee changes visible before they take effect.
 */
class FeeSchedules {
  /**
   * @param {object} [props]
   * @param {FeeSchedule} [props.currentFeeSchedule]
   * @param {FeeSchedule} [props.nextFeeSchedule]
   */
  constructor(props = {}) {
    /*
     * Contains current Fee Schedule
     *
     * @type {FeeSchedule}
     */
    this.current = props.currentFeeSchedule;

    /*
     * Contains next Fee Schedule
     *
     * @type {FeeSchedule}
     */
    this.next = props.nextFeeSchedule;
  }

  /**
   * @param {Uint8Array} bytes
   * @returns {FeeSchedules}
   */
  static fromBytes(bytes) {
    return FeeSchedules._fromProtobuf(HieroProto.proto.CurrentAndNextFeeSchedule.decode(bytes));
  }

  /**
   * @internal
   * @param {HieroProto.proto.ICurrentAndNextFeeSchedule} feeSchedules
   * @returns {FeeSchedules}
   */
  static _fromProtobuf(feeSchedules) {
    return new FeeSchedules({
      currentFeeSchedule: feeSchedules.currentFeeSchedule != null ? _FeeSchedule.default._fromProtobuf(feeSchedules.currentFeeSchedule) : undefined,
      nextFeeSchedule: feeSchedules.nextFeeSchedule != null ? _FeeSchedule.default._fromProtobuf(feeSchedules.nextFeeSchedule) : undefined
    });
  }

  /**
   * @internal
   * @returns {HieroProto.proto.ICurrentAndNextFeeSchedule}
   */
  _toProtobuf() {
    return {
      currentFeeSchedule: this.current != null ? this.current._toProtobuf() : undefined,
      nextFeeSchedule: this.next != null ? this.next._toProtobuf() : undefined
    };
  }

  /**
   * @returns {Uint8Array}
   */
  toBytes() {
    return HieroProto.proto.CurrentAndNextFeeSchedule.encode(this._toProtobuf()).finish();
  }
}
exports.default = FeeSchedules;