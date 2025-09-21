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