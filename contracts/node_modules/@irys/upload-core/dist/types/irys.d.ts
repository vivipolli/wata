import type { DataItemCreateOptions, Signer } from '@irys/bundles';
import type BigNumber from 'bignumber.js';
import type { Readable } from 'stream';
import type Api from './api';
import type Fund from './fund';
import type { Transaction } from './transactions';
import type { bundles, CreateAndUploadOptions, Token, FundResponse, IrysTransaction, IrysTransactionCreateOptions, IrysTransactonCtor, UploadReceipt, UploadReceiptData, UploadResponse, WithdrawalResponse, Network, Tags } from './types';
import type Uploader from './upload';
import Utils from './utils';
import Query from '@irys/query';
import type { Approval } from './approval';
export declare abstract class Irys {
    api: Api;
    utils: Utils;
    uploader: Uploader;
    funder: Fund;
    _address: string | undefined;
    token: string;
    tokenConfig: Token;
    transactions: Transaction;
    approval: Approval;
    protected _readyPromise: Promise<void> | undefined;
    url: URL;
    bundles: bundles;
    IrysTransaction: IrysTransactonCtor;
    static VERSION: string;
    debug: boolean;
    constructor({ url, bundles }: {
        url?: string | Network;
        bundles: bundles;
    });
    get address(): string;
    set address(address: string);
    get signer(): Signer;
    withdrawBalance(amount: BigNumber.Value | 'all'): Promise<WithdrawalResponse>;
    withdrawAll(): Promise<WithdrawalResponse>;
    /**
     * @deprecated Use getBalance with no address instead.
     *
     * Gets the balance for the loaded wallet
     * @returns balance (in winston)
     */
    getLoadedBalance(): Promise<BigNumber>;
    /**
     * Gets the balance for the specified address
     * @param address address to query for
     * @returns the balance (in winston)
     */
    getBalance(address?: string): Promise<BigNumber>;
    /**
     * Sends amount atomic units to the specified bundler
     * @param amount amount to send in atomic units
     * @returns details about the fund transaction
     */
    fund(amount: BigNumber.Value, multiplier?: number): Promise<FundResponse>;
    /**
     * Calculates the price for [bytes] bytes for the loaded token and Irys node.
     * @param bytes
     * @returns
     */
    getPrice(bytes: number, opts?: {
        tags?: Tags;
        address?: string;
    }): Promise<BigNumber>;
    verifyReceipt(receipt: UploadReceiptData): Promise<boolean>;
    /**
     * Create a new IrysTransactions (flex token bundles dataItem)
     * @param data
     * @param opts - dataItemCreateOptions
     * @returns - a new IrysTransaction instance
     */
    createTransaction(data: string | Buffer, opts?: IrysTransactionCreateOptions): IrysTransaction;
    /**
     * Returns the signer for the loaded token
     */
    getSigner(): Signer;
    upload(data: string | Buffer | Readable, opts?: CreateAndUploadOptions): Promise<UploadResponse>;
    /**
     * @deprecated - use upload instead
     */
    uploadWithReceipt(data: string | Buffer | Readable, opts?: DataItemCreateOptions): Promise<UploadReceipt>;
    ready(): Promise<this>;
    get transaction(): {
        fromRaw(rawTransaction: Uint8Array): IrysTransaction;
    };
    get search(): InstanceType<typeof Query>['search'];
    query(queryOpts?: ConstructorParameters<typeof Query>[0]): Query;
}
export default Irys;
