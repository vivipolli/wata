"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeUploader = exports.checkPath = void 0;
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const upload_core_1 = require("@irys/upload-core");
const mime_types_1 = tslib_1.__importDefault(require("mime-types"));
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
const stream_1 = require("stream");
const path_1 = require("path");
const csv_parse_1 = require("csv-parse");
const csv_stringify_1 = require("csv-stringify");
const checkPath = async (path) => {
    return fs_1.promises
        .stat(path)
        .then((_) => true)
        .catch((_) => false);
};
exports.checkPath = checkPath;
class NodeUploader extends upload_core_1.Uploader {
    constructor(api, utils, token, tokenConfig, irysTx) {
        super(api, utils, token, tokenConfig, irysTx);
    }
    /**
     * Uploads a file to the bundler
     * @param path to the file to be uploaded
     * @returns the response from the bundler
     */
    async uploadFile(path, opts) {
        if (!(await fs_1.promises
            .stat(path)
            .then((_) => true)
            .catch((_) => false))) {
            throw new Error(`Unable to access path: ${path}`);
        }
        // don't add Content-type tag if it already exists
        const hasContentTypeTag = opts?.tags &&
            opts.tags.some((t) => t.name.toLowerCase() === 'content-type');
        const mimeType = mime_types_1.default.contentType(mime_types_1.default.lookup(path) || 'application/octet-stream');
        (opts ??= {}).tags =
            hasContentTypeTag || mimeType === false
                ? (opts.tags ?? [])
                : [
                    {
                        name: 'Content-Type',
                        value: this.contentTypeOverride ?? mimeType,
                    },
                    ...(opts?.tags ?? []),
                ];
        const data = (0, fs_1.createReadStream)(path);
        return await this.uploadData(data, opts);
    }
    async *walk(dir) {
        for await (const d of await fs_1.promises.opendir(dir)) {
            const entry = (0, path_1.join)(dir, d.name);
            if (d.isDirectory())
                yield* await this.walk(entry);
            else if (d.isFile())
                yield entry;
        }
    }
    /**
     * Preprocessor for folder uploads, ensures the rest of the system has a correct operating environment.
     * @param path - path to the folder to be uploaded
     * @param indexFile - path to the index file (i.e index.html)
     * @param batchSize - number of items to upload concurrently
     * @param interactivePreflight - whether to interactively prompt the user for confirmation of upload (CLI ONLY)
     * @param keepDeleted - Whether to keep previously uploaded (but now deleted) files in the manifest
     * @param logFunction - for handling logging from the uploader for UX
     * @returns
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    async uploadFolder(path, { batchSize = 10, keepDeleted = true, indexFile, interactivePreflight, logFunction, manifestTags, itemOptions, } = { batchSize: 10, keepDeleted: true }) {
        path = (0, path_1.resolve)(path);
        const alreadyProcessed = new Map();
        const receiptTxs = new Map();
        if (!(await (0, exports.checkPath)(path))) {
            throw new Error(`Unable to access path: ${path}`);
        }
        // fallback to console.log if no logging function is given and interactive preflight is on.
        if (!logFunction && interactivePreflight) {
            logFunction = async (log) => {
                console.log(log);
            };
        }
        else if (!logFunction) {
            // blackhole logs
            logFunction = async (_) => {
                return;
            };
        }
        // manifest with folder name placed in parent directory of said folder - keeps contamination down.
        const manifestPath = (0, path_1.join)((0, path_1.join)(path, `${path_1.sep}..`), `${(0, path_1.basename)(path)}-manifest.csv`);
        const csvHeader = 'path,id,receipt\n';
        if (await (0, exports.checkPath)(manifestPath)) {
            const rstrm = (0, fs_1.createReadStream)(manifestPath);
            // check if empty
            if ((await fs_1.promises.stat(manifestPath)).size === 0) {
                await fs_1.promises.writeFile(manifestPath, csvHeader);
            }
            // validate header
            await new Promise((res) => {
                (0, fs_1.createReadStream)(manifestPath).once('data', async (d) => {
                    const fl = d.toString().split('\n')[0];
                    if (`${fl}\n` !== csvHeader) {
                        await fs_1.promises.writeFile(manifestPath, csvHeader);
                    }
                    res(d);
                });
            });
            const csvStream = stream_1.Readable.from(rstrm.pipe((0, csv_parse_1.parse)({ delimiter: ',', columns: true })));
            for await (const record of csvStream) {
                record;
                if (record.path && record.id) {
                    alreadyProcessed.set(record.path, record.id);
                    receiptTxs.set(record.path, JSON.parse(record.receipt));
                }
            }
        }
        else {
            await fs_1.promises.writeFile(manifestPath, csvHeader);
        }
        const files = [];
        let total = 0;
        let i = 0;
        for await (const f of this.walk(path)) {
            const relPath = (0, path_1.relative)(path, f);
            if (!alreadyProcessed.has(relPath)) {
                files.push(f);
                total += (await fs_1.promises.stat(f)).size;
            }
            else {
                alreadyProcessed.delete(relPath);
            }
            if (++i % batchSize == 0) {
                logFunction(`Checked ${i} files...`);
            }
        }
        if (!keepDeleted) {
            alreadyProcessed.clear();
        }
        // pass as param otherwise it thinks logFunction can be undef
        const uploadManifest = async (logFunction) => {
            // generate JSON
            await logFunction('Generating JSON manifest...');
            const jsonManifestPath = await this.generateManifestFromCsv(path, alreadyProcessed, indexFile);
            // upload the manifest
            await logFunction('Uploading JSON manifest...');
            const tags = [
                { name: 'Type', value: 'manifest' },
                { name: 'Content-Type', value: 'application/x.irys-manifest+json' },
                ...(manifestTags ?? []),
            ];
            const mres = await this.uploadData((0, fs_1.createReadStream)(jsonManifestPath), {
                tags,
            }).catch((e) => {
                throw new Error(`Failed to upload manifest: ${e.message}`);
            });
            await logFunction('Done!');
            if (mres?.id) {
                await fs_1.promises.writeFile((0, path_1.join)((0, path_1.join)(path, `${path_1.sep}..`), `${(0, path_1.basename)(path)}-id.txt`), JSON.stringify(mres));
            }
            else {
                throw new Error(`Unable to get upload ID! ${JSON.stringify(mres)}`);
            }
            return mres;
        };
        // TODO: add logic to detect changes (MD5/other hash)
        if (files.length == 0 && alreadyProcessed.size === 0) {
            logFunction('No items to process');
            // return the txID of the upload
            const idpath = (0, path_1.join)((0, path_1.join)(path, `${path_1.sep}..`), `${(0, path_1.basename)(path)}-id.txt`);
            if (await (0, exports.checkPath)(idpath)) {
                return JSON.parse(await fs_1.promises.readFile(idpath, 'utf-8'));
            }
            // assume manifest wasn't uploaded
            return await uploadManifest(logFunction);
        }
        // const zprice = (await this.utils.getPrice(this.currency, 0)).multipliedBy(files.length);
        // const price = (await this.utils.getPrice(this.currency, total)).plus(zprice).toFixed(0);
        const price = await this.utils.estimateFolderPrice({
            fileCount: files.length,
            totalBytes: total,
        });
        if (interactivePreflight) {
            if (!(await confirmation(`Authorize upload?\nTotal amount of data: ${total} bytes over ${files.length} files - cost: ${price} ${this.tokenConfig.base[0]} (${this.utils.fromAtomic(price).toFixed()} ${this.token})\n Y / N`))) {
                throw new Error('Confirmation failed');
            }
        }
        const stringifier = (0, csv_stringify_1.stringify)({
            header: false,
            columns: {
                path: 'path',
                id: 'id',
                receipt: 'receipt',
            },
        });
        const wstrm = (0, fs_1.createWriteStream)(manifestPath, { flags: 'a+' });
        stringifier.pipe(wstrm);
        const processor = async (data) => {
            if (data?.res?.id) {
                const receipt = data.res.signature
                    ? {
                        id: data.res.id,
                        block: data.res.block,
                        deadlineHeight: data.res.deadlineHeight,
                        public: data.res.public,
                        signature: data.res.signature,
                        timestamp: data.res.timestamp,
                        validatorSignatures: data.res.validatorSignatures,
                        version: data.res.version,
                    }
                    : {};
                receiptTxs.set((0, path_1.relative)(path, data.item), receipt);
                stringifier.write([
                    (0, path_1.relative)(path, data.item),
                    data.res.id,
                    JSON.stringify(receipt),
                ]);
            }
        };
        const processingResults = await this.concurrentUploader(files, {
            concurrency: batchSize,
            resultProcessor: processor,
            logFunction,
            itemOptions,
        });
        if (processingResults.errors.length > 0) {
            await logFunction(`${processingResults.errors.length} Errors detected, skipping manifest upload...`);
            const ewstrm = (0, fs_1.createWriteStream)((0, path_1.join)((0, path_1.join)(path, `${path_1.sep}..`), `${(0, path_1.basename)(path)}-errors.txt`), { flags: 'a+' });
            ewstrm.write(`Errors from upload at ${new Date().toString()}:\n`);
            processingResults.errors.forEach((e) => ewstrm.write(`${e?.stack ?? JSON.stringify(e)}\n`));
            await new Promise((res) => ewstrm.close(res));
            throw new Error(`${processingResults.errors.length} Errors detected - check ${(0, path_1.basename)(path)}-errors.txt for more information.`);
        }
        await logFunction(`Finished processing ${files.length} Items`);
        await new Promise((r) => wstrm.close(r));
        return await uploadManifest(logFunction);
    }
    /**
     * processes an item to convert it into a DataItem, and then uploads it.
     * @param item can be a string value, a path to a file, a Buffer of data or a DataItem
     * @returns A dataItem
     */
    async processItem(item, opts) {
        if (this.bundles.DataItem.isDataItem(item)) {
            return this.uploadTransaction(item, { ...opts?.upload });
        }
        let tags = [];
        if (typeof item === 'string') {
            if (await (0, exports.checkPath)(item)) {
                const mimeType = mime_types_1.default.contentType(mime_types_1.default.lookup(item) || 'application/octet-stream');
                if (mimeType)
                    tags = [
                        {
                            name: 'Content-Type',
                            value: this.contentTypeOverride ?? mimeType,
                        },
                    ];
                // returnVal = item;
                item = (0, fs_1.createReadStream)(item);
            }
            else {
                item = Buffer.from(item);
                if (this.contentTypeOverride) {
                    tags = [{ name: 'Content-Type', value: this.contentTypeOverride }];
                }
            }
        }
        return this.uploadData(item, {
            ...opts,
            tags: [...tags, ...(opts?.tags ?? [])],
        });
    }
    /**
     * Stream-based CSV parser and JSON assembler
     * @param path base path of the upload
     * @param indexFile optional path to an index file
     * @returns the path to the generated manifest
     */
    async generateManifestFromCsv(path, nowRemoved, indexFile) {
        const csvstrm = (0, csv_parse_1.parse)({ delimiter: ',', columns: true });
        const csvPath = (0, path_1.join)((0, path_1.join)(path, `${path_1.sep}..`), `${(0, path_1.basename)(path)}-manifest.csv`);
        const manifestPath = (0, path_1.join)((0, path_1.join)(path, `${path_1.sep}..`), `${(0, path_1.basename)(path)}-manifest.json`);
        const wstrm = (0, fs_1.createWriteStream)(manifestPath, { flags: 'w+' });
        (0, fs_1.createReadStream)(csvPath).pipe(csvstrm); // pipe csv
        /* eslint-disable quotes */
        // "header"
        wstrm.write(`{\n"manifest": "irys/paths",\n"version": "0.1.0",\n"paths": {\n`);
        const csvs = stream_1.Readable.from(csvstrm);
        let firstValue = true;
        for await (const d of csvs) {
            if (nowRemoved?.has(d.path)) {
                nowRemoved.delete(d.path);
                continue;
            }
            const prefix = firstValue ? '' : ',\n';
            wstrm.write(`${prefix}"${d.path.replaceAll('\\', '/')}":{"id":"${d.id}"}`);
            firstValue = false;
        }
        // "trailer"
        wstrm.write(`\n}`);
        // add index
        if (indexFile) {
            wstrm.write(`,\n"index":{"path":"${indexFile.replaceAll('\\', '/')}"}`);
        }
        wstrm.write(`\n}`);
        await new Promise((r) => wstrm.close(r));
        return manifestPath;
    }
}
exports.NodeUploader = NodeUploader;
async function confirmation(message) {
    const answers = await inquirer_1.default.prompt([
        { type: 'input', name: 'confirmation', message },
    ]);
    return answers.confirmation.toLowerCase() == 'y';
}
exports.default = NodeUploader;
//# sourceMappingURL=upload.js.map