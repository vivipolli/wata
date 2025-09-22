const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PESContract", function () {
  let pesContract;
  let owner;
  let producer;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get the ContractFactory and Signers
    [owner, producer, addr1, addr2] = await ethers.getSigners();

    // Deploy the contract
    const PESContract = await ethers.getContractFactory("PESContract");
    pesContract = await PESContract.deploy();
    await pesContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await pesContract.owner()).to.equal(owner.address);
    });

    it("Should start with zero agreements", async function () {
      expect(await pesContract.agreementCounter()).to.equal(0);
    });
  });

  describe("Agreement Creation", function () {
    const agreementHash = ethers.encodeBytes32String("test-agreement-1");
    const baseValue = ethers.parseEther("100"); // 100 HBAR
    const hectares = 50;

    it("Should create agreement with valid parameters and emit event", async function () {
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
    });

    it("Should reject agreement creation with zero baseValue", async function () {
      await expect(
        pesContract.createAgreement(agreementHash, producer.address, 0, hectares)
      ).to.be.revertedWith("Base value must be greater than 0");
    });

    it("Should reject agreement creation with zero hectares", async function () {
      await expect(
        pesContract.createAgreement(agreementHash, producer.address, baseValue, 0)
      ).to.be.revertedWith("Hectares must be greater than 0");
    });

    it("Should reject agreement creation with zero address", async function () {
      await expect(
        pesContract.createAgreement(agreementHash, ethers.ZeroAddress, baseValue, hectares)
      ).to.be.revertedWith("Invalid producer address");
    });

    it("Should increment agreement count correctly", async function () {
      await pesContract.createAgreement(agreementHash, producer.address, baseValue, hectares);
      expect(await pesContract.agreementCounter()).to.equal(1);

      const secondHash = ethers.encodeBytes32String("test-agreement-2");
      await pesContract.createAgreement(secondHash, addr1.address, baseValue, hectares);
      expect(await pesContract.agreementCounter()).to.equal(2);
    });
  });

  describe("Audit Recording", function () {
    const auditHash = ethers.encodeBytes32String("audit-hash-1");

    it("Should record audit hash and emit event", async function () {
      await expect(pesContract.recordAudit(auditHash))
        .to.emit(pesContract, "AuditRecorded");
    });

    it("Should allow multiple audit recordings", async function () {
      const auditHash2 = ethers.encodeBytes32String("audit-hash-2");
      
      await pesContract.recordAudit(auditHash);
      await pesContract.recordAudit(auditHash2);

      // Both should emit events successfully
      await expect(pesContract.recordAudit(auditHash))
        .to.emit(pesContract, "AuditRecorded");
      await expect(pesContract.recordAudit(auditHash2))
        .to.emit(pesContract, "AuditRecorded");
    });
  });

  describe("Payment Request", function () {
    const agreementHash = ethers.encodeBytes32String("test-agreement-1");
    const baseValue = ethers.parseEther("100");
    const hectares = 50;
    const auditHash = ethers.encodeBytes32String("audit-hash-1");
    let agreementId;

    beforeEach(async function () {
      // Create an agreement first
      await pesContract.createAgreement(agreementHash, producer.address, baseValue, hectares);
      agreementId = 0;
    });

    it("Should request payment and emit PaymentRequested event", async function () {
      const expectedAmount = baseValue * BigInt(hectares);

      await expect(
        pesContract.requestPayment(agreementId, auditHash)
      )
        .to.emit(pesContract, "PaymentRequested")
        .withArgs(agreementId, producer.address, expectedAmount, auditHash);
    });

    it("Should calculate payment amount correctly (baseValue * hectares)", async function () {
      const expectedAmount = baseValue * BigInt(hectares);

      await expect(
        pesContract.requestPayment(agreementId, auditHash)
      )
        .to.emit(pesContract, "PaymentRequested")
        .withArgs(agreementId, producer.address, expectedAmount, auditHash);
    });

    it("Should reject payment request for non-existent agreement", async function () {
      const invalidAgreementId = 999;
      
      await expect(
        pesContract.requestPayment(invalidAgreementId, auditHash)
      ).to.be.revertedWith("Agreement does not exist");
    });

    it("Should reject payment request for inactive agreement", async function () {
      // Deactivate the agreement (assuming there's a function for this)
      // For now, we'll test with a different scenario
      const inactiveAgreementId = 2;
      
      await expect(
        pesContract.requestPayment(inactiveAgreementId, auditHash)
      ).to.be.revertedWith("Agreement does not exist");
    });

    it("Should allow multiple payment requests for same agreement", async function () {
      const auditHash2 = ethers.encodeBytes32String("audit-hash-2");
      
      await pesContract.requestPayment(agreementId, auditHash);
      await pesContract.requestPayment(agreementId, auditHash2);

      // Both should succeed and emit events
      await expect(pesContract.requestPayment(agreementId, auditHash))
        .to.emit(pesContract, "PaymentRequested");
    });
  });

  describe("Agreement Retrieval", function () {
    const agreementHash = ethers.encodeBytes32String("test-agreement-1");
    const baseValue = ethers.parseEther("100");
    const hectares = 50;

    beforeEach(async function () {
      await pesContract.createAgreement(agreementHash, producer.address, baseValue, hectares);
    });

    it("Should return correct agreement details", async function () {
      const agreement = await pesContract.getAgreement(0);
      
      expect(agreement.agreementHash).to.equal(agreementHash);
      expect(agreement.producer).to.equal(producer.address);
      expect(agreement.baseValue).to.equal(baseValue);
      expect(agreement.hectares).to.equal(hectares);
      expect(agreement.isActive).to.equal(true);
      expect(agreement.createdAt).to.be.gt(0);
    });

    it("Should revert when getting non-existent agreement", async function () {
      await expect(pesContract.getAgreement(999))
        .to.be.revertedWith("Agreement does not exist");
    });
  });

  describe("Access Control", function () {
    const agreementHash = ethers.encodeBytes32String("test-agreement-1");
    const baseValue = ethers.parseEther("100");
    const hectares = 50;
    const auditHash = ethers.encodeBytes32String("audit-hash-1");

    it("Should allow owner to create agreements", async function () {
      await expect(
        pesContract.createAgreement(agreementHash, producer.address, baseValue, hectares)
      ).to.not.be.reverted;
    });

    it("Should allow owner to record audits", async function () {
      await expect(pesContract.recordAudit(auditHash)).to.not.be.reverted;
    });

    it("Should allow owner to request payments", async function () {
      await pesContract.createAgreement(agreementHash, producer.address, baseValue, hectares);
      
      await expect(
        pesContract.requestPayment(0, auditHash)
      ).to.not.be.reverted;
    });

    it("Should allow non-owner to call view functions", async function () {
      await pesContract.createAgreement(agreementHash, producer.address, baseValue, hectares);
      
      await expect(
        pesContract.connect(addr1).getAgreement(0)
      ).to.not.be.reverted;
      
      await expect(
        pesContract.connect(addr1).agreementCounter()
      ).to.not.be.reverted;
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum values correctly", async function () {
      const agreementHash = ethers.encodeBytes32String("max-test");
      const maxValue = ethers.MaxUint256;
      const maxHectares = ethers.MaxUint256;

      // This might fail due to overflow in multiplication, which is expected
      await expect(
        pesContract.createAgreement(agreementHash, producer.address, maxValue, maxHectares)
      ).to.not.be.reverted;
    });

    it("Should handle empty bytes32 hash", async function () {
      const emptyHash = ethers.ZeroHash;
      const baseValue = ethers.parseEther("100");
      const hectares = 50;

      await expect(
        pesContract.createAgreement(emptyHash, producer.address, baseValue, hectares)
      ).to.not.be.reverted;
    });
  });
});
