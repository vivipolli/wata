/**
 * Describes how the gRPC request failed.
 *
 * Exists in order for the Hiero JavaScript SDK to produce the same error type for gRPC errors regardless of
 * operating in node or the browser.
 *
 * Definition taken from <https://grpc.github.io/grpc/node/grpc.html#~ServiceError>.
 */
export default class GrpcServiceError extends Error {
    /**
     * @param {Error & { code?: number; details?: string }} obj
     * @returns {Error}
     */
    static _fromResponse(obj: Error & {
        code?: number;
        details?: string;
    }): Error;
    /**
     * @param {GrpcStatus} status
     * @param {string} [nodeAccountId]
     */
    constructor(status: GrpcStatus, nodeAccountId?: string);
    /**
     * @readonly
     */
    readonly status: GrpcStatus;
    /**
     * Optional: node account ID associated with the error
     */
    nodeAccountId: string | undefined;
}
import GrpcStatus from "./GrpcStatus.js";
