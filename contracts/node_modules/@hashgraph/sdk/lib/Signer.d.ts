declare const _default: {};
export default _default;
export type LedgerId = import("./LedgerId.js").default;
export type SignerSignature = import("./SignerSignature.js").default;
export type TransactionId = import("./transaction/TransactionId.js").default;
export type Transaction = import("./transaction/Transaction.js").default;
export type TransactionResponse = import("./transaction/TransactionResponse.js").default;
export type TransactionReceipt = import("./transaction/TransactionReceipt.js").default;
export type TransactionRecord = import("./transaction/TransactionRecord.js").default;
export type AccountId = import("./account/AccountId.js").default;
export type AccountBalance = import("./account/AccountBalance.js").default;
export type AccountInfo = import("./account/AccountInfo.js").default;
export type Key = import("./Key.js").default;
/**
 * <O>
 */
export type Query<O extends unknown> = import("./query/Query.js").default<O>;
/**
 * <RequestT, ResponseT, OutputT>
 */
export type Executable<RequestT, ResponseT, OutputT> = import("./Executable.js").default<RequestT, ResponseT, OutputT>;
export type Signer = {
    getLedgerId: () => LedgerId | null;
    getAccountId: () => AccountId;
    getAccountKey?: (() => Key) | undefined;
    getNetwork: () => {
        [key: string]: (string | AccountId);
    };
    getMirrorNetwork: () => string[];
    sign: (messages: Uint8Array[]) => Promise<SignerSignature[]>;
    getAccountBalance: () => Promise<AccountBalance>;
    getAccountInfo: () => Promise<AccountInfo>;
    getAccountRecords: () => Promise<TransactionRecord[]>;
    signTransaction: <T extends Transaction>(transaction: T) => Promise<T>;
    checkTransaction: <T extends Transaction>(transaction: T) => Promise<T>;
    populateTransaction: <T extends Transaction>(transaction: T) => Promise<T>;
    call: <RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>) => Promise<OutputT>;
};
