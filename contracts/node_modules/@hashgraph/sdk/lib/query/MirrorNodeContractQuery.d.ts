/**
 * @typedef {import("../contract/ContractId").default} ContractId
 * @typedef {import("../account/AccountId").default} AccountId
 * @typedef {import("../client/Client.js").default<*, *>} Client
 *
 */
/**
 * @typedef {object} MirrorNodeResponse
 * @property {string} result
 * @property {string} [error]
 * @property {string} [gasUsed]
 * @property {string} [contractAddress]
 * @property {string} [status]
 */
/**
 * MirrorNodeContractQuery returns a result from EVM execution such as cost-free execution of read-only smart contract
 * queries, gas estimation, and transient simulation of read-write operations.
 * When working with sender that has ECDSA key with alias, you MUST:
 * 1. Retrieve the account's EVM address from the Mirror Node API first
 * 2. Use setSenderEvmAddress() instead of setSender()
 *
 * This is because EVM addresses for accounts with ECDSA keys and aliases cannot be automatically
 * derived and must be fetched from the Mirror Node. Example:
 *
 * ```javascript
 * // For accounts with ECDSA keys and aliases:
 * const evmAddress = // ... fetch from Mirror Node API ...
 * query.setSenderEvmAddress(evmAddress);
 * ```
 */
export default class MirrorNodeContractQuery {
    _contractId: import("../contract/ContractId").default | null;
    _contractEvmAddress: any;
    _sender: import("../account/AccountId").default | null;
    _senderEvmAddress: string | null;
    _functionName: any;
    _functionParameters: Uint8Array<ArrayBufferLike> | null;
    _value: import("long") | null;
    _gasLimit: import("long") | null;
    _gasPrice: import("long") | null;
    _blockNumber: import("long") | null;
    /**
     *
     * @param {ContractId} contractId
     * @description Sets the contract instance to call.
     * @returns {this}
     */
    setContractId(contractId: ContractId): this;
    /**
     * @param {AccountId} sender
     * @description Sets the sender of the transaction simulation.
     * @returns {this}
     */
    setSender(sender: AccountId): this;
    /**
     * @param {string} sender
     * @description Set the 20-byte EVM address of the sender.
     * This method must be used explicitly when working with accounts that have ECDSA keys with aliases,
     * as their EVM addresses cannot be automatically derived and must be retrieved from the Mirror Node API.
     * The EVM address can be filled using `accountId.populateAccountEvmAddress(client)`
     * @returns {this}
     */
    setSenderEvmAddress(sender: string): this;
    /**
     *
     * @param {string} name
     * @param {ContractFunctionParameters} functionParameters
     * @description Sets the function to call, and the parameters to pass to the function
     * @returns {this}
     */
    setFunction(name: string, functionParameters: ContractFunctionParameters): this;
    /**
     * @param {Long} value
     * @description Sets the amount of value (in tinybars or wei) to be sent to the contract in the transaction.
     * Use this to specify an amount for a payable function call.
     * @returns {this}
     */
    setValue(value: Long): this;
    /**
     * @param {Long} gasLimit
     * @description Sets the gas limit for the contract call.
     * This specifies the maximum amount of gas that the transaction can consume.
     * @returns {this}
     */
    setGasLimit(gasLimit: Long): this;
    /**
     * @param {Long} gasPrice
     * @description Sets the gas price to be used for the contract call. This specifies the price of each unit of gas used in the transaction.
     * @returns {this}
     */
    setGasPrice(gasPrice: Long): this;
    /**
     * @param {Long} blockNumber
     * @description  Sets the block number for the simulation of the contract call.
     * The block number determines the context of the contract call simulation within the blockchain.
     * @returns {this}
     */
    setBlockNumber(blockNumber: Long): this;
    /**
     * @returns {ContractId?}
     */
    get contractId(): ContractId | null;
    /**
     * @returns {string}
     */
    get contractEvmAddress(): string;
    /**
     * @returns {AccountId?}
     */
    get sender(): AccountId | null;
    /**
     * @returns {string | null }
     */
    get senderEvmAddress(): string | null;
    /**
     * @returns {Uint8Array | null | undefined}
     */
    get callData(): Uint8Array | null | undefined;
    /**
     * @returns {Long?}
     */
    get value(): Long | null;
    /**
     * @returns {Long?}
     */
    get gasLimit(): Long | null;
    /**
     * @returns {Long?}
     */
    get gasPrice(): Long | null;
    /**
     * @returns {Long?}
     */
    get blockNumber(): Long | null;
    /**
     *
     * @param {Client} client
     * @param {object} jsonPayload
     * @returns {Promise<MirrorNodeResponse>}
     */
    performMirrorNodeRequest(client: Client, jsonPayload: object): Promise<MirrorNodeResponse>;
    _fillEvmAddress(): void;
    /**
     * @returns {object}
     */
    get JSONPayload(): object;
}
export type ContractId = import("../contract/ContractId").default;
export type AccountId = import("../account/AccountId").default;
export type Client = import("../client/Client.js").default<any, any>;
export type MirrorNodeResponse = {
    result: string;
    error?: string | undefined;
    gasUsed?: string | undefined;
    contractAddress?: string | undefined;
    status?: string | undefined;
};
import ContractFunctionParameters from "../contract/ContractFunctionParameters.js";
