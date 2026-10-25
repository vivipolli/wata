// Public address (already present in contracts/deployment.json) of the compromised deployer account.
// Nothing here is a secret: the guard only compares addresses.
const COMPROMISED_DEPLOYER = "0x386960838e34953603e77a143fD87af5E5A3351b";

const ADDRESS = /^0x[0-9a-fA-F]{40}$/;

/**
 * Throws unless the deployer is a well-formed address other than the compromised account.
 * An empty or malformed value fails too, so a missing signer can never slip through.
 */
function assertAllowedDeployer(deployerAddress) {
  if (typeof deployerAddress !== "string" || !ADDRESS.test(deployerAddress)) {
    throw new Error("Refusing to deploy: deployer address is missing or malformed");
  }
  if (deployerAddress.toLowerCase() === COMPROMISED_DEPLOYER.toLowerCase()) {
    throw new Error("Refusing to deploy: this account is compromised and must never be used on any network");
  }
}

module.exports = { assertAllowedDeployer, COMPROMISED_DEPLOYER };
