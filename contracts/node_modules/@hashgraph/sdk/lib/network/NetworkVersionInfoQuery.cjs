"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Query = _interopRequireWildcard(require("../query/Query.cjs"));
var _NetworkVersionInfo = _interopRequireDefault(require("./NetworkVersionInfo.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IQuery} HieroProto.proto.IQuery
 * @typedef {import("@hashgraph/proto").proto.IQueryHeader} HieroProto.proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").proto.IResponse} HieroProto.proto.IResponse
 * @typedef {import("@hashgraph/proto").proto.IResponseHeader} HieroProto.proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").proto.INetworkGetVersionInfoQuery} HieroProto.proto.INetworkGetVersionInfoQuery
 * @typedef {import("@hashgraph/proto").proto.INetworkGetVersionInfoResponse} HieroProto.proto.INetworkGetVersionInfoResponse
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 */

/**
 *
 * A query to retrieve version information about the Hedera network.
 *
 * This query returns information about the versions of both the Hedera Services software
 * and the protobuf schema in use by the network. This information is useful for ensuring
 * client-network compatibility and debugging version-related issues.
 *
 * @augments {Query<NetworkVersionInfo>}
 */
class NetworkVersionInfoQuery extends _Query.default {
  constructor() {
    super();
  }

  /**
   * @param {HieroProto.proto.IQuery} query
   * @returns {NetworkVersionInfoQuery}
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static _fromProtobuf(query) {
    return new NetworkVersionInfoQuery();
  }

  /**
   * @override
   * @internal
   * @param {Channel} channel
   * @param {HieroProto.proto.IQuery} request
   * @returns {Promise<HieroProto.proto.IResponse>}
   */
  _execute(channel, request) {
    return channel.network.getVersionInfo(request);
  }

  /**
   * @override
   * @internal
   * @param {HieroProto.proto.IResponse} response
   * @returns {HieroProto.proto.IResponseHeader}
   */
  _mapResponseHeader(response) {
    const networkGetVersionInfo = /** @type {HieroProto.proto.INetworkGetVersionInfoResponse} */
    response.networkGetVersionInfo;
    return /** @type {HieroProto.proto.IResponseHeader} */networkGetVersionInfo.header;
  }

  /**
   * @protected
   * @override
   * @param {HieroProto.proto.IResponse} response
   * @returns {Promise<NetworkVersionInfo>}
   */
  _mapResponse(response) {
    const info = /** @type {HieroProto.proto.INetworkGetVersionInfoResponse} */
    response.networkGetVersionInfo;
    return Promise.resolve(_NetworkVersionInfo.default._fromProtobuf(info));
  }

  /**
   * @override
   * @internal
   * @param {HieroProto.proto.IQueryHeader} header
   * @returns {HieroProto.proto.IQuery}
   */
  _onMakeRequest(header) {
    return {
      networkGetVersionInfo: {
        header
      }
    };
  }

  /**
   * @returns {string}
   */
  _getLogId() {
    const timestamp = this._paymentTransactionId != null && this._paymentTransactionId.validStart != null ? this._paymentTransactionId.validStart : this._timestamp;
    return `NetworkVersionInfoQuery:${timestamp.toString()}`;
  }
}
exports.default = NetworkVersionInfoQuery;
_Query.QUERY_REGISTRY.set("networkGetVersionInfo",
// eslint-disable-next-line @typescript-eslint/unbound-method
NetworkVersionInfoQuery._fromProtobuf);