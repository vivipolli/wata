"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Irys = void 0;
const tslib_1 = require("tslib");
const transaction_1 = tslib_1.__importDefault(require("./transaction"));
const utils_1 = tslib_1.__importDefault(require("./utils"));
const withdrawal_1 = require("./withdrawal");
const query_1 = tslib_1.__importDefault(require("@irys/query"));
class Irys {
    constructor({ url, bundles }) {
        this.debug = false;
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
        this.IrysTransaction = (0, transaction_1.default)(this);
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
        return (0, withdrawal_1.withdrawBalance)(this.utils, this.api, amount);
    }
    async withdrawAll() {
        return (0, withdrawal_1.withdrawBalance)(this.utils, this.api, 'all');
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
        return utils_1.default.verifyReceipt(this.bundles, receipt);
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
        const q = new query_1.default({ url: new URL('/graphql', this.url) });
        return q.search.bind(q);
    }
    query(queryOpts) {
        return new query_1.default(queryOpts ?? { url: new URL('graphql', this.url) });
    }
}
exports.Irys = Irys;
Irys.VERSION = 'REPLACEMEIRYSVERSION';
exports.default = Irys;
//# sourceMappingURL=irys.js.map