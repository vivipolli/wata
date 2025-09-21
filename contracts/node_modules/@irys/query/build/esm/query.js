import { GraphQLQuery } from "./graphql.js";
import { queries } from "./queries/index.js";
// import type { ArweaveBlock, ArweaveBlockVars } from "./queries/arweave/block.js";
// import type { ArweaveTransaction, ArweaveTransactionVars } from "./queries/arweave/transaction.js";
export class Query {
    opts;
    constructor(opts = { network: "mainnet" }) {
        this.opts = opts;
    }
    search(queryName, opts) {
        // const queryInstance =
        const query = opts?.query ?? queries[queryName];
        const queryInstance = new GraphQLQuery({ ...this.opts, query, queryName });
        // @ts-expect-error overloading
        return queryInstance;
    }
}
export default Query;
//# sourceMappingURL=query.js.map