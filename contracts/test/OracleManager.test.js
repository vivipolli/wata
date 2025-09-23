const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OracleManager", function () {
  let oracleManager;
  let owner;
  let oracle1;
  let oracle2;
  let unauthorized;

  beforeEach(async function () {
    [owner, oracle1, oracle2, unauthorized] = await ethers.getSigners();
    
    const OracleManager = await ethers.getContractFactory("OracleManager");
    oracleManager = await OracleManager.deploy();
    await oracleManager.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await oracleManager.owner()).to.equal(owner.address);
    });

    it("Should start with no authorized oracles", async function () {
      expect(await oracleManager.getOracleCount()).to.equal(0);
    });
  });

  describe("Oracle Authorization", function () {
    it("Should authorize an oracle", async function () {
      await expect(oracleManager.authorizeOracle(oracle1.address))
        .to.emit(oracleManager, "OracleAuthorized")
        .withArgs(oracle1.address, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));

      expect(await oracleManager.isAuthorizedOracle(oracle1.address)).to.be.true;
      expect(await oracleManager.getOracleCount()).to.equal(1);
    });

    it("Should revert when non-owner tries to authorize oracle", async function () {
      await expect(
        oracleManager.connect(unauthorized).authorizeOracle(oracle1.address)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should revert when trying to authorize zero address", async function () {
      await expect(
        oracleManager.authorizeOracle(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid oracle address");
    });

    it("Should revert when trying to authorize already authorized oracle", async function () {
      await oracleManager.authorizeOracle(oracle1.address);
      
      await expect(
        oracleManager.authorizeOracle(oracle1.address)
      ).to.be.revertedWith("Oracle already authorized");
    });

    it("Should authorize multiple oracles", async function () {
      await oracleManager.authorizeOracle(oracle1.address);
      await oracleManager.authorizeOracle(oracle2.address);

      expect(await oracleManager.isAuthorizedOracle(oracle1.address)).to.be.true;
      expect(await oracleManager.isAuthorizedOracle(oracle2.address)).to.be.true;
      expect(await oracleManager.getOracleCount()).to.equal(2);

      const oracles = await oracleManager.getAuthorizedOracles();
      expect(oracles).to.include(oracle1.address);
      expect(oracles).to.include(oracle2.address);
    });
  });

  describe("Oracle Revocation", function () {
    beforeEach(async function () {
      await oracleManager.authorizeOracle(oracle1.address);
      await oracleManager.authorizeOracle(oracle2.address);
    });

    it("Should revoke an oracle", async function () {
      await expect(oracleManager.revokeOracle(oracle1.address))
        .to.emit(oracleManager, "OracleRevoked")
        .withArgs(oracle1.address, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));

      expect(await oracleManager.isAuthorizedOracle(oracle1.address)).to.be.false;
      expect(await oracleManager.isAuthorizedOracle(oracle2.address)).to.be.true;
      expect(await oracleManager.getOracleCount()).to.equal(1);
    });

    it("Should revert when non-owner tries to revoke oracle", async function () {
      await expect(
        oracleManager.connect(unauthorized).revokeOracle(oracle1.address)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should revert when trying to revoke non-authorized oracle", async function () {
      await expect(
        oracleManager.revokeOracle(unauthorized.address)
      ).to.be.revertedWith("Oracle not authorized");
    });

    it("Should remove oracle from list correctly", async function () {
      await oracleManager.revokeOracle(oracle1.address);
      
      const oracles = await oracleManager.getAuthorizedOracles();
      expect(oracles).to.not.include(oracle1.address);
      expect(oracles).to.include(oracle2.address);
      expect(oracles.length).to.equal(1);
    });

    it("Should handle revoking all oracles", async function () {
      await oracleManager.revokeOracle(oracle1.address);
      await oracleManager.revokeOracle(oracle2.address);

      expect(await oracleManager.getOracleCount()).to.equal(0);
      expect(await oracleManager.isAuthorizedOracle(oracle1.address)).to.be.false;
      expect(await oracleManager.isAuthorizedOracle(oracle2.address)).to.be.false;
    });
  });

  describe("Oracle List Management", function () {
    it("Should return empty list when no oracles authorized", async function () {
      const oracles = await oracleManager.getAuthorizedOracles();
      expect(oracles.length).to.equal(0);
    });

    it("Should maintain correct list after multiple operations", async function () {
      // Authorize 3 oracles
      await oracleManager.authorizeOracle(oracle1.address);
      await oracleManager.authorizeOracle(oracle2.address);
      await oracleManager.authorizeOracle(unauthorized.address);

      expect(await oracleManager.getOracleCount()).to.equal(3);

      // Revoke middle oracle
      await oracleManager.revokeOracle(oracle2.address);

      const oracles = await oracleManager.getAuthorizedOracles();
      expect(oracles.length).to.equal(2);
      expect(oracles).to.include(oracle1.address);
      expect(oracles).to.include(unauthorized.address);
      expect(oracles).to.not.include(oracle2.address);
    });
  });
});
