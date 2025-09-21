/**
 * @typedef {import("../EcdsaPrivateKey.js").KeyPair} KeyPair
 */
/**
 * @returns {KeyPair}
 */
export function generate(): KeyPair;
/**
 * @returns {Promise<KeyPair>}
 */
export function generateAsync(): Promise<KeyPair>;
/**
 * @param {Uint8Array} data
 * @returns {KeyPair}
 */
export function fromBytes(data: Uint8Array): KeyPair;
/**
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function getFullPublicKey(data: Uint8Array): Uint8Array;
/**
 * @param {Uint8Array} keydata
 * @param {Uint8Array} message
 * @returns {Uint8Array}
 */
export function sign(keydata: Uint8Array, message: Uint8Array): Uint8Array;
/**
 * @param {Uint8Array} keydata
 * @param {Uint8Array} message
 * @param {Uint8Array} signature
 * @returns {boolean}
 */
export function verify(keydata: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean;
/**
 * @param {Uint8Array} privateKey
 * @param {Uint8Array} signature - 64-byte compact signature (r || s)
 * @param {Uint8Array} message - Original message (not hashed)
 * @returns {number} Recovery ID (0–3), or -1
 */
export function getRecoveryId(privateKey: Uint8Array, signature: Uint8Array, message: Uint8Array): number;
export type KeyPair = import("../EcdsaPrivateKey.js").KeyPair;
