/**
 * A class to decode ASN.1 encoded data, typically used for parsing cryptographic key data.
 * @class
 */
export class ASN1Decoder {
    /**
     * Creates a new ASN1Decoder instance.
     * @param {Uint8Array|ArrayBuffer} data - The ASN.1 encoded data to decode.
     */
    constructor(data: Uint8Array | ArrayBuffer);
    /**
     * @private
     * @type {Uint8Array}
     */
    private data;
    /**
     * @private
     * @type {number}
     */
    private pos;
    /**
     * @private
     * @type {string[]}
     */
    private oids;
    /**
     * @private
     * @type {{[key: string]: string}}
     */
    private oidMap;
    /**
     * @private
     * @type {boolean}
     */
    private isPublicKey;
    /**
     * Reads the length field from the ASN.1 data.
     * @private
     * @returns {number} The length value.
     */
    private readLength;
    /**
     * Reads the type field from the ASN.1 data.
     * @private
     * @returns {number} The type value.
     */
    private readType;
    /**
     * Reads an integer value from the ASN.1 data.
     * @private
     * @returns {{integer: number}} Object containing the integer value.
     */
    private readInteger;
    /**
     * Reads an octet string from the ASN.1 data.
     * @private
     * @returns {{pkey: Uint8Array}} Object containing the private key data.
     */
    private readOctetString;
    /**
     * Reads a bit string from the ASN.1 data.
     * @private
     * @returns {{unusedBits: number, pubkey: Uint8Array}} Object containing the public key data and unused bits.
     */
    private readBitString;
    /**
     * Reads an object identifier from the ASN.1 data.
     * @private
     * @returns {{oid: string}} Object containing the OID as a string.
     */
    private readObjectIdentifier;
    /**
     * Gets the list of object identifiers found during decoding.
     * @returns {string[]} Array of OID strings.
     */
    getOids(): string[];
    /**
     * Gets the key types corresponding to the OIDs found during decoding.
     * @returns {string[]} Array of key type strings.
     */
    getOidKeyTypes(): string[];
    /**
     * Reads a sequence from the ASN.1 data.
     * @private
     * @returns {Array<any>} Array of decoded items in the sequence.
     */
    private readSequence;
    /**
     * Reads and decodes the next ASN.1 element.
     * @returns {any} The decoded ASN.1 element.
     * @throws {Error} If an unsupported type is encountered.
     */
    read(): any;
    /**
     * Checks if the decoded key is a public key.
     * @returns {boolean} True if the key is a public key, false otherwise.
     */
    isPublicKeyType(): boolean;
}
export function asn1DecodeStringDer(keyString: string): {
    keyTypes: string[];
    isPublicKey: boolean;
    isKeyListHex: boolean;
};
