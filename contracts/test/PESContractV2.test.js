const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PESContract V2", function () {
  let pesContract;
  let oracleManager;
  let owner;
  let producer;
  let relayer;
  let oracle;
  let unauthorizedOracle;
  let otherAccount;

  beforeEach(async function () {
    [owner, producer, relayer, oracle, unauthorizedOracle, otherAccount] = await ethers.getSigners();
    
    // Deploy OracleManager first
    const OracleManager = await ethers.getContractFactory("OracleManager");
    oracleManager = await OracleManager.deploy();
    await oracleManager.waitForDeployment();
    
    // Deploy PESContract with OracleManager address
    const PESContract = await ethers.getContractFactory("PESContract");
    pesContract = await PESContract.deploy(await oracleManager.getAddress());
    await pesContract.waitForDeployment();
    
    // Set relayer and authorize oracle
    await pesContract.setRelayer(relayer.address);
    await oracleManager.authorizeOracle(oracle.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await pesContract.owner()).to.equal(owner.address);
    });

    it("Should set the correct oracle manager", async function () {
      expect(await pesContract.oracleManager()).to.equal(await oracleManager.getAddress());
    });

    it("Should start with zero agreements", async function () {
      expect(await pesContract.agreementCounter()).to.equal(0);
    });

    it("Should set correct score threshold", async function () {
      expect(await pesContract.SCORE_THRESHOLD()).to.equal(70);
    });
  });

  describe("Agreement Creation", function () {
    const agreementHash = ethers.encodeBytes32String("test-agreement-1");
    const baseValue = ethers.parseEther("100");
    const hectares = 50;

    it("Should create agreement with valid parameters", async function () {
      await expect(
        pesContract.createAgreement(agreementHash, producer.address, baseValue, hectares)
      )
        .to.emit(pesContract, "AgreementCreated")
        .withArgs(0, agreementHash, producer.address, baseValue, hectares);

      expect(await pesContract.agreementCounter()).to.equal(1);
      
      const agreement = await pesContract.getAgreement(0);
      expect(agreement.agreementHash).to.equal(agreementHash);
      expect(agreement.producer).to.equal(producer.address);
      expect(agreement.baseValue).to.equal(baseValue);
      expect(agreement.hectares).to.equal(hectares);
      expect(agreement.isActive).to.equal(true);
      expect(agreement.lastScore).to.equal(0);
      expect(agreement.lastAuditHash).to.equal(ethers.ZeroHash);
      expect(agreement.lastUpdateTimestamp).to.equal(0);
    });

    it("Should revert with invalid parameters", async function () {
      await expect(
        pesContract.createAgreement(agreementHash, ethers.ZeroAddress, baseValue, hectares)
      ).to.be.revertedWith("Invalid producer address");

      await expect(
        pesContract.createAgreement(agreementHash, producer.address, 0, hectares)
      ).to.be.revertedWith("Base value must be greater than 0");

      await expect(
        pesContract.createAgreement(agreementHash, producer.address, baseValue, 0)
      ).to.be.revertedWith("Hectares must be greater than 0");
    });

    it("Should only allow owner to create agreements", async function () {
      await expect(
        pesContract.connect(producer).createAgreement(agreementHash, producer.address, baseValue, hectares)
      ).to.be.revertedWith("Only owner can call this function");
    });
  });

  describe("Validated Batch Submission", function () {
    const agreementHash = ethers.encodeBytes32String("test-agreement-1");
    const baseValue = ethers.parseEther("100");
    const hectares = 50;
    const auditHash = ethers.encodeBytes32String("audit-hash-123");
    let agreementId;

    beforeEach(async function () {
      await pesContract.createAgreement(agreementHash, producer.address, baseValue, hectares);
      agreementId = 0;
    });

    it("Should allow authorized oracle to submit validated batch", async function () {
      const score = 75; // Above threshold

      await expect(
        pesContract.connect(oracle).submitValidatedBatch(agreementId, auditHash, score)
      )
        .to.emit(pesContract, "ValidatedBatchSubmitted")
        .withArgs(agreementId, oracle.address, auditHash, score, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));

      const agreement = await pesContract.getAgreement(agreementId);
      expect(agreement.lastScore).to.equal(score);
      expect(agreement.lastAuditHash).to.equal(auditHash);
      expect(agreement.lastUpdateTimestamp).to.be.gt(0);
    });

    it("Should emit PaymentApproved when score >= threshold", async function () {
      const score = 80; // Above threshold
      const expectedAmount = baseValue * BigInt(hectares);

      await expect(
        pesContract.connect(oracle).submitValidatedBatch(agreementId, auditHash, score)
      )
        .to.emit(pesContract, "PaymentApproved")
        .withArgs(agreementId, producer.address, expectedAmount, auditHash, score);
    });

    it("Should NOT emit PaymentApproved when score < threshold", async function () {
      const score = 60; // Below threshold

      const tx = await pesContract.connect(oracle).submitValidatedBatch(agreementId, auditHash, score);
      const receipt = await tx.wait();
      
      // Check that PaymentApproved event was not emitted
      const paymentApprovedEvents = receipt.logs.filter(log => {
        try {
          const parsed = pesContract.interface.parseLog(log);
          return parsed.name === 'PaymentApproved';
        } catch {
          return false;
        }
      });
      
      expect(paymentApprovedEvents.length).to.equal(0);
    });

    it("Should revert when unauthorized oracle tries to submit", async function () {
      const score = 75;

      await expect(
        pesContract.connect(unauthorizedOracle).submitValidatedBatch(agreementId, auditHash, score)
      ).to.be.revertedWith("Only authorized oracle can submit batch");
    });

    it("Should revert with invalid parameters", async function () {
      await expect(
        pesContract.connect(oracle).submitValidatedBatch(999, auditHash, 75)
      ).to.be.revertedWith("Agreement does not exist");

      await expect(
        pesContract.connect(oracle).submitValidatedBatch(agreementId, auditHash, 150)
      ).to.be.revertedWith("Score must be between 0 and 100");
    });

    it("Should revert when agreement is not active", async function () {
      await pesContract.deactivateAgreement(agreementId);

      await expect(
        pesContract.connect(oracle).submitValidatedBatch(agreementId, auditHash, 75)
      ).to.be.revertedWith("Agreement is not active");
    });
  });

  describe("Score Queries", function () {
    const agreementHash = ethers.encodeBytes32String("test-agreement-1");
    const baseValue = ethers.parseEther("100");
    const hectares = 50;
    const auditHash = ethers.encodeBytes32String("audit-hash-123");
    let agreementId;

    beforeEach(async function () {
      await pesContract.createAgreement(agreementHash, producer.address, baseValue, hectares);
      agreementId = 0;
    });

    it("Should return correct score after batch submission", async function () {
      const score = 85;
      
      await pesContract.connect(oracle).submitValidatedBatch(agreementId, auditHash, score);
      
      expect(await pesContract.getAgreementScore(agreementId)).to.equal(score);
    });

    it("Should return 0 for agreement with no submissions", async function () {
      expect(await pesContract.getAgreementScore(agreementId)).to.equal(0);
    });

    it("Should revert for non-existent agreement", async function () {
      await expect(
        pesContract.getAgreementScore(999)
      ).to.be.revertedWith("Agreement does not exist");
    });
  });

  describe("Oracle Manager Integration", function () {
    it("Should allow owner to update oracle manager", async function () {
      const newOracleManager = await (await ethers.getContractFactory("OracleManager")).deploy();
      await newOracleManager.waitForDeployment();

      await pesContract.setOracleManager(await newOracleManager.getAddress());
      
      expect(await pesContract.oracleManager()).to.equal(await newOracleManager.getAddress());
    });

    it("Should revert when non-owner tries to update oracle manager", async function () {
      const newOracleManager = await (await ethers.getContractFactory("OracleManager")).deploy();
      await newOracleManager.waitForDeployment();

      await expect(
        pesContract.connect(producer).setOracleManager(await newOracleManager.getAddress())
      ).to.be.revertedWith("Only owner can call this function");
    });
  });

  describe("Legacy Payment Functions", function () {
    const agreementHash = ethers.encodeBytes32String("test-agreement-1");
    const baseValue = ethers.parseEther("100");
    const hectares = 50;
    const auditHash = ethers.encodeBytes32String("audit-hash-123");
    let agreementId;

    beforeEach(async function () {
      await pesContract.createAgreement(agreementHash, producer.address, baseValue, hectares);
      agreementId = 0;
    });

    it("Should allow relayer to request payment", async function () {
      const expectedAmount = baseValue * BigInt(hectares);

      await expect(
        pesContract.connect(relayer).requestPayment(agreementId, auditHash)
      )
        .to.emit(pesContract, "PaymentRequested")
        .withArgs(agreementId, producer.address, expectedAmount, auditHash);
    });

    it("Should allow relayer to record audit", async function () {
      await expect(
        pesContract.connect(relayer).recordAudit(auditHash)
      )
        .to.emit(pesContract, "AuditRecorded")
        .withArgs(auditHash, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple batch submissions for same agreement", async function () {
      const agreementHash = ethers.encodeBytes32String("test-agreement-1");
      const baseValue = ethers.parseEther("100");
      const hectares = 50;
      
      await pesContract.createAgreement(agreementHash, producer.address, baseValue, hectares);
      const agreementId = 0;

      // First submission
      const auditHash1 = ethers.encodeBytes32String("audit-hash-1");
      await pesContract.connect(oracle).submitValidatedBatch(agreementId, auditHash1, 60);

      // Second submission should update the values
      const auditHash2 = ethers.encodeBytes32String("audit-hash-2");
      await pesContract.connect(oracle).submitValidatedBatch(agreementId, auditHash2, 80);

      const agreement = await pesContract.getAgreement(agreementId);
      expect(agreement.lastScore).to.equal(80);
      expect(agreement.lastAuditHash).to.equal(auditHash2);
    });

    it("Should handle score exactly at threshold", async function () {
      const agreementHash = ethers.encodeBytes32String("test-agreement-1");
      const baseValue = ethers.parseEther("100");
      const hectares = 50;
      
      await pesContract.createAgreement(agreementHash, producer.address, baseValue, hectares);
      const agreementId = 0;
      const auditHash = ethers.encodeBytes32String("audit-hash-123");
      const score = 70; // Exactly at threshold

      await expect(
        pesContract.connect(oracle).submitValidatedBatch(agreementId, auditHash, score)
      )
        .to.emit(pesContract, "PaymentApproved");
    });
  });
});
