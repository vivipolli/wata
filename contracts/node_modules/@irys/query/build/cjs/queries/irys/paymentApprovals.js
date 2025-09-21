"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.irysPaymentApprovalsQuery = exports.paymentApprovalVars = exports.paymentApprovals = void 0;
// derive type from minimal object, use this object to validate structure in code.
exports.paymentApprovals = {
    amount: "",
    payingAddress: "",
    approvedAddress: "",
    expiresBy: 0,
    timestamp: 0,
    token: "",
};
// default variables
exports.paymentApprovalVars = {
    tokens: undefined,
    payingAddresses: undefined,
    approvedAddresses: undefined,
    pageSize: 100,
    order: "ASC",
    after: undefined,
};
exports.irysPaymentApprovalsQuery = {
    name: "paymentApprovals",
    query: exports.paymentApprovals,
    enumValues: ["order"],
    vars: exports.paymentApprovalVars,
    remapVars: {
        pageSize: "limit",
    },
    paging: {
        hasNextPage: "hasNextPage",
        cursor: "cursor",
        limiterName: "pageSize",
    },
};
//# sourceMappingURL=paymentApprovals.js.map