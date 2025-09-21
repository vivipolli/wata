"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseNodeToken = void 0;
exports.getRedstonePrice = getRedstonePrice;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const upload_core_1 = require("@irys/upload-core");
class BaseNodeToken {
    constructor(config) {
        this.minConfirm = 5;
        this.isSlow = false;
        this.needsFee = true;
        Object.assign(this, config);
        this.initializeAddress();
        // this._address = this.wallet ? this.ownerToAddress(this.getPublicKey()) : undefined;
    }
    // common methods
    get address() {
        return this._address;
    }
    async initializeAddress() {
        if (this.wallet) {
            this._address = await this.ownerToAddress(this.getPublicKey());
        }
    }
    async price() {
        return getRedstonePrice(this.ticker);
    }
}
exports.BaseNodeToken = BaseNodeToken;
async function getRedstonePrice(token) {
    const res = await axios_1.default.get(`https://api.redstone.finance/prices?symbol=${token}&provider=redstone&limit=1`);
    await upload_core_1.Utils.checkAndThrow(res, 'Getting price data');
    return res.data[0].value;
}
//# sourceMappingURL=base.js.map