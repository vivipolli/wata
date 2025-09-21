/**
 * @param {Uint8Array} data
 * @returns {ArrayBuffer}
 */
export function encodeRequest(data: Uint8Array): ArrayBuffer;
/**
 * @param {ArrayBuffer} data
 * @param {number} byteOffset
 * @param {number} byteLength
 * @returns {Uint8Array}
 */
export function decodeUnaryResponse(data: ArrayBuffer, byteOffset?: number, byteLength?: number): Uint8Array;
/**
 * @internal
 * @abstract
 */
export default class Channel {
    /**
     * @protected
     * @type {?HieroProto.proto.CryptoService}
     */
    protected _crypto: HieroProto.proto.CryptoService | null;
    /**
     * @protected
     * @type {?HieroProto.proto.SmartContractService}
     */
    protected _smartContract: HieroProto.proto.SmartContractService | null;
    /**
     * @protected
     * @type {?HieroProto.proto.FileService}
     */
    protected _file: HieroProto.proto.FileService | null;
    /**
     * @protected
     * @type {?HieroProto.proto.ConsensusService}
     */
    protected _consensus: HieroProto.proto.ConsensusService | null;
    /**
     * @protected
     * @type {?HieroProto.proto.FreezeService}
     */
    protected _freeze: HieroProto.proto.FreezeService | null;
    /**
     * @protected
     * @type {?HieroProto.proto.NetworkService}
     */
    protected _network: HieroProto.proto.NetworkService | null;
    /**
     * @protected
     * @type {?HieroProto.proto.TokenService}
     */
    protected _token: HieroProto.proto.TokenService | null;
    /**
     * @protected
     * @type {?HieroProto.proto.ScheduleService}
     */
    protected _schedule: HieroProto.proto.ScheduleService | null;
    /**
     * @protected
     * @type {?HieroProto.proto.UtilService}
     */
    protected _util: HieroProto.proto.UtilService | null;
    /**
     * @protected
     * @type {?HieroProto.proto.AddressBookService}
     */
    protected _addressBook: HieroProto.proto.AddressBookService | null;
    /**
     * @abstract
     * @returns {void}
     */
    close(): void;
    /**
     * @returns {HieroProto.proto.CryptoService}
     */
    get crypto(): HieroProto.proto.CryptoService;
    /**
     * @returns {HieroProto.proto.SmartContractService}
     */
    get smartContract(): HieroProto.proto.SmartContractService;
    /**
     * @returns {HieroProto.proto.FileService}
     */
    get file(): HieroProto.proto.FileService;
    /**
     * @returns {HieroProto.proto.ConsensusService}
     */
    get consensus(): HieroProto.proto.ConsensusService;
    /**
     * @returns {HieroProto.proto.FreezeService}
     */
    get freeze(): HieroProto.proto.FreezeService;
    /**
     * @returns {HieroProto.proto.NetworkService}
     */
    get network(): HieroProto.proto.NetworkService;
    /**
     * @returns {HieroProto.proto.TokenService}
     */
    get token(): HieroProto.proto.TokenService;
    /**
     * @returns {HieroProto.proto.ScheduleService}
     */
    get schedule(): HieroProto.proto.ScheduleService;
    /**
     * @returns {HieroProto.proto.UtilService}
     */
    get util(): HieroProto.proto.UtilService;
    /**
     * @returns {HieroProto.proto.AddressBookService}
     */
    get addressBook(): HieroProto.proto.AddressBookService;
    /**
     * @abstract
     * @protected
     * @param {string} serviceName
     * @returns {import("protobufjs").RPCImpl}
     */
    protected _createUnaryClient(serviceName: string): import("protobufjs").RPCImpl;
}
import * as HieroProto from "@hashgraph/proto";
