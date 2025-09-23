import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Checking Oracle Authorization Status...");

  const signers = await ethers.getSigners();
  const deployer = signers[0];
  
  if (!deployer) {
    throw new Error("No signer available");
  }
  
  const deployerAddress = deployer.address || await deployer.getAddress();
  console.log("Using account:", deployerAddress);

  // Load contract addresses from deployment
  const deploymentInfo = require('../deployment-v2.json');
  const oracleManagerAddress = deploymentInfo.contracts.OracleManager.address;
  const pesContractAddress = deploymentInfo.contracts.PESContract.address;

  console.log("\n📋 Contract Addresses:");
  console.log("OracleManager:", oracleManagerAddress);
  console.log("PESContract:", pesContractAddress);

  // Connect to OracleManager
  const OracleManager = await ethers.getContractFactory("OracleManager");
  const oracleManager = OracleManager.attach(oracleManagerAddress);

  // Check oracle authorization
  const oracleAddress = "0x386960838e34953603e77a143fD87af5E5A3351b";
  console.log("\n🔐 Checking Oracle Authorization:");
  console.log("Oracle Address:", oracleAddress);

  try {
    const isAuthorized = await oracleManager.isAuthorizedOracle(oracleAddress);
    console.log("Is Authorized:", isAuthorized);

    const oracleCount = await oracleManager.getOracleCount();
    console.log("Total Authorized Oracles:", oracleCount.toString());

    // List all authorized oracles
    for (let i = 0; i < oracleCount; i++) {
      const oracleAddr = await oracleManager.getOracleAddress(i);
      console.log(`Oracle ${i}:`, oracleAddr);
    }
  } catch (error) {
    console.error("Error checking oracle authorization:", error);
  }

  // Connect to PESContract
  const PESContract = await ethers.getContractFactory("PESContract");
  const pesContract = PESContract.attach(pesContractAddress);

  try {
    const scoreThreshold = await pesContract.SCORE_THRESHOLD();
    console.log("\n📊 PESContract Configuration:");
    console.log("Score Threshold:", scoreThreshold.toString());

    // Check if agreement 4 exists
    try {
      const agreement = await pesContract.getAgreement(4);
      console.log("\n📄 Agreement 4 Status:");
      console.log("Agreement exists:", agreement[0] !== "0x0000000000000000000000000000000000000000000000000000000000000000");
      console.log("Producer:", agreement[1]);
      console.log("Is Active:", agreement[4]);
    } catch (error) {
      console.log("\n❌ Agreement 4 not found or error:", error.message);
    }
  } catch (error) {
    console.error("Error checking PESContract:", error);
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
});
