"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _ManagedNode = _interopRequireDefault(require("./ManagedNode.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @typedef {import("./channel/MirrorChannel.js").default} MirrorChannel
 * @typedef {import("./ManagedNodeAddress.js").default} ManagedNodeAddress
 */

/**
 * @typedef {object} NewNode
 * @property {string} address
 * @property {(address: string, cert?: string) => MirrorChannel} channelInitFunction
 */

/**
 * @typedef {object} CloneNode
 * @property {MirrorNode} node
 * @property {ManagedNodeAddress} address
 */

/**
 * @augments {ManagedNode<MirrorChannel>}
 */
class MirrorNode extends _ManagedNode.default {
  /**
   * @param {object} props
   * @param {NewNode=} [props.newNode]
   * @param {CloneNode=} [props.cloneNode]
   */
  constructor(props = {}) {
    super(props);
  }

  /**
   * @returns {string}
   */
  getKey() {
    return this._address.toString();
  }
}
exports.default = MirrorNode;