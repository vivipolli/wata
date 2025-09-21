/**
 * Represents a semantic versioning structure for software components.
 *
 * This class encapsulates the major, minor, and patch version numbers, following
 * the Semantic Versioning (SemVer) specification. It provides methods for creating,
 * comparing, and manipulating version numbers, ensuring that versioning adheres to
 * the SemVer rules.
 */
export default class SemanticVersion {
    /**
     * @internal
     * @param {HieroProto.proto.ISemanticVersion} version
     * @returns {SemanticVersion}
     */
    static _fromProtobuf(version: HieroProto.proto.ISemanticVersion): SemanticVersion;
    /**
     * @param {Uint8Array} bytes
     * @returns {SemanticVersion}
     */
    static fromBytes(bytes: Uint8Array): SemanticVersion;
    /**
     * @private
     * @param {object} props
     * @param {number} props.major
     * @param {number} props.minor
     * @param {number} props.patch
     */
    private constructor();
    /** @readonly */
    readonly major: number;
    /** @readonly */
    readonly minor: number;
    /** @readonly */
    readonly patch: number;
    /**
     * @internal
     * @returns {HieroProto.proto.ISemanticVersion}
     */
    _toProtobuf(): HieroProto.proto.ISemanticVersion;
    /**
     * @returns {Uint8Array}
     */
    toBytes(): Uint8Array;
}
import * as HieroProto from "@hashgraph/proto";
