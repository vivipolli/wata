"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _MirrorNodeContractQuery = _interopRequireDefault(require("./MirrorNodeContractQuery.cjs"));
var hex = _interopRequireWildcard(require("../encoding/hex.cjs"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

/**
 * A query that estimates the gas required for a contract function call using the Hedera Mirror Node.
 *
 * This query simulates a contract call to estimate the amount of gas that would be required
 * to execute the same call on the main network. It's useful for determining the appropriate
 * gas limit before submitting an actual transaction.
 */
class MirrorNodeContractEstimateQuery extends _MirrorNodeContractQuery.default {
  /**
   * @returns {object}
   */
  get JSONPayload() {
    if (this.callData == null) {
      throw new Error("Call data is required.");
    }
    return {
      data: hex.encode(this.callData),
      from: this.senderEvmAddress,
      to: this.contractEvmAddress,
      estimate: true,
      gasPrice: this.gasPrice?.toString(),
      gas: this.gasLimit?.toString(),
      blockNumber: this.blockNumber?.toString(),
      value: this.value?.toString()
    };
  }

  /**
   * @param {Client} client
   * @returns {Promise<number>}
   */
  async execute(client) {
    const mirrorNodeRequest = await this.performMirrorNodeRequest(client, this.JSONPayload);
    return Number(mirrorNodeRequest.result);
  }
}
exports.default = MirrorNodeContractEstimateQuery;