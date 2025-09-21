/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenRelationship} HieroProto.proto.ITokenRelationship
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HieroProto.proto.ITokenID
 */
/**
 * @typedef {import("long")} Long
 */
/**
 * @augments {ObjectMap<TokenId, TokenRelationship>}
 */
export default class TokenRelationshipMap extends ObjectMap<TokenId, TokenRelationship> {
    /**
     * @param {HieroProto.proto.ITokenRelationship[]} relationships
     * @returns {TokenRelationshipMap}
     */
    static _fromProtobuf(relationships: HieroProto.proto.ITokenRelationship[]): TokenRelationshipMap;
    constructor();
    /**
     * @returns {HieroProto.proto.ITokenRelationship[]}
     */
    _toProtobuf(): HieroProto.proto.ITokenRelationship[];
}
export namespace HieroProto {
    namespace proto {
        type ITokenRelationship = import("@hashgraph/proto").proto.ITokenRelationship;
        type ITokenID = import("@hashgraph/proto").proto.ITokenID;
    }
}
export type Long = import("long");
import TokenId from "../token/TokenId.js";
import TokenRelationship from "./TokenRelationship.js";
import ObjectMap from "../ObjectMap.js";
