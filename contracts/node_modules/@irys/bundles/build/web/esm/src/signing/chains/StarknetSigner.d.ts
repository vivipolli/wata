/// <reference types="node" />
import type { RpcProvider, TypedData, BigNumberish } from "starknet";
import { Account } from "starknet";
import type { Signer } from "../index.js";
export declare function extractX(bytes: Buffer): string;
export default class StarknetSigner implements Signer {
    protected signer: Account;
    publicKey: Buffer;
    address: string;
    private privateKey;
    provider: RpcProvider;
    chainId: string;
    accountContractId: number;
    readonly ownerLength: number;
    readonly signatureLength: number;
    readonly signatureType: number;
    constructor(provider: RpcProvider, address: string, privateKey: string, accountContractId: number);
    init(): Promise<void>;
    sign(message: Uint8Array, _opts?: any): Promise<Uint8Array>;
    static verify(pubkey: Buffer, message: Uint8Array, signature: Uint8Array, _opts?: any): Promise<boolean>;
}
export declare function decomposePubkey(pubkey: Buffer): [Buffer, Buffer, Buffer];
export declare function getTypedData(message: string, chainId: string): TypedData;
export declare function uint8ArrayToBigNumberishArray(uint8Arr: Uint8Array): BigNumberish[];
