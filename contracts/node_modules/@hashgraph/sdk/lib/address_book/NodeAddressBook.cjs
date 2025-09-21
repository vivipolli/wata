"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _NodeAddress = _interopRequireDefault(require("./NodeAddress.cjs"));
var HieroProto = _interopRequireWildcard(require("@hashgraph/proto"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @typedef {import("./NodeAddress.js").NodeAddressJson} NodeAddressJson
 */

/**
 * @typedef {object} NodeAddressBookJson
 * @property {NodeAddressJson[]} nodeAddresses
 */

/**
 * Represents a collection of node addresses in the Hedera network.
 *
 * The NodeAddressBook contains information about the nodes in the Hedera network,
 * including their network addresses, account IDs, and node IDs. This class is used
 * to manage and access the network's node information.
 */
class NodeAddressBook {
  /**
   * @param {object} props
   * @param {NodeAddress[]} [props.nodeAddresses]
   */
  constructor(props = {}) {
    /**
     * @type {NodeAddress[]}
     */
    this._nodeAddresses = [];
    if (props.nodeAddresses != null) {
      this.setNodeAddresses(props.nodeAddresses);
    }
  }

  /**
   * @returns {NodeAddress[]}
   */
  get nodeAddresses() {
    return this._nodeAddresses;
  }

  /**
   * @param {NodeAddress[]} nodeAddresses
   * @returns {this}
   */
  setNodeAddresses(nodeAddresses) {
    this._nodeAddresses = nodeAddresses;
    return this;
  }

  /**
   * @param {Uint8Array} bytes
   * @returns {NodeAddressBook}
   */
  static fromBytes(bytes) {
    return NodeAddressBook._fromProtobuf(HieroProto.proto.NodeAddressBook.decode(bytes));
  }

  /**
   * @internal
   * @param {HieroProto.proto.INodeAddressBook} nodeAddressBook
   * @returns {NodeAddressBook}
   */
  static _fromProtobuf(nodeAddressBook) {
    return new NodeAddressBook({
      nodeAddresses: nodeAddressBook.nodeAddress != null ? nodeAddressBook.nodeAddress.map(nodeAddress => _NodeAddress.default._fromProtobuf(nodeAddress)) : undefined
    });
  }

  /**
   * @returns {HieroProto.proto.INodeAddressBook}
   */
  _toProtobuf() {
    return {
      nodeAddress: this._nodeAddresses.map(nodeAddress => nodeAddress._toProtobuf())
    };
  }

  /**
   * @returns {string}
   */
  toString() {
    return JSON.stringify(this.toJSON());
  }

  /**
   * @returns {NodeAddressBookJson}
   */
  toJSON() {
    return {
      nodeAddresses: this._nodeAddresses.map(nodeAddress => nodeAddress.toJSON())
    };
  }
  toBytes() {
    return HieroProto.proto.NodeAddressBook.encode(this._toProtobuf()).finish();
  }
}
exports.default = NodeAddressBook;