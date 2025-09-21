import type { QueryInfo } from "../../types";
export declare const paymentApprovals: {
    amount: string;
    payingAddress: string;
    approvedAddress: string;
    expiresBy: number;
    timestamp: number;
    token: string;
};
export type IrysPaymentApprovals = typeof paymentApprovals;
export declare const paymentApprovalVars: IrysPaymentApprovalVars;
export type IrysPaymentApprovalVars = {
    tokens?: string[];
    payingAddresses?: string[];
    approvedAddresses?: string[];
    pageSize?: number;
    order?: "ASC" | "DESC";
    after?: string;
};
export declare const irysPaymentApprovalsQuery: QueryInfo;
