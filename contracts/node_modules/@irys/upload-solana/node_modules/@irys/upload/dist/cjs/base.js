"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseNodeIrys = void 0;
const tslib_1 = require("tslib");
require("@irys/upload-core/hack");
const upload_core_1 = require("@irys/upload-core");
const upload_1 = tslib_1.__importDefault(require("./upload"));
const bundles = tslib_1.__importStar(require("./utils"));
class BaseNodeIrys extends upload_core_1.Irys {
    /**
     * Constructs a new Irys instance, as well as supporting subclasses
     * @param url - URL to the bundler
     * @param key - private key (in whatever form required)
     */
    constructor({ url, config, getTokenConfig, }) {
        super({ url, bundles });
        this.debug = config?.debug ?? false;
        this.api = new upload_core_1.Api({
            url: this.url,
            timeout: config?.timeout ?? 100000,
            headers: config?.headers,
        });
        this.getTokenConfig = getTokenConfig;
    }
    async build({ wallet, config, }) {
        this.tokenConfig = await this.getTokenConfig(this);
        if (this.url.host.includes('devnet.irys.xyz') && !config?.providerUrl)
            throw new Error(`Using ${this.url.host} requires a dev/testnet RPC to be configured! see https://docs.irys.xyz/build/d/networks#connecting-to-devnet`);
        this.token = this.tokenConfig.name;
        this.address = this.tokenConfig.address;
        this.utils = new upload_core_1.Utils(this.api, this.token, this.tokenConfig);
        this.funder = new upload_core_1.Fund(this.utils);
        this.uploader = new upload_1.default(this.api, this.utils, this.token, this.tokenConfig, this.IrysTransaction);
        this.transactions = new upload_core_1.Transaction(this);
        this.approval = new upload_core_1.Approval(this);
        this._readyPromise = this.tokenConfig.ready
            ? this.tokenConfig.ready()
            : new Promise((r) => r());
    }
    /**
     * Upload a file at the specified path to the bundler
     * @param path path to the file to upload
     * @returns bundler response
     */
    async uploadFile(path, opts) {
        return this.uploader.uploadFile(path, opts);
    }
    /**
     * @param path - path to the folder to be uploaded
     * @param indexFile - path to the index file (i.e index.html)
     * @param batchSize - number of items to upload concurrently
     * @param interactivePreflight - whether to interactively prompt the user for confirmation of upload (CLI ONLY)
     * @param keepDeleted - Whether to keep previously uploaded (but now deleted) files in the manifest
     * @param logFunction - for handling logging from the uploader for UX
     * @param manifestTags - For allowing the caller to pass tags that will be added to the manifest transaction.
     * @returns
     */
    async uploadFolder(path, { batchSize = 10, keepDeleted = true, indexFile, interactivePreflight, logFunction, manifestTags, itemOptions, } = {}) {
        return this.uploader.uploadFolder(path, {
            indexFile,
            batchSize,
            interactivePreflight,
            keepDeleted,
            logFunction,
            manifestTags,
            itemOptions,
        });
    }
}
exports.BaseNodeIrys = BaseNodeIrys;
exports.default = BaseNodeIrys;
//# sourceMappingURL=base.js.map