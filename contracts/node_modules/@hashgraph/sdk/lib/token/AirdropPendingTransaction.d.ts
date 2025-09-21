/**
 * @typedef {import("../token/PendingAirdropId.js").default} PendingAirdropId
 */
export default class AirdropPendingTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {PendingAirdropId[]} [props.pendingAirdropIds]
     */
    constructor(props?: {
        pendingAirdropIds?: import("../token/PendingAirdropId.js").default[] | undefined;
    });
    /**
     * @private
     * @type {PendingAirdropId[]}
     */
    private _pendingAirdropIds;
    /**
     * @returns {PendingAirdropId[]}
     */
    get pendingAirdropIds(): PendingAirdropId[];
    /**
     *
     * @param {PendingAirdropId} pendingAirdropId
     * @returns {this}
     */
    addPendingAirdropId(pendingAirdropId: PendingAirdropId): this;
    /**
     *
     * @param {PendingAirdropId[]} pendingAirdropIds
     * @returns {this}
     */
    setPendingAirdropIds(pendingAirdropIds: PendingAirdropId[]): this;
}
export type PendingAirdropId = import("../token/PendingAirdropId.js").default;
import Transaction from "../transaction/Transaction.js";
