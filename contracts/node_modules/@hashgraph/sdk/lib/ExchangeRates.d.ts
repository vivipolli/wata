/**
 *  Represents a pair of exchange rates for HBAR to USD cents conversion.
 * Contains both the current exchange rate and the next exchange rate that will take effect.
 */
export default class ExchangeRates {
    /**
     * @internal
     * @param {HieroProto.proto.IExchangeRateSet} rateSet
     * @returns {ExchangeRates}
     */
    static _fromProtobuf(rateSet: HieroProto.proto.IExchangeRateSet): ExchangeRates;
    /**
     * @param {Uint8Array} bytes
     * @returns {ExchangeRates}
     */
    static fromBytes(bytes: Uint8Array): ExchangeRates;
    /**
     * @private
     * @param {object} props
     * @param {ExchangeRate} props.currentRate
     * @param {ExchangeRate} props.nextRate
     */
    private constructor();
    /**
     * @readonly
     */
    readonly currentRate: ExchangeRate;
    /**
     * @readonly
     */
    readonly nextRate: ExchangeRate;
    /**
     * @internal
     * @returns {HieroProto.proto.IExchangeRateSet}
     */
    _toProtobuf(): HieroProto.proto.IExchangeRateSet;
}
import ExchangeRate from "./ExchangeRate.js";
import * as HieroProto from "@hashgraph/proto";
