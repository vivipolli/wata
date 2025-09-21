/**
 * Represents the identifier for a pending airdrop in the Hedera network.
 *
 * A PendingAirdropId contains information about a pending token or NFT airdrop,
 * including the sender, receiver, and the token or NFT being airdropped. This class
 * is used to track and identify specific airdrops in the system.
 */
export default class PendingAirdropId {
    /**
     * @param {HieroProto.proto.PendingAirdropId} pb
     * @returns {PendingAirdropId}
     */
    static fromBytes(pb: HieroProto.proto.PendingAirdropId): PendingAirdropId;
    /**
     *
     * @param {object} props
     * @param {AccountId} [props.senderId]
     * @param {AccountId} [props.receiverId]
     * @param {TokenId?} [props.tokenId]
     * @param {NftId?} [props.nftId]
     */
    constructor(props?: {
        senderId?: AccountId | undefined;
        receiverId?: AccountId | undefined;
        tokenId?: TokenId | null | undefined;
        nftId?: NftId | null | undefined;
    });
    _senderId: AccountId | null;
    _receiverId: AccountId | null;
    _tokenId: TokenId | null;
    _nftId: NftId | null;
    /**
     *
     * @param {AccountId} senderId
     * @returns {this}
     */
    setSenderid(senderId: AccountId): this;
    /**
     * @param {AccountId} receiverId
     * @returns {this}
     */
    setReceiverId(receiverId: AccountId): this;
    /**
     * @param {TokenId} tokenId
     * @returns {this}
     */
    setTokenId(tokenId: TokenId): this;
    /**
     * @param {NftId} nftId
     * @returns {this}
     */
    setNftId(nftId: NftId): this;
    /**
     * @returns {?AccountId}
     */
    get senderId(): AccountId | null;
    /**
     * @returns {?AccountId}
     */
    get receiverId(): AccountId | null;
    /**
     * @returns {?TokenId}
     */
    get tokenId(): TokenId | null;
    /**
     * @returns {?NftId}
     */
    get nftId(): NftId | null;
    /**
     *  @returns {HieroProto.proto.PendingAirdropId}
     */
    toBytes(): HieroProto.proto.PendingAirdropId;
}
export namespace HieroProto {
    namespace proto {
        type PendingAirdropId = import("@hashgraph/proto").proto.PendingAirdropId;
    }
}
import AccountId from "../account/AccountId.js";
import TokenId from "./TokenId.js";
import NftId from "./NftId.js";
