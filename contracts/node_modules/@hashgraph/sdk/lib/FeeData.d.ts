/**
 * A total fee, in component amounts charged for a transaction.
 *
 * Total fees are composed of three sets of components.
 * - Node data, components that compensate the specific node that submitted
 *   the transaction.
 * - Network data, components that compensate the Hedera network for gossiping
 *   the transaction and determining the consensus timestamp.
 * - Service data, components that compensate the Hedera network for the ongoing
 *   maintenance and operation of the network, as well as ongoing development
 *   of network services.
 *
 * Fee components are recorded in thousandths of a tiny cent, and the network
 * exchange rate converts these to tinybar amounts, which are what the network
 * charges for transactions and what the network reports in the record stream.
 */
export default class FeeData {
    /**
     * @param {Uint8Array} bytes
     * @returns {FeeData}
     */
    static fromBytes(bytes: Uint8Array): FeeData;
    /**
     * @internal
     * @param {HieroProto.proto.IFeeData} feeData
     * @returns {FeeData}
     */
    static _fromProtobuf(feeData: HieroProto.proto.IFeeData): FeeData;
    /**
     * @param {object} [props]
     * @param {FeeComponents} [props.nodedata]
     * @param {FeeComponents} [props.networkdata]
     * @param {FeeComponents} [props.servicedata]
     * @param {FeeDataType} [props.feeDataType]
     */
    constructor(props?: {
        nodedata?: FeeComponents | undefined;
        networkdata?: FeeComponents | undefined;
        servicedata?: FeeComponents | undefined;
        feeDataType?: FeeDataType | undefined;
    });
    nodedata: FeeComponents | undefined;
    networkdata: FeeComponents | undefined;
    servicedata: FeeComponents | undefined;
    feeDataType: FeeDataType | undefined;
    /**
     * @internal
     * @returns {HieroProto.proto.IFeeData}
     */
    _toProtobuf(): HieroProto.proto.IFeeData;
    /**
     * @returns {Uint8Array}
     */
    toBytes(): Uint8Array;
}
import FeeComponents from "./FeeComponents.js";
import FeeDataType from "./FeeDataType.js";
import * as HieroProto from "@hashgraph/proto";
