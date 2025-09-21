/**
 * @param {Uint8Array} data
 * @returns {string}
 */
export function encode(data: Uint8Array): string;
/**
 * @param {string} text
 * @returns {Uint8Array}
 */
export function decode(text: string): Uint8Array;
/**
 * Check if a string is a valid hexadecimal string
 * @param {string} text - The string to check
 * @returns {boolean} - True if the string is a valid hex string, false otherwise
 */
export function isHexString(text: string): boolean;
/**
 * Encode with a specified length. Supports zero padding if the most significant byte is 0
 *
 * https://github.com/ethers-io/ethers.js/blob/master/packages/bytes/src.ts/index.ts#L315
 *
 * @param {Uint8Array} value
 * @param {number} length
 * @returns {string}
 */
export function hexZeroPadded(value: Uint8Array, length: number): string;
