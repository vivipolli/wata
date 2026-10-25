// Deploys PESEscrowV3. Local networks only unless WATA_ALLOW_REMOTE=yes is set deliberately.
// There are no default values for the pilot parameters: they are configuration, not constants.
//
// Required environment:
//   ESCROW_ADMIN                admin account (for the pilot: the account whose key is the 2-of-3 threshold key)
//   ESCROW_FINANCIAL_MANAGER    account that approves periods in HYBRID mode
//   ESCROW_APPROVAL_WINDOW_SEC  seconds a HYBRID period may wait for approval
// Optional:
//   ORACLE_MANAGER_ADDRESS      existing OracleManager; if empty a new one is deployed
const hre = require("hardhat");
const { assertAllowedDeployer } = require("./lib/deployGuard");

const LOCAL_NETWORKS = new Set(["hardhat", "localhost"]);

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

async function main() {
  if (!LOCAL_NETWORKS.has(hre.network.name) && process.env.WATA_ALLOW_REMOTE !== "yes") {
    throw new Error(
      `Refusing to deploy to "${hre.network.name}": remote networks need WATA_ALLOW_REMOTE=yes and an explicit order`
    );
  }

  const [deployer] = await hre.ethers.getSigners();
  assertAllowedDeployer(deployer ? deployer.address : undefined);

  const admin = required("ESCROW_ADMIN");
  const financialManager = required("ESCROW_FINANCIAL_MANAGER");
  const approvalWindow = BigInt(required("ESCROW_APPROVAL_WINDOW_SEC"));
  // the admin and manager are also checked: they must not be the compromised account either
  assertAllowedDeployer(admin);
  assertAllowedDeployer(financialManager);

  let oracleManagerAddress = process.env.ORACLE_MANAGER_ADDRESS;
  if (!oracleManagerAddress) {
    const OracleManager = await hre.ethers.getContractFactory("OracleManager");
    const oracleManager = await OracleManager.deploy();
    await oracleManager.waitForDeployment();
    oracleManagerAddress = await oracleManager.getAddress();
    console.log(`OracleManager deployed at ${oracleManagerAddress}`);
  }

  const Escrow = await hre.ethers.getContractFactory("PESEscrowV3");
  const escrow = await Escrow.deploy(oracleManagerAddress, admin, financialManager, approvalWindow);
  await escrow.waitForDeployment();
  console.log(`PESEscrowV3 deployed at ${await escrow.getAddress()} on ${hre.network.name}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
