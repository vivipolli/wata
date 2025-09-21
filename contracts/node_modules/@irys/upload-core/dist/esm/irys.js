import buildIrysTransaction from './transaction.js';
import Utils from './utils.js';
import { withdrawBalance } from './withdrawal.js';
import Query from '@irys/query';
export class Irys {
    api;
    utils;
    uploader;
    funder;
    _address;
    token;
    tokenConfig;
    transactions;
    approval;
    _readyPromise;
    url;
    bundles;
    IrysTransaction;
    static VERSION = 'REPLACEMEIRYSVERSION';
    debug = false;
    constructor({ url, bundles }) {
        switch (url) {
            case 'mainnet':
                url = 'https://uploader.irys.xyz';
                break;
            case 'devnet':
                url = 'https://devnet.irys.xyz';
                break;
        }
        if (!url)
            throw new Error(`Missing required Irys constructor parameter: URL or valid Network`);
        const parsed = new URL(url);
        // if(parsed.host.startsWith("node1") || parsed.host.includes("arweave")) throw new Error("")
        this.url = parsed;
        this.bundles = bundles;
        this.IrysTransaction = buildIrysTransaction(this);
    }
    get address() {
        if (!this._address)
            throw new Error('Address is undefined, please provide a wallet or run `await irys.ready()`');
        return this._address;
    }
    set address(address) {
        this._address = address;
    }
    get signer() {
        return this.tokenConfig.getSigner();
    }
    async withdrawBalance(amount) {
        return withdrawBalance(this.utils, this.api, amount);
    }
    async withdrawAll() {
        return withdrawBalance(this.utils, this.api, 'all');
    }
    /**
     * @deprecated Use getBalance with no address instead.
     *
     * Gets the balance for the loaded wallet
     * @returns balance (in winston)
     */
    async getLoadedBalance() {
        if (!this.address)
            throw new Error('address is undefined');
        return this.utils.getBalance(this.address);
    }
    /**
     * Gets the balance for the specified address
     * @param address address to query for
     * @returns the balance (in winston)
     */
    async getBalance(address) {
        if (address)
            return this.utils.getBalance(address);
        if (!this.address)
            throw new Error('address is undefined');
        return this.utils.getBalance(this.address);
    }
    /**
     * Sends amount atomic units to the specified bundler
     * @param amount amount to send in atomic units
     * @returns details about the fund transaction
     */
    async fund(amount, multiplier) {
        return this.funder.fund(amount, multiplier);
    }
    /**
     * Calculates the price for [bytes] bytes for the loaded token and Irys node.
     * @param bytes
     * @returns
     */
    async getPrice(bytes, opts) {
        return this.utils.getPrice(this.token, bytes, opts);
    }
    async verifyReceipt(receipt) {
        return Utils.verifyReceipt(this.bundles, receipt);
    }
    /**
     * Create a new IrysTransactions (flex token bundles dataItem)
     * @param data
     * @param opts - dataItemCreateOptions
     * @returns - a new IrysTransaction instance
     */
    createTransaction(data, opts) {
        return new this.IrysTransaction(data, this, opts);
    }
    /**
     * Returns the signer for the loaded token
     */
    getSigner() {
        return this.tokenConfig.getSigner();
    }
    async upload(data, opts) {
        return this.uploader.uploadData(data, opts);
    }
    /**
     * @deprecated - use upload instead
     */
    async uploadWithReceipt(data, opts) {
        return this.uploader.uploadData(data, {
            ...opts,
        });
    }
    async ready() {
        this.tokenConfig.ready ? await this.tokenConfig.ready() : true;
        this.address = this.tokenConfig.address;
        return this;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    get transaction() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const oThis = this;
        return {
            fromRaw(rawTransaction) {
                return new oThis.IrysTransaction(rawTransaction, oThis, {
                    dataIsRawTransaction: true,
                });
            },
        };
    }
    get search() {
        const q = new Query({ url: new URL('/graphql', this.url) });
        return q.search.bind(q);
    }
    query(queryOpts) {
        return new Query(queryOpts ?? { url: new URL('graphql', this.url) });
    }
}
export default Irys;
//# sourceMappingURL=irys.js.map