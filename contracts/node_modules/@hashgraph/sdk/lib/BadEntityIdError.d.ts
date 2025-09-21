export default class BadEntityIdError extends Error {
    /**
     * @param {Long} shard
     * @param {Long} realm
     * @param {Long} num
     * @param {string} presentChecksum
     * @param {string} expectedChecksum
     */
    constructor(shard: Long, realm: Long, num: Long, presentChecksum: string, expectedChecksum: string);
    shard: import("long");
    realm: import("long");
    num: import("long");
    presentChecksum: string;
    expectedChecksum: string;
}
