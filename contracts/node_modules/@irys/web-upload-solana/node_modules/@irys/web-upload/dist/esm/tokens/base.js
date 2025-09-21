import axios from 'axios';
import { Utils } from '@irys/upload-core';
export class BaseWebToken {
    base;
    wallet;
    _address;
    providerUrl;
    providerInstance;
    ticker;
    name;
    irys;
    config;
    opts;
    minConfirm = 5;
    isSlow = false;
    needsFee = true;
    inheritsRPC = false;
    constructor(config) {
        Object.assign(this, config);
        this.config = config;
    }
    // common methods
    get address() {
        return this._address;
    }
    async ready() {
        if (this.wallet) {
            this._address = await this.ownerToAddress(await this.getPublicKey());
        }
        else {
            this._address = undefined;
        }
    }
    async price() {
        return getRedstonePrice(this.ticker);
    }
}
export default BaseWebToken;
export async function getRedstonePrice(token) {
    const res = await axios.get(`https://api.redstone.finance/prices?symbol=${token}&provider=redstone&limit=1`);
    await Utils.checkAndThrow(res, 'Getting price data');
    return res.data[0].value;
}
//# sourceMappingURL=base.js.map