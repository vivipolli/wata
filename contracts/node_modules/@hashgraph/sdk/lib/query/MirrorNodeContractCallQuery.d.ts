/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */
/**
 A query that simulates a contract function call using the Hedera Mirror Node.
 *
 * This query allows you to execute a read-only smart contract call without submitting a transaction
 * to the main network. It's useful for querying contract state or executing view/pure functions.
 * The simulation is performed against the state of the contract at a specific block height.
 */
export default class MirrorNodeContractCallQuery extends MirrorNodeContractQuery {
    /**
     * @param {Client} client
     * @returns {Promise<string>}
     */
    execute(client: Client): Promise<string>;
}
export type Channel = import("../channel/Channel.js").default;
export type Client = import("../client/Client.js").default<any, any>;
import MirrorNodeContractQuery from "./MirrorNodeContractQuery.js";
