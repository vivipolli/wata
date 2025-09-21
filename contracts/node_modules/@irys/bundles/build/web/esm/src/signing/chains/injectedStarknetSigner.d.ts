/// <reference types="node" />
import type { RpcProvider, WalletAccount } from "starknet";
import type { Signer } from "../index.js";
export default class InjectedStarknetSigner implements Signer {
    walletAccount: WalletAccount;
    publicKey: Buffer;
    provider: RpcProvider;
    chainId: string;
    accountContractId: number;
    readonly ownerLength: number;
    readonly signatureLength: number;
    readonly signatureType: number;
    constructor(provider: RpcProvider, walletAccount: WalletAccount, accountContractId: number);
    init(pubKey: string): Promise<void>;
    sign(message: Uint8Array, _opts?: any): Promise<Uint8Array>;
    static verify(pubkey: Buffer, message: Uint8Array, signature: Uint8Array, _opts?: any): Promise<boolean>;
}
