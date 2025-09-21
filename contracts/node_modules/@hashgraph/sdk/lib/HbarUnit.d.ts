/**
 * Represents a unit of HBAR currency measurement in the Hedera network.
 * Defines the various denominations of HBAR (tinybar, microbar, millibar, hbar, kilobar, megabar, gigabar)
 * and provides utilities for converting between these units. Each unit has a name, symbol, and conversion
 * rate to tinybar (the smallest unit of HBAR).
 */
declare class HbarUnit {
    /**
     * @param {string} unit
     * @returns {HbarUnit}
     */
    static fromString(unit: string): HbarUnit;
    /**
     * @internal
     * @param {string} name
     * @param {string} symbol
     * @param {BigNumber} tinybar
     */
    constructor(name: string, symbol: string, tinybar: BigNumber);
    /**
     * @internal
     * @readonly
     */
    readonly _name: string;
    /**
     * @internal
     * @readonly
     */
    readonly _symbol: string;
    /**
     * @internal
     * @readonly
     */
    readonly _tinybar: BigNumber;
}
declare namespace HbarUnit {
    let Tinybar: HbarUnit;
    let Microbar: HbarUnit;
    let Millibar: HbarUnit;
    let Hbar: HbarUnit;
    let Kilobar: HbarUnit;
    let Megabar: HbarUnit;
    let Gigabar: HbarUnit;
}
export default HbarUnit;
import BigNumber from "bignumber.js";
