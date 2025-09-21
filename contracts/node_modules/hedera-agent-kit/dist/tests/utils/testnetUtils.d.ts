import { PrivateKey } from "@hashgraph/sdk";
export type HederaKeyParams = {
    key: string;
    keyType: string;
};
export type HederaPrivateKeyResult = {
    privateKey: PrivateKey;
    type: "ECDSA" | "ED25519";
};
export type AccountData = {
    accountId: string;
    privateKey: string;
    publicKey: string;
};
export declare const hederaPrivateKeyFromString: ({ key, keyType, }: HederaKeyParams) => HederaPrivateKeyResult;
//# sourceMappingURL=testnetUtils.d.ts.map