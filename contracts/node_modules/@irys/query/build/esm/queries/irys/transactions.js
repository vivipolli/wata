// derive type from minimal object, use this object to validate structure in code.
export const transactions = {
    id: "",
    receipt: {
        deadlineHeight: 0,
        signature: "",
        timestamp: 0,
        version: "",
    },
    tags: [{ name: "", value: "" }],
    address: "",
    token: "",
    signature: "",
    timestamp: 0,
};
// default variables
export const transactionVars = {
    ids: undefined,
    after: undefined,
    token: undefined,
    from: undefined,
    pageSize: 100,
    sort: "ASC",
    // hasTags: undefined,
    tags: undefined,
    fromTimestamp: undefined,
    toTimestamp: undefined,
};
export const irysTransactionsQuery = {
    name: "transactions",
    query: transactions,
    enumValues: ["order"],
    vars: transactionVars,
    remapVars: {
        pageSize: "first",
        sort: "order",
        from: "owners",
        fromTimestamp: (_k, v, vars) => {
            const ts = new Date(v).getTime();
            if (isNaN(ts))
                throw new Error("invalid from timestamp");
            vars.timestamp = { ...vars.timestamp, from: ts };
            vars.fromTimestamp = undefined;
        },
        toTimestamp: (_k, v, vars) => {
            const ts = new Date(v).getTime();
            if (isNaN(ts))
                throw new Error("invalid to timestamp");
            vars.timestamp = { ...vars.timestamp, to: ts };
            vars.toTimestamp = undefined;
        },
    },
    paging: {
        hasNextPage: "hasNextPage",
        cursor: "cursor",
        limiterName: "pageSize",
    },
};
//# sourceMappingURL=transactions.js.map