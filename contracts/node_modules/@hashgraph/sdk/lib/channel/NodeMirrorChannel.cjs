"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var grpc = _interopRequireWildcard(require("@grpc/grpc-js"));
var _MirrorChannel = _interopRequireDefault(require("./MirrorChannel.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
// SPDX-License-Identifier: Apache-2.0

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("./MirrorChannel.js").MirrorError} MirrorError
 */

/**
 * @internal
 */
class NodeMirrorChannel extends _MirrorChannel.default {
  /**
   * @internal
   * @param {string} address
   */
  constructor(address) {
    super();

    /**
     * @type {grpc.Client}
     * @private
     */
    this._client = new grpc.Client(address, address.endsWith(":50212") || address.endsWith(":443") ? grpc.credentials.createSsl() : grpc.credentials.createInsecure(), {
      "grpc.keepalive_time_ms": 90000,
      "grpc.keepalive_timeout_ms": 5000
    });
  }

  /**
   * @override
   * @returns {void}
   */
  close() {
    this._client.close();
  }

  /**
   * @override
   * @internal
   * @param {string} serviceName
   * @param {string} methodName
   * @param {Uint8Array} requestData
   * @param {(data: Uint8Array) => void} callback
   * @param {(error: MirrorError | Error) => void} error
   * @param {() => void} end
   * @returns {() => void}
   */
  makeServerStreamRequest(serviceName, methodName, requestData, callback, error, end) {
    const stream = this._client.makeServerStreamRequest(`/com.hedera.mirror.api.proto.${serviceName}/${methodName}`, value => value, value => value, Buffer.from(requestData)).on("data", (/** @type {Uint8Array} */data) => {
      callback(data);
    }).on("status", (/** @type {grpc.StatusObject} */status) => {
      if (status.code == 0) {
        end();
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .on("error", (/** @type {grpc.StatusObject} */err) => {
      error(err);
    });
    return () => {
      stream.cancel();
    };
  }
}
exports.default = NodeMirrorChannel;