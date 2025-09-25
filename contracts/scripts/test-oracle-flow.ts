import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing Oracle Flow...");

  const [deployer, producer, oracle] = await ethers.getSigners();
  
  // Deploy contracts
  console.log("\n📋 Deploying test contracts...");
  const OracleManager = await ethers.getContractFactory("OracleManager");
  const oracleManager = await OracleManager.deploy();
  await oracleManager.waitForDeployment();

  const PESContract = await ethers.getContractFactory("PESContract");
  const pesContract = await PESContract.deploy(await oracleManager.getAddress());
  await pesContract.waitForDeployment();

  console.log("OracleManager:", await oracleManager.getAddress());
  console.log("PESContract:", await pesContract.getAddress());

  // Authorize oracle
  console.log("\n🔐 Authorizing oracle...");
  await oracleManager.authorizeOracle(oracle.address);
  console.log("Oracle authorized:", oracle.address);

  // Create test agreement
  console.log("\n📄 Creating test agreement...");
  const agreementHash = ethers.encodeBytes32String("test-agreement-1");
  const baseValue = ethers.parseEther("100");
  const hectares = 50;

  await pesContract.createAgreement(agreementHash, producer.address, baseValue, hectares);
  console.log("Agreement created for producer:", producer.address);

  // Test case 1: Score above threshold (should approve payment)
  console.log("\n✅ Test Case 1: High Score (Should Approve Payment)");
  const auditHash1 = ethers.encodeBytes32String("audit-high-score");
  const highScore = 80; // 0.8 * 100 for precision (above 0.7 = 70% threshold)

  const tx1 = await pesContract.connect(oracle).submitValidatedBatch(0, auditHash1, highScore);
  const receipt1 = await tx1.wait();

  // Check for PaymentApproved event
  const paymentApprovedEvents = receipt1?.logs.filter(log => {
    try {
      const parsed = pesContract.interface.parseLog(log);
      return parsed?.name === 'PaymentApproved';
    } catch {
      return false;
    }
  });

  console.log("PaymentApproved events found:", paymentApprovedEvents?.length || 0);
  if (paymentApprovedEvents && paymentApprovedEvents.length > 0) {
    console.log("✅ Payment approved for high score!");
  } else {
    console.log("❌ Payment not approved - unexpected!");
  }

  // Test case 2: Score below threshold (should not approve payment)
  console.log("\n❌ Test Case 2: Low Score (Should NOT Approve Payment)");
  const auditHash2 = ethers.encodeBytes32String("audit-low-score");
  const lowScore = 60; // 0.6 * 100 for precision (below 0.7 = 70% threshold)

  const tx2 = await pesContract.connect(oracle).submitValidatedBatch(0, auditHash2, lowScore);
  const receipt2 = await tx2.wait();

  const paymentApprovedEvents2 = receipt2?.logs.filter(log => {
    try {
      const parsed = pesContract.interface.parseLog(log);
      return parsed?.name === 'PaymentApproved';
    } catch {
      return false;
    }
  });

  console.log("PaymentApproved events found:", paymentApprovedEvents2?.length || 0);
  if (paymentApprovedEvents2 && paymentApprovedEvents2.length === 0) {
    console.log("✅ Payment correctly NOT approved for low score!");
  } else {
    console.log("❌ Payment approved unexpectedly for low score!");
  }

  // Test case 3: Unauthorized oracle (should fail)
  console.log("\n🚫 Test Case 3: Unauthorized Oracle (Should Fail)");
  try {
    await pesContract.connect(producer).submitValidatedBatch(0, auditHash1, highScore);
    console.log("❌ Unauthorized oracle was allowed - unexpected!");
  } catch (error) {
    console.log("✅ Unauthorized oracle correctly rejected!");
  }

  // Test case 4: Score exactly at threshold
  console.log("\n⚖️ Test Case 4: Score at Threshold (Should Approve Payment)");
  const auditHash3 = ethers.encodeBytes32String("audit-threshold-score");
  const thresholdScore = 70; // 0.7 * 100 for precision (0.7 = 70%)

  const tx3 = await pesContract.connect(oracle).submitValidatedBatch(0, auditHash3, thresholdScore);
  const receipt3 = await tx3.wait();

  const paymentApprovedEvents3 = receipt3?.logs.filter(log => {
    try {
      const parsed = pesContract.interface.parseLog(log);
      return parsed?.name === 'PaymentApproved';
    } catch {
      return false;
    }
  });

  console.log("PaymentApproved events found:", paymentApprovedEvents3?.length || 0);
  if (paymentApprovedEvents3 && paymentApprovedEvents3.length > 0) {
    console.log("✅ Payment approved for threshold score!");
  } else {
    console.log("❌ Payment not approved at threshold - unexpected!");
  }

  // Check final agreement state
  console.log("\n📊 Final Agreement State:");
  const agreement = await pesContract.getAgreement(0);
  console.log("Last Score:", agreement.lastScore.toString());
  console.log("Last Audit Hash:", agreement.lastAuditHash);
  console.log("Last Update:", new Date(Number(agreement.lastUpdateTimestamp) * 1000).toISOString());

  // Test oracle management
  console.log("\n🔄 Testing Oracle Management:");
  
  // Revoke oracle
  await oracleManager.revokeOracle(oracle.address);
  console.log("Oracle revoked:", oracle.address);

  // Try to submit with revoked oracle (should fail)
  try {
    await pesContract.connect(oracle).submitValidatedBatch(0, auditHash1, highScore);
    console.log("❌ Revoked oracle was allowed - unexpected!");
  } catch (error) {
    console.log("✅ Revoked oracle correctly rejected!");
  }

  console.log("\n🎉 All tests completed!");
}

main().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exitCode = 1;
});
