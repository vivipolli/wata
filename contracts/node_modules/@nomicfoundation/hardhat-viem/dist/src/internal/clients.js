import { HardhatError } from "@nomicfoundation/hardhat-errors";
import { createPublicClient, createWalletClient, createTestClient, custom as customTransport, } from "viem";
import { publicActionsL2, walletActionsL2 } from "viem/op-stack";
import { getAccounts } from "./accounts.js";
import { getChain, getMode, isDevelopmentNetwork } from "./chains.js";
export async function getPublicClient(provider, chainType, publicClientConfig) {
    const chain = publicClientConfig?.chain ?? (await getChain(provider, chainType));
    const { defaultClientParams, defaultTransportParams } = await getDefaultParams(provider);
    let publicClient = createPublicClient({
        chain,
        transport: customTransport(provider, defaultTransportParams),
        ...defaultClientParams,
        ...publicClientConfig,
    });
    if (chainType === "op") {
        publicClient = publicClient.extend(publicActionsL2());
    }
    /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions --
    We need to assert the type because TS gets confused with the conditional type */
    return publicClient;
}
export async function getWalletClients(provider, chainType, walletClientConfig) {
    const chain = walletClientConfig?.chain ?? (await getChain(provider, chainType));
    const accounts = await getAccounts(provider);
    const { defaultClientParams, defaultTransportParams } = await getDefaultParams(provider);
    let walletClients = accounts.map((account) => createWalletClient({
        chain,
        account,
        transport: customTransport(provider, defaultTransportParams),
        ...defaultClientParams,
        ...walletClientConfig,
    }));
    if (chainType === "op") {
        walletClients = walletClients.map((walletClient) => walletClient.extend(walletActionsL2()));
    }
    /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions --
    We need to assert the type because TS gets confused with the conditional type */
    return walletClients;
}
export async function getWalletClient(provider, chainType, address, walletClientConfig) {
    const chain = walletClientConfig?.chain ?? (await getChain(provider, chainType));
    const { defaultClientParams, defaultTransportParams } = await getDefaultParams(provider);
    let walletClient = createWalletClient({
        chain,
        account: address,
        transport: customTransport(provider, defaultTransportParams),
        ...defaultClientParams,
        ...walletClientConfig,
    });
    if (chainType === "op") {
        walletClient = walletClient.extend(walletActionsL2());
    }
    /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions --
    We need to assert the type because TS gets confused with the conditional type */
    return walletClient;
}
export async function getDefaultWalletClient(provider, chainType, walletClientConfig) {
    const chain = walletClientConfig?.chain ?? (await getChain(provider, chainType));
    const [defaultAccount] = await getAccounts(provider);
    if (defaultAccount === undefined) {
        throw new HardhatError(HardhatError.ERRORS.HARDHAT_VIEM.GENERAL.DEFAULT_WALLET_CLIENT_NOT_FOUND, {
            chainId: chain.id,
        });
    }
    return getWalletClient(provider, chainType, defaultAccount, walletClientConfig);
}
export async function getTestClient(provider, chainType, testClientConfig) {
    const chain = testClientConfig?.chain ?? (await getChain(provider, chainType));
    const mode = await getMode(provider);
    const testClient = createTestClient({
        chain,
        mode,
        transport: customTransport(provider, DEFAULT_DEVELOPMENT_TRANSPORT_PARAMS),
        ...DEFAULT_DEVELOPMENT_CLIENT_PARAMS,
        ...testClientConfig,
    });
    return testClient;
}
const DEFAULT_DEVELOPMENT_CLIENT_PARAMS = { pollingInterval: 50, cacheTime: 0 };
const DEFAULT_DEVELOPMENT_TRANSPORT_PARAMS = { retryCount: 0 };
async function getDefaultParams(provider) {
    const isDevelopment = await isDevelopmentNetwork(provider);
    return isDevelopment
        ? {
            defaultClientParams: DEFAULT_DEVELOPMENT_CLIENT_PARAMS,
            defaultTransportParams: DEFAULT_DEVELOPMENT_TRANSPORT_PARAMS,
        }
        : {};
}
//# sourceMappingURL=clients.js.map