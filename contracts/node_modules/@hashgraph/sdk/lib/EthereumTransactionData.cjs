"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Cache = _interopRequireDefault(require("./Cache.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Represents the base class for Ethereum transaction data.
 * This class provides the foundation for different types of Ethereum transactions
 * including Legacy, EIP-1559, and EIP-2930 transactions.
 */
class EthereumTransactionData {
  /**
   * @protected
   * @param {object} props
   * @param {Uint8Array} props.callData
   */
  constructor(props) {
    this.callData = props.callData;
  }

  /**
   * @param {Uint8Array} bytes
   * @returns {EthereumTransactionData}
   */
  static fromBytes(bytes) {
    if (bytes.length === 0) {
      throw new Error("empty bytes");
    }
    switch (bytes[0]) {
      case 1:
        return _Cache.default.ethereumTransactionDataEip2930FromBytes(bytes);
      case 2:
        return _Cache.default.ethereumTransactionDataEip1559FromBytes(bytes);
      default:
        return _Cache.default.ethereumTransactionDataLegacyFromBytes(bytes);
    }
  }

  // eslint-disable-next-line jsdoc/require-returns-check
  /**
   * @returns {Uint8Array}
   */
  toBytes() {
    throw new Error("not implemented");
  }

  // eslint-disable-next-line jsdoc/require-returns-check
  /**
   * @returns {string}
   */
  toString() {
    throw new Error("not implemented");
  }

  // eslint-disable-next-line jsdoc/require-returns-check
  /**
   * @returns {{[key: string]: any}}
   */
  toJSON() {
    throw new Error("not implemented");
  }
}
exports.default = EthereumTransactionData;