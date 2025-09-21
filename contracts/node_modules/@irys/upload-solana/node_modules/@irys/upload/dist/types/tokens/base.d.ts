import type { Signer } from '@irys/bundles';
import type BigNumber from 'bignumber.js';
import type { Tx, TokenConfig } from '@irys/upload-core';
import type { NodeToken } from '../types';
import { Utils } from '@irys/upload-core';
import type BaseNodeIrys from '../base';
export declare abstract class BaseNodeToken implements NodeToken {
    base: [string, number];
    protected wallet: any;
    protected _address: string | undefined;
    protected providerUrl: any;
    protected providerInstance?: any;
    ticker: string;
    name: string;
    protected minConfirm: number;
    isSlow: boolean;
    needsFee: boolean;
    protected opts?: any;
    protected utils: Utils;
    irys: BaseNodeIrys;
    constructor(config: TokenConfig);
    get address(): string | undefined;
    private initializeAddress;
    price(): Promise<number>;
    abstract getTx(_txId: string): Promise<Tx>;
    abstract ownerToAddress(_owner: any): Promise<string>;
    abstract sign(_data: Uint8Array): Promise<Uint8Array>;
    abstract getSigner(): Signer;
    abstract verify(_pub: any, _data: Uint8Array, _signature: Uint8Array): Promise<boolean>;
    abstract getCurrentHeight(): Promise<BigNumber>;
    abstract getFee(_amount: BigNumber.Value, _to?: string, _multiplier?: BigNumber.Value): Promise<BigNumber | object>;
    abstract sendTx(_data: any): Promise<string | undefined>;
    abstract createTx(_amount: BigNumber.Value, _to: string, _fee?: string | object): Promise<{
        txId: string | undefined;
        tx: any;
    }>;
    abstract getPublicKey(): string | Buffer;
}
export declare function getRedstonePrice(token: string): Promise<number>;
