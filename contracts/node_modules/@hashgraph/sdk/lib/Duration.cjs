"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _long = _interopRequireDefault(require("long"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IDuration} HieroProto.proto.IDuration
 */

/**
 * A duration type.
 *
 * The main point of this tyope is for encapsulating the `[to|from]Protobuf()` implementations
 */
class Duration {
  /**
   * @param {Long | number} seconds
   */
  constructor(seconds) {
    /**
     * @readonly
     * @type {Long}
     */
    this.seconds = seconds instanceof _long.default ? seconds : _long.default.fromNumber(seconds);
    Object.freeze(this);
  }

  /**
   * @internal
   * @returns {HieroProto.proto.IDuration}
   */
  _toProtobuf() {
    return {
      seconds: this.seconds
    };
  }

  /**
   * @internal
   * @param {HieroProto.proto.IDuration} duration
   * @returns {Duration}
   */
  static _fromProtobuf(duration) {
    return new Duration(/** @type {Long} */duration.seconds);
  }
}
exports.default = Duration;