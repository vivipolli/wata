"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Query = _interopRequireWildcard(require("../query/Query.cjs"));
var _FileId = _interopRequireDefault(require("./FileId.cjs"));
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
 * @typedef {import("@hashgraph/proto").proto.IFileGetContentsQuery} HieroProto.proto.IFileGetContentsQuery
 * @typedef {import("@hashgraph/proto").proto.IFileGetContentsResponse} HieroProto.proto.IFileGetContentsResponse
 * @typedef {import("@hashgraph/proto").proto.FileGetContentsResponse.IFileContents} HieroProto.proto.FileGetContentsResponse.IFileContents
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../account/AccountId.js").default} AccountId
 */

/**
 * @augments {Query<Uint8Array>}
 * Retrieve the content of a file in HFS.<br/>
 * Note that this query retrieves _only_ the file content, not any of
 * the metadata for the file.
 */
class FileContentsQuery extends _Query.default {
  /**
   * @param {object} [props]
   * @param {FileId | string} [props.fileId]
   */
  constructor(props = {}) {
    super();

    /**
     * @type {?FileId}
     * @private
     */
    this._fileId = null;
    if (props.fileId != null) {
      this.setFileId(props.fileId);
    }
  }

  /**
   * @internal
   * @param {HieroProto.proto.IQuery} query
   * @returns {FileContentsQuery}
   */
  static _fromProtobuf(query) {
    const contents = /** @type {HieroProto.proto.IFileGetContentsQuery} */
    query.fileGetContents;
    return new FileContentsQuery({
      fileId: contents.fileID != null ? _FileId.default._fromProtobuf(contents.fileID) : undefined
    });
  }

  /**
   * @param {Client} client
   */
  _validateChecksums(client) {
    if (this._fileId != null) {
      this._fileId.validateChecksum(client);
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
    return channel.file.getFileContent(request);
  }

  /**
   * @returns {?FileId}
   */
  get fileId() {
    return this._fileId;
  }

  /**
   * Set the file ID for which the info is being requested.
   *
   * @param {FileId | string} fileId
   * @returns {FileContentsQuery}
   */
  setFileId(fileId) {
    this._fileId = typeof fileId === "string" ? _FileId.default.fromString(fileId) : fileId.clone();
    return this;
  }

  /**
   * @override
   * @internal
   * @param {HieroProto.proto.IResponse} response
   * @returns {HieroProto.proto.IResponseHeader}
   */
  _mapResponseHeader(response) {
    const fileGetContents = /** @type {HieroProto.proto.IFileGetContentsResponse} */
    response.fileGetContents;
    return /** @type {HieroProto.proto.IResponseHeader} */fileGetContents.header;
  }

  /**
   * @protected
   * @override
   * @param {HieroProto.proto.IResponse} response
   * @returns {Promise<Uint8Array>}
   */
  _mapResponse(response) {
    const fileContentsResponse = /** @type {HieroProto.proto.IFileGetContentsResponse} */
    response.fileGetContents;
    const fileConents = /** @type {HieroProto.proto.FileGetContentsResponse.IFileContents} */
    fileContentsResponse.fileContents;
    const contents = /** @type {Uint8Array} */fileConents.contents;
    return Promise.resolve(contents);
  }

  /**
   * @override
   * @internal
   * @param {HieroProto.proto.IQueryHeader} header
   * @returns {HieroProto.proto.IQuery}
   */
  _onMakeRequest(header) {
    return {
      fileGetContents: {
        header,
        fileID: this._fileId != null ? this._fileId._toProtobuf() : null
      }
    };
  }

  /**
   * @returns {string}
   */
  _getLogId() {
    const timestamp = this._paymentTransactionId != null && this._paymentTransactionId.validStart != null ? this._paymentTransactionId.validStart : this._timestamp;
    return `FileContentsQuery:${timestamp.toString()}`;
  }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
exports.default = FileContentsQuery;
_Query.QUERY_REGISTRY.set("fileGetContents", FileContentsQuery._fromProtobuf);