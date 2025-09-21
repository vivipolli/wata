/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenAssociation} HieroProto.proto.ITokenAssociation
 */
/**
 * @typedef {object} TokenAssociationJSON
 * @property {?string} accountId
 * @property {?string} tokenId
 */
export default class TokenAssociation {
    /**
     * @internal
     * @abstract
     * @param {HieroProto.proto.ITokenAssociation} association
     * @returns {TokenAssociation}
     */
    static _fromProtobuf(association: HieroProto.proto.ITokenAssociation): TokenAssociation;
    /**
     * @param {object} props
     * @param {AccountId | string} [props.accountId]
     * @param {TokenId | string} [props.tokenId]
     */
    constructor(props?: {
        accountId?: string | AccountId | undefined;
        tokenId?: string | TokenId | undefined;
    });
    /**
     * @type {?AccountId}
     */
    _accountId: AccountId | null;
    /**
     * @type {?TokenId}
     */
    _tokenId: TokenId | null;
    _defaultMaxTransactionFee: Hbar;
    /**
     * @returns {?AccountId}
     */
    get accountId(): AccountId | null;
    /**
     * @param {AccountId | string} accountId
     * @returns {this}
     */
    setAccountId(accountId: AccountId | string): this;
    /**
     * @returns {?TokenId}
     */
    get tokenId(): TokenId | null;
    /**
     * @param {TokenId | string} tokenId
     * @returns {this}
     */
    setTokenId(tokenId: TokenId | string): this;
    /**
     * @internal
     * @abstract
     * @returns {HieroProto.proto.ITokenAssociation}
     */
    _toProtobuf(): HieroProto.proto.ITokenAssociation;
    /**
     * @returns {TokenAssociationJSON}
     */
    toJSON(): TokenAssociationJSON;
}
export namespace HieroProto {
    namespace proto {
        type ITokenAssociation = import("@hashgraph/proto").proto.ITokenAssociation;
    }
}
export type TokenAssociationJSON = {
    accountId: string | null;
    tokenId: string | null;
};
import AccountId from "../account/AccountId.js";
import TokenId from "../token/TokenId.js";
import Hbar from "../Hbar.js";
