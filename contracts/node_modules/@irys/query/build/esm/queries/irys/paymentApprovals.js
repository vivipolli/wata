// derive type from minimal object, use this object to validate structure in code.
export const paymentApprovals = {
    amount: "",
    payingAddress: "",
    approvedAddress: "",
    expiresBy: 0,
    timestamp: 0,
    token: "",
};
// default variables
export const paymentApprovalVars = {
    tokens: undefined,
    payingAddresses: undefined,
    approvedAddresses: undefined,
    pageSize: 100,
    order: "ASC",
    after: undefined,
};
export const irysPaymentApprovalsQuery = {
    name: "paymentApprovals",
    query: paymentApprovals,
    enumValues: ["order"],
    vars: paymentApprovalVars,
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