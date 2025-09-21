/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.HederaFunctionality} HieroProto.proto.HederaFunctionality
 */
declare class RequestType {
    /**
     * @internal
     * @param {number} code
     * @returns {RequestType}
     */
    static _fromCode(code: number): RequestType;
    /**
     * @hideconstructor
     * @internal
     * @param {number} code
     */
    constructor(code: number);
    /** @readonly */
    readonly _code: number;
    /**
     * @returns {string}
     */
    toString(): string;
    /**
     * @returns {HieroProto.proto.HederaFunctionality}
     */
    valueOf(): HieroProto.proto.HederaFunctionality;
}
declare namespace RequestType {
    let None: RequestType;
    let CryptoTransfer: RequestType;
    let CryptoUpdate: RequestType;
    let CryptoDelete: RequestType;
    let CryptoAddLiveHash: RequestType;
    let CryptoDeleteLiveHash: RequestType;
    let ContractCall: RequestType;
    let ContractCreate: RequestType;
    let ContractUpdate: RequestType;
    let FileCreate: RequestType;
    let FileAppend: RequestType;
    let FileUpdate: RequestType;
    let FileDelete: RequestType;
    let CryptoGetAccountBalance: RequestType;
    let CryptoGetAccountRecords: RequestType;
    let CryptoGetInfo: RequestType;
    let ContractCallLocal: RequestType;
    let ContractGetInfo: RequestType;
    let ContractGetBytecode: RequestType;
    let GetBySolidityID: RequestType;
    let GetByKey: RequestType;
    let CryptoGetLiveHash: RequestType;
    let CryptoGetStakers: RequestType;
    let FileGetContents: RequestType;
    let FileGetInfo: RequestType;
    let TransactionGetRecord: RequestType;
    let ContractGetRecords: RequestType;
    let CryptoCreate: RequestType;
    let SystemDelete: RequestType;
    let SystemUndelete: RequestType;
    let ContractDelete: RequestType;
    let Freeze: RequestType;
    let CreateTransactionRecord: RequestType;
    let CryptoAccountAutoRenew: RequestType;
    let ContractAutoRenew: RequestType;
    let GetVersionInfo: RequestType;
    let TransactionGetReceipt: RequestType;
    let ConsensusCreateTopic: RequestType;
    let ConsensusUpdateTopic: RequestType;
    let ConsensusDeleteTopic: RequestType;
    let ConsensusGetTopicInfo: RequestType;
    let ConsensusSubmitMessage: RequestType;
    let UncheckedSubmit: RequestType;
    let TokenCreate: RequestType;
    let TokenGetInfo: RequestType;
    let TokenFreezeAccount: RequestType;
    let TokenUnfreezeAccount: RequestType;
    let TokenGrantKycToAccount: RequestType;
    let TokenRevokeKycFromAccount: RequestType;
    let TokenDelete: RequestType;
    let TokenUpdate: RequestType;
    let TokenMint: RequestType;
    let TokenBurn: RequestType;
    let TokenAccountWipe: RequestType;
    let TokenAssociateToAccount: RequestType;
    let TokenDissociateFromAccount: RequestType;
    let ScheduleCreate: RequestType;
    let ScheduleDelete: RequestType;
    let ScheduleSign: RequestType;
    let ScheduleGetInfo: RequestType;
    let TokenGetAccountNftInfos: RequestType;
    let TokenGetNftInfo: RequestType;
    let TokenGetNftInfos: RequestType;
    let TokenFeeScheduleUpdate: RequestType;
    let NetworkGetExecutionTime: RequestType;
    let TokenPause: RequestType;
    let TokenUnpause: RequestType;
    let CryptoApproveAllowance: RequestType;
    let CryptoDeleteAllowance: RequestType;
    let GetAccountDetails: RequestType;
    let EthereumTransaction: RequestType;
    let NodeStakeUpdate: RequestType;
    let Prng: RequestType;
    let TransactionGetFastRecord: RequestType;
    let TokenUpdateNfts: RequestType;
    let NodeCreate: RequestType;
    let NodeUpdate: RequestType;
    let NodeDelete: RequestType;
    let TokenReject: RequestType;
    let TokenAirdrop: RequestType;
    let TokenCancelAirdrop: RequestType;
    let TokenClaimAirdrop: RequestType;
    let TssMessage: RequestType;
    let TssVote: RequestType;
    let TssShareSignature: RequestType;
    let TssEncryptionKey: RequestType;
    let StateSignatureTransaction: RequestType;
    let HintsKeyPublication: RequestType;
    let HintsPreprocessingVote: RequestType;
    let HintsPartialSignature: RequestType;
    let HistoryAssemblySignature: RequestType;
    let HistoryProofKeyPublication: RequestType;
    let HistoryProofVote: RequestType;
    let CrsPublication: RequestType;
    let AtomicBatch: RequestType;
}
export default RequestType;
export namespace HieroProto {
    namespace proto {
        type HederaFunctionality = import("@hashgraph/proto").proto.HederaFunctionality;
    }
}
