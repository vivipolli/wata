/**
 * @typedef {object} MaxAttemptsOrTimeoutErrorJSON
 * @property {string} message
 * @property {string} nodeAccountId
 *
 */
export default class MaxAttemptsOrTimeoutError extends Error {
    /**
     * @param {string} message
     * @param {string} nodeAccountId
     */
    constructor(message: string, nodeAccountId: string);
    nodeAccountId: string;
    toJSON(): {
        message: string;
        nodeAccountId: string;
    };
    /**
     * @returns {MaxAttemptsOrTimeoutErrorJSON}
     */
    valueOf(): MaxAttemptsOrTimeoutErrorJSON;
}
export type MaxAttemptsOrTimeoutErrorJSON = {
    message: string;
    nodeAccountId: string;
};
