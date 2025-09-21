"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = buildIrysTransaction;
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
/**
 * Extended DataItem that allows for seamless Irys operations, such as signing and uploading.
 * Takes the same parameters as a regular DataItem.
 */
function buildIrysTransaction(irys) {
    class IrysTransaction extends irys.bundles.DataItem {
        constructor(data, irys, opts) {
            super(opts?.dataIsRawTransaction === true
                ? Buffer.from(data)
                : irys.bundles
                    .createData(data, irys.tokenConfig.getSigner(), {
                    ...opts,
                    anchor: opts?.anchor ??
                        crypto_1.default.randomBytes(32).toString('base64').slice(0, 32),
                })
                    .getRaw());
            this.Irys = irys;
            this.signer = irys.tokenConfig.getSigner();
        }
        sign() {
            return super.sign(this.signer);
        }
        get size() {
            return this.getRaw().length;
        }
        /**
         * @deprecated use upload
         */
        async uploadWithReceipt(opts) {
            return (await this.Irys.uploader.uploadTransaction(this, opts)).data;
        }
        async upload(opts) {
            return (await this.Irys.uploader.uploadTransaction(this, opts)).data;
        }
        // static fromRaw(rawTransaction: Buffer, IrysInstance: Irys): IrysTransaction {
        //   return new IrysTransaction(rawTransaction, IrysInstance, { dataIsRawTransaction: true });
        // }
        async getPrice() {
            return this.Irys.utils.getPrice(this.Irys.tokenConfig.name, this.size, {
                tags: this.tags,
            });
        }
        async isValid() {
            return irys.bundles.DataItem.verify(this.getRaw());
        }
    }
    return IrysTransaction;
}
// export abstract class IrysTransaction extends DataItem {}
// export interface IrysTransaction extends DataItem {
//   size: number;
//   uploadWithReceipt(opts?: UploadOptions): Promise<UploadReceipt>;
//   upload(opts: UploadOptions & { getReceiptSignature: true }): Promise<UploadReceipt>;
//   upload(opts?: UploadOptions): Promise<UploadResponse>;
// }
//# sourceMappingURL=transaction.js.map