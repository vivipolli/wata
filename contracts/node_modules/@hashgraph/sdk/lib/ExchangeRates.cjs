"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _ExchangeRate = _interopRequireDefault(require("./ExchangeRate.cjs"));
var HieroProto = _interopRequireWildcard(require("@hashgraph/proto"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

const {
  proto
} = HieroProto;

/**
 *  Represents a pair of exchange rates for HBAR to USD cents conversion.
 * Contains both the current exchange rate and the next exchange rate that will take effect.
 */
class ExchangeRates {
  /**
   * @private
   * @param {object} props
   * @param {ExchangeRate} props.currentRate
   * @param {ExchangeRate} props.nextRate
   */
  constructor(props) {
    /**
     * @readonly
     */
    this.currentRate = props.currentRate;

    /**
     * @readonly
     */
    this.nextRate = props.nextRate;
    Object.freeze(this);
  }

  /**
   * @internal
   * @param {HieroProto.proto.IExchangeRateSet} rateSet
   * @returns {ExchangeRates}
   */
  static _fromProtobuf(rateSet) {
    return new ExchangeRates({
      currentRate: _ExchangeRate.default._fromProtobuf(/** @type {HieroProto.proto.IExchangeRate} */
      rateSet.currentRate),
      nextRate: _ExchangeRate.default._fromProtobuf(/** @type {HieroProto.proto.IExchangeRate} */
      rateSet.nextRate)
    });
  }

  /**
   * @internal
   * @returns {HieroProto.proto.IExchangeRateSet}
   */
  _toProtobuf() {
    return {
      currentRate: this.currentRate._toProtobuf(),
      nextRate: this.nextRate._toProtobuf()
    };
  }

  /**
   * @param {Uint8Array} bytes
   * @returns {ExchangeRates}
   */
  static fromBytes(bytes) {
    return ExchangeRates._fromProtobuf(proto.ExchangeRateSet.decode(bytes));
  }
}
exports.default = ExchangeRates;