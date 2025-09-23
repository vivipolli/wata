import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying W.A.T.A. V2 Contracts to Hedera Testnet...");

  // Get the ContractFactory and Signers
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  
  if (!deployer) {
    throw new Error("No signer available for deployment");
  }
  
  const deployerAddress = deployer.address || await deployer.getAddress();
  console.log("Deploying contracts with the account:", deployerAddress);

  // Deploy OracleManager first
  console.log("\n📋 Deploying OracleManager...");
  const OracleManager = await ethers.getContractFactory("OracleManager");
  const oracleManager = await OracleManager.deploy();
  await oracleManager.waitForDeployment();
  
  const oracleManagerAddress = await oracleManager.getAddress();
  console.log("✅ OracleManager deployed to:", oracleManagerAddress);

  // Deploy PESContract with OracleManager address
  console.log("\n📋 Deploying PESContract V2...");
  const PESContract = await ethers.getContractFactory("PESContract");
  const pesContract = await PESContract.deploy(oracleManagerAddress);
  await pesContract.waitForDeployment();
  
  const pesContractAddress = await pesContract.getAddress();
  console.log("✅ PESContract V2 deployed to:", pesContractAddress);

  // Authorize initial oracle (deployer for testing)
  console.log("\n🔐 Authorizing initial oracle...");
  await oracleManager.authorizeOracle(deployerAddress);
  console.log("✅ Oracle authorized:", deployerAddress);

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const oracleCount = await oracleManager.getOracleCount();
  const scoreThreshold = await pesContract.SCORE_THRESHOLD();
  
  console.log("Oracle count:", oracleCount.toString());
  console.log("Score threshold:", scoreThreshold.toString());

  // Save deployment info
  const deploymentInfo = {
    network: "hedera-testnet",
    timestamp: new Date().toISOString(),
    deployer: deployerAddress,
    contracts: {
      OracleManager: {
        address: oracleManagerAddress,
        txHash: oracleManager.deploymentTransaction()?.hash
      },
      PESContract: {
        address: pesContractAddress,
        txHash: pesContract.deploymentTransaction()?.hash
      }
    },
    authorizedOracles: [deployerAddress]
  };

  console.log("\n📝 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Instructions for next steps
  console.log("\n🎯 Next Steps:");
  console.log("1. Update backend .env file with contract addresses:");
  console.log(`   CONTRACT_ADDRESS=${pesContractAddress}`);
  console.log(`   ORACLE_MANAGER_ADDRESS=${oracleManagerAddress}`);
  console.log("2. Update ORACLE_ADDRESS in .env with your oracle account");
  console.log("3. Authorize additional oracles if needed");
  console.log("4. Test the oracle validation flow");
  
  console.log("\n✨ Deployment completed successfully!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
