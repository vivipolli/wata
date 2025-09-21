"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Query = _interopRequireWildcard(require("../query/Query.cjs"));
var _AccountId = _interopRequireDefault(require("./AccountId.cjs"));
var _LiveHash = _interopRequireDefault(require("./LiveHash.cjs"));
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
 * @typedef {import("@hashgraph/proto").proto.ICryptoGetLiveHashQuery} HieroProto.proto.ICryptoGetLiveHashQuery
 * @typedef {import("@hashgraph/proto").proto.ICryptoGetLiveHashResponse} HieroProto.proto.ICryptoGetLiveHashResponse
 * @typedef {import("@hashgraph/proto").proto.ILiveHash} HieroProto.proto.ILiveHash
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

/**
 * @augments {Query<LiveHash>}
 * @deprecated
 * Тhis query is no longer supported.
 */
class LiveHashQuery extends _Query.default {
  /**
   * @param {object} [props]
   * @param {AccountId | string} [props.accountId]
   * @param {Uint8Array} [props.hash]
   */
  constructor(props = {}) {
    super();

    /**
     * @type {?AccountId}
     * @private
     */
    this._accountId = null;
    if (props.accountId != null) {
      this.setAccountId(props.accountId);
    }

    /**
     * @type {?Uint8Array}
     * @private
     */
    this._hash = null;
    if (props.hash != null) {
      this.setHash(props.hash);
    }
  }

  /**
   * @internal
   * @param {HieroProto.proto.IQuery} query
   * @returns {LiveHashQuery}
   */
  static _fromProtobuf(query) {
    const hash = /** @type {HieroProto.proto.ICryptoGetLiveHashQuery} */
    query.cryptoGetLiveHash;

    // eslint-disable-next-line deprecation/deprecation
    return new LiveHashQuery({
      accountId: hash.accountID != null ? _AccountId.default._fromProtobuf(hash.accountID) : undefined,
      hash: hash.hash != null ? hash.hash : undefined
    });
  }

  /**
   * @returns {?AccountId}
   */
  get accountId() {
    return this._accountId;
  }

  /**
   * Set the account to which the livehash is associated.
   *
   * @param {AccountId | string} accountId
   * @returns {this}
   */
  setAccountId(accountId) {
    this._accountId = accountId instanceof _AccountId.default ? accountId : _AccountId.default.fromString(accountId);
    return this;
  }

  /**
   * @returns {?Uint8Array}
   */
  get liveHash() {
    return this._hash;
  }

  /**
   * Set the SHA-384 data in the livehash.
   *
   * @param {Uint8Array} hash
   * @returns {this}
   */
  setHash(hash) {
    this._hash = hash;
    return this;
  }

  /**
   * @param {Client} client
   */
  _validateChecksums(client) {
    if (this._accountId != null) {
      this._accountId.validateChecksum(client);
    }
  }

  /**
   * @override
   * @internal
   * @param {Channel} channel
   * @param {HieroProto.proto.IQuery} request
   * @returns {Promise<HieroProto.proto.IResponse>}
   */
  _execute(channel, request) {
    return channel.crypto.getLiveHash(request);
  }

  /**
   * @override
   * @internal
   * @param {HieroProto.proto.IResponse} response
   * @returns {HieroProto.proto.IResponseHeader}
   */
  _mapResponseHeader(response) {
    const cryptoGetLiveHash = /** @type {HieroProto.proto.ICryptoGetLiveHashResponse} */
    response.cryptoGetLiveHash;
    return /** @type {HieroProto.proto.IResponseHeader} */cryptoGetLiveHash.header;
  }

  /**
   * @protected
   * @override
   * @param {HieroProto.proto.IResponse} response
   * @returns {Promise<LiveHash>}
   */
  _mapResponse(response) {
    const hashes = /** @type {HieroProto.proto.ICryptoGetLiveHashResponse} */
    response.cryptoGetLiveHash;
    return Promise.resolve(_LiveHash.default._fromProtobuf(/** @type {HieroProto.proto.ILiveHash} */hashes.liveHash));
  }

  /**
   * @override
   * @internal
   * @param {HieroProto.proto.IQueryHeader} header
   * @returns {HieroProto.proto.IQuery}
   */
  _onMakeRequest(header) {
    return {
      cryptoGetLiveHash: {
        header,
        accountID: this._accountId != null ? this._accountId._toProtobuf() : null,
        hash: this._hash
      }
    };
  }

  /**
   * @returns {string}
   */
  _getLogId() {
    const timestamp = this._paymentTransactionId != null && this._paymentTransactionId.validStart != null ? this._paymentTransactionId.validStart : this._timestamp;
    return `LiveHashQuery:${timestamp.toString()}`;
  }
}

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/unbound-method, deprecation/deprecation
exports.default = LiveHashQuery;
_Query.QUERY_REGISTRY.set("cryptoGetLiveHash", LiveHashQuery._fromProtobuf);