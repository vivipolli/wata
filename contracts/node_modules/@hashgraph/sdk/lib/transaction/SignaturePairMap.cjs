"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _ObjectMap = _interopRequireDefault(require("../ObjectMap.cjs"));
var _PublicKey = _interopRequireDefault(require("../PublicKey.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * @augments {ObjectMap<PublicKey, Uint8Array>}
 */
class SignaturePairMap extends _ObjectMap.default {
  constructor() {
    super(s => _PublicKey.default.fromString(s));
  }

  /**
   * This function is used to create a SignaturePairMap from an already built transaction.
   * @param {import("@hashgraph/proto").proto.ISignatureMap} sigMap
   * @returns {SignaturePairMap}
   */
  static _fromTransactionSigMap(sigMap) {
    const signatures = new SignaturePairMap();
    const sigPairs = sigMap.sigPair != null ? sigMap.sigPair : [];
    for (const sigPair of sigPairs) {
      if (sigPair.pubKeyPrefix == null) {
        continue;
      }
      if (sigPair.ed25519 != null) {
        signatures._set(_PublicKey.default.fromBytesED25519(sigPair.pubKeyPrefix), sigPair.ed25519);
      } else if (sigPair.ECDSASecp256k1 != null) {
        signatures._set(_PublicKey.default.fromBytesECDSA(sigPair.pubKeyPrefix), sigPair.ECDSASecp256k1);
      }
    }
    return signatures;
  }

  /**
   *
   * @param {PublicKey} pubKey
   * @param {Uint8Array} signature
   * @returns {SignaturePairMap}
   */
  addSignature(pubKey, signature) {
    this._set(pubKey, signature);
    return this;
  }
}
exports.default = SignaturePairMap;