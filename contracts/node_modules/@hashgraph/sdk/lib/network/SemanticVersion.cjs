"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var HieroProto = _interopRequireWildcard(require("@hashgraph/proto"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
// SPDX-License-Identifier: Apache-2.0

/**
 * Represents a semantic versioning structure for software components.
 *
 * This class encapsulates the major, minor, and patch version numbers, following
 * the Semantic Versioning (SemVer) specification. It provides methods for creating,
 * comparing, and manipulating version numbers, ensuring that versioning adheres to
 * the SemVer rules.
 */
class SemanticVersion {
  /**
   * @private
   * @param {object} props
   * @param {number} props.major
   * @param {number} props.minor
   * @param {number} props.patch
   */
  constructor(props) {
    /** @readonly */
    this.major = props.major;
    /** @readonly */
    this.minor = props.minor;
    /** @readonly */
    this.patch = props.patch;
    Object.freeze(this);
  }

  /**
   * @internal
   * @param {HieroProto.proto.ISemanticVersion} version
   * @returns {SemanticVersion}
   */
  static _fromProtobuf(version) {
    return new SemanticVersion({
      major: (/** @type {number} */version.major),
      minor: (/** @type {number} */version.minor),
      patch: (/** @type {number} */version.patch)
    });
  }

  /**
   * @internal
   * @returns {HieroProto.proto.ISemanticVersion}
   */
  _toProtobuf() {
    return {
      major: this.major,
      minor: this.minor,
      patch: this.patch
    };
  }

  /**
   * @param {Uint8Array} bytes
   * @returns {SemanticVersion}
   */
  static fromBytes(bytes) {
    return SemanticVersion._fromProtobuf(HieroProto.proto.SemanticVersion.decode(bytes));
  }

  /**
   * @returns {Uint8Array}
   */
  toBytes() {
    return HieroProto.proto.SemanticVersion.encode(this._toProtobuf()).finish();
  }
}
exports.default = SemanticVersion;