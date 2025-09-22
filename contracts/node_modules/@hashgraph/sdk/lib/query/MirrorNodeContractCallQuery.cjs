"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _MirrorNodeContractQuery = _interopRequireDefault(require("./MirrorNodeContractQuery.cjs"));
var hex = _interopRequireWildcard(require("../encoding/hex.cjs"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

/**
 A query that simulates a contract function call using the Hedera Mirror Node.
 * 
 * This query allows you to execute a read-only smart contract call without submitting a transaction
 * to the main network. It's useful for querying contract state or executing view/pure functions.
 * The simulation is performed against the state of the contract at a specific block height.
 */
class MirrorNodeContractCallQuery extends _MirrorNodeContractQuery.default {
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
      estimate: false,
      gasPrice: this.gasPrice?.toString(),
      gas: this.gasLimit?.toString(),
      blockNumber: this.blockNumber?.toString(),
      value: this.value?.toString()
    };
  }

  /**
   * @param {Client} client
   * @returns {Promise<string>}
   */
  async execute(client) {
    const mirrorNodeRequest = await this.performMirrorNodeRequest(client, this.JSONPayload);
    return mirrorNodeRequest.result;
  }
}
exports.default = MirrorNodeContractCallQuery;