import { BaseWebIrys } from './base.js';
export class UploadBuilder {
    // public adapters: Adapter[]
    preAdapters;
    postAdapters;
    token;
    provider;
    config;
    constructed;
    constructor(tokenClass) {
        this.preAdapters = [];
        this.postAdapters = [];
        this.token = tokenClass;
        this.config = {
            url: 'mainnet',
            irysConfig: {},
            provider: undefined,
        };
    }
    withProvider(provider) {
        this.provider = provider;
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
    withTokenOptions(opts) {
        this.config.irysConfig.tokenOpts = opts;
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
        const irys = new BaseWebIrys({
            url: this.config.url,
            config: this.config.irysConfig,
            getTokenConfig: async (irys) => {
                for (const preAdapter of this.preAdapters) {
                    await preAdapter.adaptTokenPre(this, this.token);
                }
                if (!this.provider)
                    throw new Error('Missing required provider');
                this.constructed = new this.token({
                    irys,
                    wallet: this.provider,
                    providerUrl: this.config.irysConfig.providerUrl,
                    opts: this.config.irysConfig.tokenOpts,
                });
                for (const postAdapter of this.postAdapters) {
                    await postAdapter.adaptTokenPost(this, this.constructed);
                }
                return this.constructed;
            },
        });
        // TODO: fix this - this is required due to the async callback fn
        await irys.build({ wallet: this.provider, config: this.config.irysConfig });
        await irys.ready();
        return irys;
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
export const Builder = (tokenClass) => {
    return new UploadBuilder(tokenClass);
};
//# sourceMappingURL=builder.js.map