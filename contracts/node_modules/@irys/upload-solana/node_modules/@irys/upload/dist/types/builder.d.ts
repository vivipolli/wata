import { IrysConfig, Network } from '@irys/upload-core';
import { NodeIrysConfig, NodeToken } from './types';
import { BaseNodeIrys } from './base';
import { Irys } from '@irys/upload-core';
export type Adapter = PreAdapter | PostAdapter | BiphaseAdapter;
export interface BaseAdapter {
    phase: 'pre' | 'post' | 'both';
    load?: (builder: this) => void;
}
export interface PreAdapter extends BaseAdapter {
    phase: 'pre';
    adaptTokenPre: (builder: UploadBuilder, tokenConfig: ConstructableNodeToken) => Resolvable<void>;
}
export interface PostAdapter extends BaseAdapter {
    phase: 'post';
    adaptTokenPost: (builder: UploadBuilder, tokenConfig: NodeToken) => Resolvable<void>;
}
export interface BiphaseAdapter extends BaseAdapter {
    phase: 'both';
    adaptTokenPre: (builder: UploadBuilder, tokenConfig: ConstructableNodeToken) => Resolvable<void>;
    adaptTokenPost: (builder: UploadBuilder, tokenConfig: NodeToken) => Resolvable<void>;
}
export type Resolvable<T> = T | Promise<T>;
export type Constructable<A extends any[], T> = {
    new (...args: A): T;
};
export type ConstructableNodeToken = Constructable<[
    TokenConfigTrimmed
], NodeToken>;
export type TokenConfigTrimmed<Wallet = string | object, Opts = any> = {
    irys: Irys;
    wallet?: Wallet;
    providerUrl?: string;
    opts?: Opts;
};
export declare class UploadBuilder {
    preAdapters: (PreAdapter | BiphaseAdapter)[];
    postAdapters: (PostAdapter | BiphaseAdapter)[];
    token: ConstructableNodeToken;
    protected wallet: any;
    config: NodeIrysConfig & {
        irysConfig: IrysConfig;
    };
    constructed?: NodeToken;
    constructor(tokenClass: ConstructableNodeToken);
    withWallet(wallet: any): this;
    mainnet(): this;
    devnet(): this;
    withRpc(rpcUrl: string): this;
    bundlerUrl(url: URL | string): this;
    network(network: Network): this;
    withAdapter(adapter: Adapter): this;
    build(): Promise<BaseNodeIrys>;
    withTokenOptions(opts: any): this;
    withIrysConfig(config: IrysConfig): this;
    /**
     * Set the HTTP request timeout - useful if you have a slower connection
     * @param timeout - timeout in milliseconds
     * @returns this (builder)
     */
    timeout(timeout: number): this;
    then(onFulfilled?: ((value: BaseNodeIrys) => any | PromiseLike<BaseNodeIrys>) | undefined | null, onRejected?: (value: Error) => any | PromiseLike<Error> | undefined | null): Promise<BaseNodeIrys | never>;
    catch(onReject?: ((value: BaseNodeIrys) => any | PromiseLike<BaseNodeIrys>) | undefined | null): Promise<null>;
    finally(onFinally?: (() => void) | null | undefined): Promise<BaseNodeIrys | null>;
}
export declare const Builder: (tokenClass: ConstructableNodeToken) => UploadBuilder;
