"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var HieroProto = _interopRequireWildcard(require("@hashgraph/proto"));
var _RequestType = _interopRequireDefault(require("./RequestType.cjs"));
var _FeeData = _interopRequireDefault(require("./FeeData.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
// SPDX-License-Identifier: Apache-2.0

class TransactionFeeSchedule {
  /**
   * @param {object} [props]
   * @param {RequestType} [props.hederaFunctionality]
   * @param {FeeData} [props.feeData]
   * @param {FeeData[]} [props.fees]
   */
  constructor(props = {}) {
    /*
     * A particular transaction or query
     *
     * @type {RequestType}
     */
    this.hederaFunctionality = props.hederaFunctionality;

    /*
     * Resource price coefficients
     *
     * @type {FeeData}
     */
    this.feeData = props.feeData;

    /*
     * Resource price coefficients
     *
     * @type {FeeData[]}
     */
    this.fees = props.fees;
  }

  /**
   * @param {Uint8Array} bytes
   * @returns {TransactionFeeSchedule}
   */
  static fromBytes(bytes) {
    return TransactionFeeSchedule._fromProtobuf(HieroProto.proto.TransactionFeeSchedule.decode(bytes));
  }

  /**
   * @internal
   * @param {HieroProto.proto.ITransactionFeeSchedule} transactionFeeSchedule
   * @returns {TransactionFeeSchedule}
   */
  static _fromProtobuf(transactionFeeSchedule) {
    return new TransactionFeeSchedule({
      hederaFunctionality: transactionFeeSchedule.hederaFunctionality != null ? _RequestType.default._fromCode(transactionFeeSchedule.hederaFunctionality) : undefined,
      feeData: transactionFeeSchedule.feeData != null ? _FeeData.default._fromProtobuf(transactionFeeSchedule.feeData) : undefined,
      fees: transactionFeeSchedule.fees != null ? transactionFeeSchedule.fees.map(fee => _FeeData.default._fromProtobuf(fee)) : undefined
    });
  }

  /**
   * @internal
   * @returns {HieroProto.proto.ITransactionFeeSchedule}
   */
  _toProtobuf() {
    return {
      hederaFunctionality: this.hederaFunctionality != null ? this.hederaFunctionality.valueOf() : undefined,
      feeData: this.feeData != null ? this.feeData._toProtobuf() : undefined,
      fees: this.fees != null ? this.fees.map(fee => fee._toProtobuf()) : undefined
    };
  }

  /**
   * @returns {Uint8Array}
   */
  toBytes() {
    return HieroProto.proto.TransactionFeeSchedule.encode(this._toProtobuf()).finish();
  }
}
exports.default = TransactionFeeSchedule;