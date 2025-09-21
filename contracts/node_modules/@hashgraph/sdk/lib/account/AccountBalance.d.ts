/**
 * @typedef {object} TokenBalanceJson
 * @property {string} tokenId
 * @property {string} balance
 * @property {number} decimals
 */
/**
 * @typedef {object} AccountBalanceJson
 * @property {string} hbars
 * @property {TokenBalanceJson[]} tokens
 */
/**
 * Represents the balance of an account on the Hedera network, including both HBAR and token balances.
 */
export default class AccountBalance {
    /**
     * @param {Uint8Array} bytes
     * @returns {AccountBalance}
     */
    static fromBytes(bytes: Uint8Array): AccountBalance;
    /**
     * @internal
     * @param {HieroProto.proto.ICryptoGetAccountBalanceResponse} accountBalance
     * @returns {AccountBalance}
     */
    static _fromProtobuf(accountBalance: HieroProto.proto.ICryptoGetAccountBalanceResponse): AccountBalance;
    /**
     * @private
     * @param {object} props
     * @param {Hbar} props.hbars
     * @param {?TokenBalanceMap} props.tokens
     * @param {?TokenDecimalMap} props.tokenDecimals
     */
    private constructor();
    /**
     * The Hbar balance of the account
     *
     * @readonly
     */
    readonly hbars: Hbar;
    tokens: TokenBalanceMap | null;
    tokenDecimals: TokenDecimalMap | null;
    /**
     * @returns {HieroProto.proto.ICryptoGetAccountBalanceResponse}
     */
    _toProtobuf(): HieroProto.proto.ICryptoGetAccountBalanceResponse;
    /**
     * @returns {Uint8Array}
     */
    toBytes(): Uint8Array;
    /**
     * @returns {string}
     */
    toString(): string;
    /**
     * @returns {AccountBalanceJson}
     */
    toJSON(): AccountBalanceJson;
}
export type TokenBalanceJson = {
    tokenId: string;
    balance: string;
    decimals: number;
};
export type AccountBalanceJson = {
    hbars: string;
    tokens: TokenBalanceJson[];
};
import Hbar from "../Hbar.js";
import TokenBalanceMap from "./TokenBalanceMap.js";
import TokenDecimalMap from "./TokenDecimalMap.js";
import * as HieroProto from "@hashgraph/proto";
