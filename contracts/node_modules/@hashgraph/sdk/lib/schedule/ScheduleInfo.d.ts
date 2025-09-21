/**
 * Response when the client sends the node ScheduleGetInfoQuery.
 */
export default class ScheduleInfo {
    /**
     * @internal
     * @param {HieroProto.proto.IScheduleInfo} info
     * @returns {ScheduleInfo}
     */
    static _fromProtobuf(info: HieroProto.proto.IScheduleInfo): ScheduleInfo;
    /**
     * @private
     * @param {object} props
     * @param {ScheduleId} props.scheduleId;
     * @param {?AccountId} props.creatorAccountID;
     * @param {?AccountId} props.payerAccountID;
     * @param {?HieroProto.proto.ISchedulableTransactionBody} props.schedulableTransactionBody;
     * @param {?Key} props.adminKey
     * @param {?KeyList} props.signers;
     * @param {?string} props.scheduleMemo;
     * @param {?Timestamp} props.expirationTime;
     * @param {?Timestamp} props.executed;
     * @param {?Timestamp} props.deleted;
     * @param {?TransactionId} props.scheduledTransactionId;
     * @param {boolean} props.waitForExpiry;
     */
    private constructor();
    /**
     * @readonly
     */
    readonly scheduleId: ScheduleId;
    /**
     * @readonly
     */
    readonly creatorAccountId: AccountId | null;
    /**
     * @readonly
     */
    readonly payerAccountId: AccountId | null;
    /**
     * @readonly
     */
    readonly schedulableTransactionBody: HieroProto.proto.ISchedulableTransactionBody | null;
    /**
     * @readonly
     */
    readonly signers: KeyList | null;
    /**
     * @readonly
     */
    readonly scheduleMemo: string | null;
    /**
     * @readonly
     */
    readonly adminKey: Key | null;
    /**
     * @readonly
     */
    readonly expirationTime: Timestamp | null;
    /**
     * @readonly
     */
    readonly executed: Timestamp | null;
    /**
     * @readonly
     */
    readonly deleted: Timestamp | null;
    /**
     * @readonly
     */
    readonly scheduledTransactionId: TransactionId | null;
    /**
     *
     * @readonly
     */
    readonly waitForExpiry: boolean;
    /**
     * @returns {HieroProto.proto.IScheduleInfo}
     */
    _toProtobuf(): HieroProto.proto.IScheduleInfo;
    /**
     * @returns {Transaction}
     */
    get scheduledTransaction(): Transaction;
}
import ScheduleId from "./ScheduleId.js";
import AccountId from "../account/AccountId.js";
import * as HieroProto from "@hashgraph/proto";
import KeyList from "../KeyList.js";
import Key from "../Key.js";
import Timestamp from "../Timestamp.js";
import TransactionId from "../transaction/TransactionId.js";
import Transaction from "../transaction/Transaction.js";
