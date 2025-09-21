/**
 * @typedef {import("./Hbar.js").default} Hbar
 */
/**
 * Error thrown when a query's cost exceeds the maximum payment amount set on the client.
 *
 * This error is used to prevent unexpectedly expensive queries from being automatically executed.
 * When this error occurs, the user can either:
 * 1. Increase the maximum query payment on the client
 * 2. Explicitly approve the higher cost for this specific query
 */
export default class MaxQueryPaymentExceeded extends Error {
    /**
     * @param {Hbar} queryCost
     * @param {Hbar} maxQueryPayment
     */
    constructor(queryCost: Hbar, maxQueryPayment: Hbar);
    queryCost: import("./Hbar.js").default;
    maxQueryPayment: import("./Hbar.js").default;
}
export type Hbar = import("./Hbar.js").default;
