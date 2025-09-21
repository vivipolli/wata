"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _AccountId = _interopRequireDefault(require("../account/AccountId.cjs"));
var _CustomFixedFee = _interopRequireDefault(require("../token/CustomFixedFee.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IFixedFee} HieroProto.proto.IFixedFee
 * @typedef {import("@hashgraph/proto").proto.ICustomFeeLimit} HieroProto.proto.ICustomFeeLimit
 */

class CustomFeeLimit {
  /**
   *
   * @param {object} props
   * @param {?AccountId | string} [props.accountId]
   * @param {?CustomFixedFee[]} [props.fees]
   */
  constructor(props = {}) {
    /**
     * @type {?AccountId}
     */
    this._accountId = null;
    if (props.accountId) {
      this.setAccountId(props.accountId);
    }

    /**
     * @type {?CustomFixedFee[]}
     */
    this._fees = null;
    if (props.fees) {
      this.setFees(props.fees);
    }
  }

  /**
   * @static
   * @param {HieroProto.proto.ICustomFeeLimit} customFeeLimit
   * @returns {CustomFeeLimit}
   */
  static _fromProtobuf(customFeeLimit) {
    return new CustomFeeLimit({
      accountId: customFeeLimit.accountId != null ? _AccountId.default._fromProtobuf(customFeeLimit.accountId) : null,
      fees: customFeeLimit.fees != null ? customFeeLimit.fees.map(fixedFee => {
        return _CustomFixedFee.default._fromProtobuf({
          fixedFee: fixedFee
        });
      }) : null
    });
  }

  /**
   * @returns {?AccountId}
   */
  getAccountId() {
    return this._accountId;
  }

  /**
   *
   * @param {AccountId | string} accountId
   * @returns {this}
   */
  setAccountId(accountId) {
    if (accountId instanceof _AccountId.default) {
      this._accountId = accountId;
    } else {
      this._accountId = _AccountId.default.fromString(accountId);
    }
    return this;
  }

  /**
   * @returns {?CustomFixedFee[]}
   */
  getFees() {
    return this._fees;
  }

  /**
   *
   * @param {CustomFixedFee[]} fees
   * @returns {this}
   */
  setFees(fees) {
    this._fees = fees;
    return this;
  }

  /**
   *
   * @returns {HieroProto.proto.ICustomFeeLimit}
   */
  _toProtobuf() {
    /** @type {HieroProto.proto.IFixedFee[]} */
    const protoFixedFees = [];
    if (this._fees != null) {
      this._fees.forEach(fixedFee => {
        const fixedFeeProto = fixedFee._toProtobuf();
        if (fixedFeeProto.fixedFee != null) {
          protoFixedFees.push(fixedFeeProto.fixedFee);
        }
      });
    }
    return {
      accountId: this._accountId != null ? this._accountId._toProtobuf() : null,
      fees: protoFixedFees
    };
  }
}
exports.default = CustomFeeLimit;