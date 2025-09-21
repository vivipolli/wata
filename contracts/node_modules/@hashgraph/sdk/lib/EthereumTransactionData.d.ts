/**
 * Represents the base class for Ethereum transaction data.
 * This class provides the foundation for different types of Ethereum transactions
 * including Legacy, EIP-1559, and EIP-2930 transactions.
 */
export default class EthereumTransactionData {
    /**
     * @param {Uint8Array} bytes
     * @returns {EthereumTransactionData}
     */
    static fromBytes(bytes: Uint8Array): EthereumTransactionData;
    /**
     * @protected
     * @param {object} props
     * @param {Uint8Array} props.callData
     */
    protected constructor();
    callData: Uint8Array<ArrayBufferLike>;
    /**
     * @returns {Uint8Array}
     */
    toBytes(): Uint8Array;
    /**
     * @returns {string}
     */
    toString(): string;
    /**
     * @returns {{[key: string]: any}}
     */
    toJSON(): {
        [key: string]: any;
    };
}
