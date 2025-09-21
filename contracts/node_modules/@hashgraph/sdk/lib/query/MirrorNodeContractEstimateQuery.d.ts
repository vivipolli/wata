/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */
/**
 * A query that estimates the gas required for a contract function call using the Hedera Mirror Node.
 *
 * This query simulates a contract call to estimate the amount of gas that would be required
 * to execute the same call on the main network. It's useful for determining the appropriate
 * gas limit before submitting an actual transaction.
 */
export default class MirrorNodeContractEstimateQuery extends MirrorNodeContractQuery {
    /**
     * @param {Client} client
     * @returns {Promise<number>}
     */
    execute(client: Client): Promise<number>;
}
export type Channel = import("../channel/Channel.js").default;
export type Client = import("../client/Client.js").default<any, any>;
import MirrorNodeContractQuery from "./MirrorNodeContractQuery.js";
