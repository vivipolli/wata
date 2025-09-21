import { assertHardhatInvariant, HardhatError, } from "@nomicfoundation/hardhat-errors";
import { isObject } from "@nomicfoundation/hardhat-utils/lang";
import { extractChain } from "viem";
import * as chainsModule from "viem/chains";
import { hardhat, anvil, optimism } from "viem/chains";
/* eslint-disable-next-line @typescript-eslint/consistent-type-assertions
-- TODO: this assertion should not be necessary */
const chains = Object.values(chainsModule);
const chainCache = new WeakMap();
const chainIdCache = new WeakMap();
const hardhatMetadataCache = new WeakMap();
const isAnvilNetworkCache = new WeakMap();
const HARDHAT_METADATA_METHOD = "hardhat_metadata";
const ANVIL_NODE_INFO_METHOD = "anvil_nodeInfo";
export async function getChain(provider, chainType) {
    const cachedChain = chainCache.get(provider);
    if (cachedChain !== undefined) {
        return cachedChain;
    }
    const chainId = await getChainId(provider);
    let chain = extractChain({
        chains,
        id: chainId,
    });
    if ((await isDevelopmentNetwork(provider)) || chain === undefined) {
        if (await isHardhatNetwork(provider)) {
            chain = createHardhatChain(provider, chainId, chainType);
        }
        else if (await isAnvilNetwork(provider)) {
            chain = {
                ...anvil,
                id: chainId,
            };
        }
        else if (chain === undefined) {
            // If the chain couldn't be found and we can't detect the development
            // network we throw an error.
            throw new HardhatError(HardhatError.ERRORS.HARDHAT_VIEM.GENERAL.NETWORK_NOT_FOUND, {
                chainId,
            });
        }
        else {
            assertHardhatInvariant(false, "This should not happen, as we check in isDevelopmentNetwork that it's either hardhat or anvil");
        }
    }
    chainCache.set(provider, chain);
    return chain;
}
export async function getChainId(provider) {
    const cachedChainId = chainIdCache.get(provider);
    if (cachedChainId !== undefined) {
        return cachedChainId;
    }
    const chainId = Number(await provider.request({ method: "eth_chainId" }));
    chainIdCache.set(provider, chainId);
    return chainId;
}
export async function isDevelopmentNetwork(provider) {
    if (await isHardhatNetwork(provider)) {
        return true;
    }
    if (await isAnvilNetwork(provider)) {
        return true;
    }
    return false;
}
export async function isHardhatNetwork(provider) {
    const cachedHardhatMetadata = hardhatMetadataCache.get(provider);
    if (cachedHardhatMetadata !== undefined) {
        return true;
    }
    try {
        const hardhatMetadata = await provider.request({
            method: HARDHAT_METADATA_METHOD,
        });
        assertHardhatInvariant(isHardhatMetadata(hardhatMetadata), "Expected valid hardhat metadata response");
        hardhatMetadataCache.set(provider, hardhatMetadata);
        return true;
    }
    catch {
        hardhatMetadataCache.delete(provider);
        return false;
    }
}
export async function isAnvilNetwork(provider) {
    const cachedIsAnvil = isAnvilNetworkCache.get(provider);
    if (cachedIsAnvil !== undefined) {
        return cachedIsAnvil;
    }
    const isAnvil = await isMethodSupported(provider, ANVIL_NODE_INFO_METHOD);
    isAnvilNetworkCache.set(provider, isAnvil);
    return isAnvil;
}
export async function getMode(provider) {
    if (await isHardhatNetwork(provider)) {
        return "hardhat";
    }
    if (await isAnvilNetwork(provider)) {
        return "anvil";
    }
    throw new HardhatError(HardhatError.ERRORS.HARDHAT_VIEM.GENERAL.UNSUPPORTED_DEVELOPMENT_NETWORK);
}
async function isMethodSupported(provider, method) {
    try {
        await provider.request({ method });
        return true;
    }
    catch {
        return false;
    }
}
function createHardhatChain(provider, chainId, chainType) {
    const hardhatMetadata = hardhatMetadataCache.get(provider);
    assertHardhatInvariant(hardhatMetadata !== undefined, "Expected hardhat metadata to be available");
    if (hardhatMetadata.forkedNetwork?.chainId !== undefined) {
        const forkedChain = extractChain({
            chains,
            id: hardhatMetadata.forkedNetwork.chainId,
        });
        if (forkedChain !== undefined) {
            return {
                ...forkedChain,
                ...hardhat,
                id: chainId,
            };
        }
    }
    const chain = {
        ...hardhat,
        id: chainId,
    };
    if (chainType === "op") {
        // we add the optimism contracts to enable viem's L2 actions
        chain.contracts = {
            ...optimism.contracts,
        };
    }
    return chain;
}
function isHardhatMetadata(value) {
    return (isObject(value) &&
        (value.forkedNetwork === undefined ||
            (isObject(value.forkedNetwork) &&
                typeof value.forkedNetwork.chainId === "number")));
}
//# sourceMappingURL=chains.js.map