import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts to Hedera Testnet...");

  // First deploy OracleManager
  console.log("Deploying OracleManager...");
  const OracleManager = await ethers.getContractFactory("OracleManager");
  const oracleManager = await OracleManager.deploy();
  await oracleManager.waitForDeployment();
  const oracleManagerAddress = await oracleManager.getAddress();
  console.log("OracleManager deployed to:", oracleManagerAddress);

  // Then deploy PESContract with OracleManager address
  console.log("Deploying PESContract...");
  const PESContract = await ethers.getContractFactory("PESContract");
  const pesContract = await PESContract.deploy(oracleManagerAddress);

  await pesContract.waitForDeployment();

  const contractAddress = await pesContract.getAddress();
  
  console.log("PESContract deployed to:", contractAddress);
  console.log("Contract owner:", await pesContract.owner());
  console.log("Initial relayer:", await pesContract.relayer());
  console.log("OracleManager address:", oracleManagerAddress);
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress,
    oracleManagerAddress,
    network: "hedera_testnet",
    deployedAt: new Date().toISOString(),
    owner: await pesContract.owner(),
    relayer: await pesContract.relayer()
  };
  
  fs.writeFileSync(
    './deployment.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
