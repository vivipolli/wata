"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _SemanticVersion = _interopRequireDefault(require("./SemanticVersion.cjs"));
var HieroProto = _interopRequireWildcard(require("@hashgraph/proto"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * Response when the client sends the node CryptoGetVersionInfoQuery.
 */
class NetworkVersionInfo {
  /**
   * @private
   * @param {object} props
   * @param {SemanticVersion} props.protobufVersion
   * @param {SemanticVersion} props.servicesVersion
   */
  constructor(props) {
    /**
     * The account ID for which this information applies.
     *
     * @readonly
     */
    this.protobufVersion = props.protobufVersion;

    /**
     * The account ID for which this information applies.
     *
     * @readonly
     */
    this.servicesVersion = props.servicesVersion;
    Object.freeze(this);
  }

  /**
   * @internal
   * @param {HieroProto.proto.INetworkGetVersionInfoResponse} info
   * @returns {NetworkVersionInfo}
   */
  static _fromProtobuf(info) {
    return new NetworkVersionInfo({
      protobufVersion: _SemanticVersion.default._fromProtobuf(/** @type {HieroProto.proto.ISemanticVersion} */
      info.hapiProtoVersion),
      servicesVersion: _SemanticVersion.default._fromProtobuf(/** @type {HieroProto.proto.ISemanticVersion} */
      info.hederaServicesVersion)
    });
  }

  /**
   * @internal
   * @returns {HieroProto.proto.INetworkGetVersionInfoResponse}
   */
  _toProtobuf() {
    return {
      hapiProtoVersion: this.protobufVersion._toProtobuf(),
      hederaServicesVersion: this.servicesVersion._toProtobuf()
    };
  }

  /**
   * @param {Uint8Array} bytes
   * @returns {NetworkVersionInfo}
   */
  static fromBytes(bytes) {
    return NetworkVersionInfo._fromProtobuf(HieroProto.proto.NetworkGetVersionInfoResponse.decode(bytes));
  }

  /**
   * @returns {Uint8Array}
   */
  toBytes() {
    return HieroProto.proto.NetworkGetVersionInfoResponse.encode(this._toProtobuf()).finish();
  }
}
exports.default = NetworkVersionInfo;