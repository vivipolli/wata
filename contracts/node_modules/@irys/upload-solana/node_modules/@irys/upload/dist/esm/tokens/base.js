import axios from 'axios';
import { Utils } from '@irys/upload-core';
export class BaseNodeToken {
    base;
    wallet;
    _address;
    providerUrl;
    providerInstance;
    ticker;
    name;
    minConfirm = 5;
    isSlow = false;
    needsFee = true;
    opts;
    utils;
    irys;
    constructor(config) {
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
export async function getRedstonePrice(token) {
    const res = await axios.get(`https://api.redstone.finance/prices?symbol=${token}&provider=redstone&limit=1`);
    await Utils.checkAndThrow(res, 'Getting price data');
    return res.data[0].value;
}
//# sourceMappingURL=base.js.map