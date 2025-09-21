import { FutureType, RuntimeValueType } from "./types/module.js";
function isValidEnumValue(theEnum, value) {
    // Enums are objects that have entries that map:
    //   1) keys to values
    //   2) values to keys
    const key = theEnum[value];
    if (key === undefined) {
        return false;
    }
    return theEnum[key] === value;
}
/**
 * Returns true if potential is of type Artifact.
 *
 * @beta
 */
export function isArtifactType(potential) {
    return (typeof potential === "object" &&
        potential !== null &&
        "contractName" in potential &&
        "bytecode" in potential &&
        "abi" in potential &&
        "linkReferences" in potential &&
        typeof potential.contractName === "string" &&
        typeof potential.bytecode === "string" &&
        Array.isArray(potential.abi) &&
        typeof potential.linkReferences === "object");
}
/**
 * Returns true if potential is of type FutureType.
 *
 * @beta
 */
export function isFutureType(potential) {
    return (typeof potential === "string" && isValidEnumValue(FutureType, potential));
}
/**
 * Returns true if potential is of type Future.
 *
 * @beta
 */
export function isFuture(potential) {
    return (typeof potential === "object" &&
        potential !== null &&
        "type" in potential &&
        isFutureType(potential.type));
}
/**
 * Returns true if future is of type ContractFuture<string>.
 *
 * @beta
 */
export function isContractFuture(future) {
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check -- The other case will return false
    switch (future.type) {
        case FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT:
        case FutureType.CONTRACT_DEPLOYMENT:
        case FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT:
        case FutureType.LIBRARY_DEPLOYMENT:
        case FutureType.NAMED_ARTIFACT_CONTRACT_AT:
        case FutureType.CONTRACT_AT:
            return true;
        default:
            return false;
    }
}
/**
 * Returns true if future is of type CallableContractFuture<string>.
 *
 * @beta
 */
export function isCallableContractFuture(future) {
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check -- The other case will return false
    switch (future.type) {
        case FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT:
        case FutureType.CONTRACT_DEPLOYMENT:
        case FutureType.NAMED_ARTIFACT_CONTRACT_AT:
        case FutureType.CONTRACT_AT:
            return true;
        default:
            return false;
    }
}
/**
 * Returns true if future is of type AddressResolvable.
 *
 * @beta
 */
export function isAddressResolvableFuture(future) {
    return (isContractFuture(future) ||
        future.type === FutureType.STATIC_CALL ||
        future.type === FutureType.READ_EVENT_ARGUMENT);
}
/**
 * Returns true if future is of type FunctionCallFuture\<string, string\>.
 *
 * @beta
 */
export function isFunctionCallFuture(future) {
    return (future.type === FutureType.CONTRACT_CALL ||
        future.type === FutureType.STATIC_CALL);
}
/**
 * Returns true if future is of type NamedStaticCallFuture.
 *
 * @beta
 */
export function isNamedStaticCallFuture(future) {
    return future.type === FutureType.STATIC_CALL;
}
/**
 * Returns true if future is of type EncodeFunctionCallFuture\<string, string\>.
 *
 * @beta
 */
export function isEncodeFunctionCallFuture(potential) {
    return (isFuture(potential) && potential.type === FutureType.ENCODE_FUNCTION_CALL);
}
/**
 * Returns true if future is of type ReadEventArgumentFuture.
 *
 * @beta
 */
export function isReadEventArgumentFuture(future) {
    return future.type === FutureType.READ_EVENT_ARGUMENT;
}
/**
 * Returns true if future is of type NamedContractDeploymentFuture.
 *
 * @beta
 */
export function isNamedContractDeploymentFuture(future) {
    return future.type === FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT;
}
/**
 * Returns true if future is of type ArtifactContractDeploymentFuture.
 *
 * @beta
 */
export function isArtifactContractDeploymentFuture(future) {
    return future.type === FutureType.CONTRACT_DEPLOYMENT;
}
/**
 * Returns true if future is of type NamedLibraryDeploymentFuture.
 *
 * @beta
 */
export function isNamedLibraryDeploymentFuture(future) {
    return future.type === FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT;
}
/**
 * Returns true if future is of type ArtifactLibraryDeploymentFuture.
 *
 * @beta
 */
export function isArtifactLibraryDeploymentFuture(future) {
    return future.type === FutureType.LIBRARY_DEPLOYMENT;
}
/**
 * Returns true if future is of type NamedContractAtFuture.
 *
 * @beta
 */
export function isNamedContractAtFuture(future) {
    return future.type === FutureType.NAMED_ARTIFACT_CONTRACT_AT;
}
/**
 * Returns true if future is of type ArtifactContractAtFuture.
 *
 * @beta
 */
export function isArtifactContractAtFuture(future) {
    return future.type === FutureType.CONTRACT_AT;
}
/**
 * Returns true if the type is of type DeploymentFuture<string>.
 *
 * @beta
 */
export function isDeploymentType(potential) {
    const deploymentTypes = [
        FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT,
        FutureType.CONTRACT_DEPLOYMENT,
        FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT,
        FutureType.LIBRARY_DEPLOYMENT,
    ];
    return (typeof potential === "string" &&
        deploymentTypes.includes(potential));
}
/**
 * Returns true if future is of type DeploymentFuture<string>.
 *
 * @beta
 */
export function isDeploymentFuture(future) {
    return isDeploymentType(future.type);
}
/**
 * Returns true if the future requires submitting a transaction on-chain
 *
 * @beta
 */
export function isFutureThatSubmitsOnchainTransaction(f) {
    return (!isNamedStaticCallFuture(f) &&
        !isReadEventArgumentFuture(f) &&
        !isNamedContractAtFuture(f) &&
        !isArtifactContractAtFuture(f) &&
        !isEncodeFunctionCallFuture(f));
}
/**
 * Returns true if potential is of type RuntimeValueType.
 *
 * @beta
 */
export function isRuntimeValueType(potential) {
    return (typeof potential === "string" &&
        isValidEnumValue(RuntimeValueType, potential));
}
/**
 * Returns true if potential is of type RuntimeValue.
 *
 * @beta
 */
export function isRuntimeValue(potential) {
    return (typeof potential === "object" &&
        potential !== null &&
        "type" in potential &&
        isRuntimeValueType(potential.type));
}
/**
 * Return true if potential is an account runtime value.
 *
 * @beta
 */
export function isAccountRuntimeValue(potential) {
    return (isRuntimeValue(potential) && potential.type === RuntimeValueType.ACCOUNT);
}
/**
 * Returns true if potential is of type ModuleParameterRuntimeValue<any>.
 *
 * @beta
 */
export function isModuleParameterRuntimeValue(potential) {
    return (isRuntimeValue(potential) &&
        potential.type === RuntimeValueType.MODULE_PARAMETER);
}
//# sourceMappingURL=type-guards.js.map