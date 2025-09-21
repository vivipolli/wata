"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uploader = exports.CHUNKING_THRESHOLD = void 0;
const tslib_1 = require("tslib");
/* eslint-disable no-case-declarations */
const promise_pool_1 = require("@supercharge/promise-pool");
const bundles_1 = require("@irys/bundles");
const base64url_1 = tslib_1.__importDefault(require("base64url"));
const chunkingUploader_1 = require("./chunkingUploader");
const types_1 = require("./types");
const crypto_1 = require("crypto");
const async_retry_1 = tslib_1.__importDefault(require("async-retry"));
const utils_1 = require("./utils");
exports.CHUNKING_THRESHOLD = 50_000_000;
// eslint-disable-next-line @typescript-eslint/naming-convention
class Uploader {
    constructor(api, utils, token, tokenConfig, irysTransaction) {
        this.api = api;
        this.token = token;
        this.tokenConfig = tokenConfig;
        this.bundles = this.tokenConfig.irys.bundles;
        this.utils = utils;
        this.irysTransaction = irysTransaction;
    }
    async uploadTransaction(transaction, opts) {
        let res;
        const isDataItem = this.bundles.DataItem.isDataItem(transaction);
        if (this.forceUseChunking ||
            (isDataItem && transaction.getRaw().length >= exports.CHUNKING_THRESHOLD) ||
            !isDataItem) {
            res = await this.chunkedUploader.uploadTransaction(isDataItem ? transaction.getRaw() : transaction, opts);
        }
        else {
            const { url, timeout, headers: confHeaders } = this.api.getConfig();
            const headers = {
                'Content-Type': 'application/octet-stream',
                ...confHeaders,
            };
            if (opts?.paidBy)
                headers[types_1.UploadHeaders.PAID_BY] = opts.paidBy;
            res = await this.api.post(new URL(`/tx/${this.token}`, url).toString(), transaction.getRaw(), {
                headers: headers,
                timeout,
                maxBodyLength: Infinity,
            });
            if (res.status === 201) {
                throw new Error(res.data);
            }
        }
        switch (res.status) {
            case 402:
                const retryAfterHeader = res?.headers?.['retry-after'];
                const errorMsg = '402 error: ' +
                    res.data +
                    (retryAfterHeader ? ` - retry after ${retryAfterHeader}s` : '');
                throw new Error(errorMsg);
            default:
                if (res.status >= 400) {
                    throw new Error(`whilst uploading Irys transaction: ${res.status} ${(0, utils_1.httpErrData)(res)}`);
                }
        }
        res.data.verify = async () => this.utils.verifyReceipt(res.data);
        return res;
    }
    async uploadData(data, opts) {
        if (typeof data === 'string') {
            data = Buffer.from(data);
        }
        if (Buffer.isBuffer(data)) {
            if (data.length <= exports.CHUNKING_THRESHOLD) {
                const dataItem = this.bundles.createData(data, this.tokenConfig.getSigner(), {
                    ...opts,
                    anchor: opts?.anchor ?? (0, crypto_1.randomBytes)(32).toString('base64').slice(0, 32),
                });
                await dataItem.sign(this.tokenConfig.getSigner());
                return (await this.uploadTransaction(dataItem, { ...opts?.upload }))
                    .data;
            }
        }
        return (await this.chunkedUploader.uploadData(data, opts)).data;
    }
    // concurrently uploads transactions
    async concurrentUploader(data, opts) {
        const errors = [];
        const logFn = opts?.logFunction
            ? opts?.logFunction
            : async (_) => {
                return;
            };
        const concurrency = opts?.concurrency ?? 5;
        const results = (await promise_pool_1.PromisePool.for(data)
            .withConcurrency(concurrency >= 1 ? concurrency : 5)
            .handleError(async (error, _, pool) => {
            errors.push(error);
            if (error.message.includes('402 error')) {
                pool.stop();
                throw error;
            }
        })
            .process(async (item, i, pool) => {
            await (0, async_retry_1.default)(async (bail) => {
                try {
                    const res = await this.processItem(item, opts?.itemOptions);
                    if (i % concurrency == 0) {
                        await logFn(`Processed ${i} Items`);
                    }
                    if (opts?.resultProcessor) {
                        return await opts.resultProcessor({ item, res, i }, pool);
                    }
                    else {
                        return { item, res, i };
                    }
                }
                catch (e) {
                    if (e?.message.includes('402 error')) {
                        bail(e);
                    }
                    throw e;
                }
            }, { retries: 3, minTimeout: 1000, maxTimeout: 10_000 });
        }));
        return { errors, results: results.results };
    }
    async processItem(data, opts) {
        if (this.bundles.DataItem.isDataItem(data)) {
            return this.uploadTransaction(data, { ...opts?.upload });
        }
        return this.uploadData(data, opts);
    }
    /**
     * geneates a folder/path manifest JSON object
     * @param config.items mapping of logical paths to item IDs
     * @param config.indexFile optional logical path of the index file for the manifest
     * @returns
     */
    async generateFolder(config) {
        const { items, indexFile } = config;
        const manifest = {
            manifest: 'irys/paths',
            version: '0.1.0',
            paths: {},
        };
        if (indexFile) {
            if (!items.has(indexFile)) {
                throw new Error(`Unable to access item: ${indexFile}`);
            }
            manifest.index = { path: indexFile };
        }
        for (const [k, v] of items.entries()) {
            // @ts-expect-error constant index type
            manifest.paths[k] = { id: v };
        }
        return manifest;
    }
    get chunkedUploader() {
        return new chunkingUploader_1.ChunkingUploader(this.tokenConfig, this.api);
    }
    set useChunking(state) {
        if (typeof state === 'boolean') {
            this.forceUseChunking = state;
        }
    }
    set contentType(type) {
        // const fullType = mime.contentType(type)
        // if(!fullType){
        //     throw new Error("Invali")
        // }
        this.contentTypeOverride = type;
    }
    async uploadBundle(transactions, opts) {
        const { tx, txs, throwawayKey, throwawayKeyAddress } = await this.createBundle(transactions, opts);
        const res = await this.uploadTransaction(tx, opts);
        return { ...res, txs, throwawayKey, throwawayKeyAddress };
    }
    async createBundle(transactions, opts) {
        const throwawayKey = opts?.throwawayKey ??
            (await this.bundles.getCryptoDriver().generateJWK());
        const ephemeralSigner = new bundles_1.ArweaveSigner(throwawayKey);
        const txs = transactions.map((tx) => this.bundles.DataItem.isDataItem(tx)
            ? tx
            : this.bundles.createData(tx, ephemeralSigner));
        const bundle = await this.bundles.bundleAndSignData(txs, ephemeralSigner);
        // upload bundle with bundle specific tags, use actual signer for this.
        const tx = this.bundles.createData(bundle.getRaw(), this.tokenConfig.getSigner(), {
            ...opts?.bundleOpts,
            tags: [
                { name: 'Bundle-Format', value: 'binary' },
                { name: 'Bundle-Version', value: '2.0.0' },
                ...(opts?.bundleOpts?.tags ?? []),
            ],
        });
        const throwawayKeyAddress = (0, base64url_1.default)(Buffer.from(await this.bundles
            .getCryptoDriver()
            .hash(base64url_1.default.toBuffer((0, base64url_1.default)(ephemeralSigner.publicKey)))));
        await tx.sign(this.tokenConfig.getSigner());
        return { tx, throwawayKey, throwawayKeyAddress, txs };
    }
}
exports.Uploader = Uploader;
exports.default = Uploader;
//# sourceMappingURL=upload.js.map