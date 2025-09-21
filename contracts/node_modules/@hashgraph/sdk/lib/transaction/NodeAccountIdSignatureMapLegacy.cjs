"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _ObjectMap = _interopRequireDefault(require("../ObjectMap.cjs"));
var _PublicKey = _interopRequireDefault(require("../PublicKey.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * @deprecated
 * @augments {ObjectMap<PublicKey, Uint8Array>}
 */
class NodeAccountIdSignatureMap extends _ObjectMap.default {
  constructor() {
    super(s => _PublicKey.default.fromString(s));
  }

  /**
   * @param {import("@hashgraph/proto").proto.ISignatureMap} sigMap
   * @returns {NodeAccountIdSignatureMap}
   */
  static _fromTransactionSigMap(sigMap) {
    // eslint-disable-next-line deprecation/deprecation
    const signatures = new NodeAccountIdSignatureMap();
    const sigPairs = sigMap.sigPair != null ? sigMap.sigPair : [];
    for (const sigPair of sigPairs) {
      if (sigPair.pubKeyPrefix != null) {
        if (sigPair.ed25519 != null) {
          signatures._set(_PublicKey.default.fromBytesED25519(sigPair.pubKeyPrefix), sigPair.ed25519);
        } else if (sigPair.ECDSASecp256k1 != null) {
          signatures._set(_PublicKey.default.fromBytesECDSA(sigPair.pubKeyPrefix), sigPair.ECDSASecp256k1);
        }
      }
    }
    return signatures;
  }
}
exports.default = NodeAccountIdSignatureMap;