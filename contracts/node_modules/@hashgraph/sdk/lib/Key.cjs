"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Cache = _interopRequireDefault(require("./Cache.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IKey} HieroProto.proto.IKey
 */

class Key {
  /**
   * @internal
   * @abstract
   * @returns {HieroProto.proto.IKey}
   */
  // eslint-disable-next-line jsdoc/require-returns-check
  _toProtobufKey() {
    throw new Error("not implemented");
  }

  /**
   * @internal
   * @param {HieroProto.proto.IKey} key
   * @returns {Key}
   */
  static _fromProtobufKey(key) {
    if (key.contractID != null) {
      return _Cache.default.contractId(key.contractID);
    }
    if (key.delegatableContractId != null) {
      return _Cache.default.delegateContractId(key.delegatableContractId);
    }
    if (key.ed25519 != null && key.ed25519.byteLength > 0) {
      return _Cache.default.publicKeyED25519(key.ed25519);
    }
    if (key.ECDSASecp256k1 != null && key.ECDSASecp256k1.byteLength > 0) {
      return _Cache.default.publicKeyECDSA(key.ECDSASecp256k1);
    }
    if (key.thresholdKey != null && key.thresholdKey.threshold != null) {
      return _Cache.default.thresholdKey(key.thresholdKey);
    }
    if (key.keyList != null) {
      return _Cache.default.keyList(key.keyList);
    }

    // @ts-ignore
    return null;

    /* throw new Error(
        `(BUG) keyFromProtobuf: not implemented key case: ${JSON.stringify(
            key
        )}`
    ); */
  }
}
exports.default = Key;