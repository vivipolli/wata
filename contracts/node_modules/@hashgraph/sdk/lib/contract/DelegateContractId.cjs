"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Cache = _interopRequireDefault(require("../Cache.cjs"));
var _ContractId = _interopRequireDefault(require("./ContractId.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @namespace {proto}
 * @typedef {import("@hashgraph/proto").proto.IContractID} HieroProto.proto.IContractID
 * @typedef {import("@hashgraph/proto").proto.IKey} HieroProto.proto.IKey
 */

/**
 * @typedef {import("long")} Long
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

/**
 * epresents a delegatable smart contract ID on the Hedera network.
 * This class extends ContractId and provides additional functionality for delegatable contracts.
 */
class DelegateContractId extends _ContractId.default {
  /**
   * @param {number | Long | import("../EntityIdHelper").IEntityId} props
   * @param {(number | Long)=} realm
   * @param {(number | Long)=} num
   * @param {Uint8Array=} evmAddress
   */
  constructor(props, realm, num, evmAddress) {
    super(props, realm, num, evmAddress);
  }

  /**
   * @param {string} text
   * @returns {DelegateContractId}
   */
  static fromString(text) {
    return new DelegateContractId(_ContractId.default.fromString(text));
  }

  /**
   * @internal
   * @param {HieroProto.proto.IContractID} id
   * @returns {DelegateContractId}
   */
  static _fromProtobuf(id) {
    return new DelegateContractId(_ContractId.default._fromProtobuf(id));
  }

  /**
   * @param {Uint8Array} bytes
   * @returns {DelegateContractId}
   */
  static fromBytes(bytes) {
    return new DelegateContractId(_ContractId.default.fromBytes(bytes));
  }

  /**
   * @param {string} address
   * @deprecated - Use `fromEvmAddress` instead
   * @returns {DelegateContractId}
   */
  static fromSolidityAddress(address) {
    // eslint-disable-next-line deprecation/deprecation
    return new DelegateContractId(_ContractId.default.fromSolidityAddress(address));
  }

  /**
   * @returns {DelegateContractId}
   */
  clone() {
    const id = new DelegateContractId(this);
    id._checksum = this._checksum;
    return id;
  }

  /**
   * @returns {HieroProto.proto.IKey}
   */
  _toProtobufKey() {
    return {
      delegatableContractId: this._toProtobuf()
    };
  }

  /**
   * @param {HieroProto.proto.IContractID} key
   * @returns {DelegateContractId}
   */
  static __fromProtobufKey(key) {
    return DelegateContractId._fromProtobuf(key);
  }
}
exports.default = DelegateContractId;
_Cache.default.setDelegateContractId(key => DelegateContractId.__fromProtobufKey(key));