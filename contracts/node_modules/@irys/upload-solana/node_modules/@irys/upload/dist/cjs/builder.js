"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Builder = exports.UploadBuilder = void 0;
const base_1 = require("./base");
class UploadBuilder {
    constructor(tokenClass) {
        this.preAdapters = [];
        this.postAdapters = [];
        this.token = tokenClass;
        this.config = {
            url: 'mainnet',
            key: undefined,
            irysConfig: {},
        };
    }
    withWallet(wallet) {
        if (!wallet)
            throw new Error('Provided wallet is undefined');
        this.wallet = wallet;
        return this;
    }
    mainnet() {
        this.config.url = 'mainnet';
        return this;
    }
    devnet() {
        this.config.url = 'devnet';
        return this;
    }
    withRpc(rpcUrl) {
        this.config.irysConfig.providerUrl = rpcUrl;
        return this;
    }
    bundlerUrl(url) {
        this.config.url = new URL(url).toString();
        return this;
    }
    network(network) {
        this.config.url = network;
        return this;
    }
    withAdapter(adapter) {
        // this.adapters.push(adapter)
        if (adapter.phase != 'post')
            this.preAdapters.push(adapter);
        if (adapter.phase != 'pre')
            this.postAdapters.push(adapter);
        // @ts-expect-error type intersection issues
        if (adapter.load)
            adapter.load(this);
        return this;
    }
    async build() {
        const irys = new base_1.BaseNodeIrys({
            url: this.config.url,
            config: this.config.irysConfig,
            getTokenConfig: async (irys) => {
                for (const preAdapter of this.preAdapters) {
                    await preAdapter.adaptTokenPre(this, this.token);
                }
                this.constructed = new this.token({
                    irys,
                    wallet: this.wallet,
                    providerUrl: this.config.irysConfig.providerUrl,
                    opts: this.config.irysConfig.tokenOpts,
                });
                for (const postAdapter of this.postAdapters) {
                    await postAdapter.adaptTokenPost(this, this.constructed);
                }
                return this.constructed;
            },
        });
        await irys.build({ wallet: this.wallet, config: this.config.irysConfig });
        await irys.ready();
        return irys;
    }
    // todo: add generics
    withTokenOptions(opts) {
        this.config.irysConfig.tokenOpts = opts;
        return this;
    }
    withIrysConfig(config) {
        this.config.irysConfig = { ...this.config.irysConfig, ...config };
        return this;
    }
    /**
     * Set the HTTP request timeout - useful if you have a slower connection
     * @param timeout - timeout in milliseconds
     * @returns this (builder)
     */
    timeout(timeout) {
        this.config.irysConfig.timeout = timeout;
        return this;
    }
    // Promise contract functions, so users can `await` a builder instance to resolve the builder, instead of having to call build().
    // very cool, thanks Knex.
    async then(onFulfilled, onRejected) {
        const res = this.build();
        return res.then(onFulfilled, onRejected);
    }
    async catch(onReject) {
        return this.then().catch(onReject);
    }
    async finally(onFinally) {
        return this.then().finally(onFinally);
    }
}
exports.UploadBuilder = UploadBuilder;
// function isClass(target: any): target is { new (...args: any[]): any } {
//     return target && typeof target === "function" && (/^(object|array)$/i.test(target.constructor.name) === false)
//   }
const Builder = (tokenClass) => {
    return new UploadBuilder(tokenClass);
};
exports.Builder = Builder;
//# sourceMappingURL=builder.js.map