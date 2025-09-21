import { ethers } from "hardhat";

async function main() {
  console.log("Deploying PESContract to Hedera Testnet...");

  const PESContract = await ethers.getContractFactory("PESContract");
  const pesContract = await PESContract.deploy();

  await pesContract.waitForDeployment();

  const contractAddress = await pesContract.getAddress();
  
  console.log("PESContract deployed to:", contractAddress);
  console.log("Contract owner:", await pesContract.owner());
  console.log("Initial relayer:", await pesContract.relayer());
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress,
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
