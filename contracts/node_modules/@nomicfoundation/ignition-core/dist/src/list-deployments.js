import { exists, readdir } from "@nomicfoundation/hardhat-utils/fs";
/**
 * Return a list of all deployments in the deployment directory.
 *
 * @param deploymentDir - the directory of the deployments
 *
 * @beta
 */
export async function listDeployments(deploymentDir) {
    if (!(await exists(deploymentDir))) {
        return [];
    }
    return readdir(deploymentDir);
}
//# sourceMappingURL=list-deployments.js.map