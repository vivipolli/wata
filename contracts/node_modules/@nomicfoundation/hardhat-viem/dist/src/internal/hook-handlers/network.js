import { initializeViem } from "../initialization.js";
export default async () => {
    const handlers = {
        async newConnection(context, next) {
            const connection = await next(context);
            connection.viem = initializeViem(connection.chainType, connection.provider, context.artifacts);
            return connection;
        },
    };
    return handlers;
};
//# sourceMappingURL=network.js.map