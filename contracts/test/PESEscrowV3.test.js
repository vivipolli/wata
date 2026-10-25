const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

// Test-only parameters. They are NOT pilot values: the real score threshold, period amount and
// approval window are configuration decided with the environmental board.
const THRESHOLD = 70;
const PERIOD_AMOUNT = ethers.parseEther("1");
const APPROVAL_WINDOW = 24 * 60 * 60;

const State = { None: 0n, PendingApproval: 1n, Approved: 2n, Released: 3n, Rejected: 4n, InReview: 5n, ClosedNoPay: 6n };
const Mode = { AUTO: 0, HYBRID: 1 };

function hash(label) {
  return ethers.keccak256(ethers.toUtf8Bytes(label));
}

async function deployFixture() {
  const [admin, financialManager, oracle, producer, funder, stranger, newAdmin] = await ethers.getSigners();

  const OracleManager = await ethers.getContractFactory("OracleManager");
  const oracleManager = await OracleManager.deploy();
  await oracleManager.authorizeOracle(oracle.address);

  const Escrow = await ethers.getContractFactory("PESEscrowV3");
  const escrow = await Escrow.deploy(
    await oracleManager.getAddress(),
    admin.address,
    financialManager.address,
    APPROVAL_WINDOW
  );
  await escrow.waitForDeployment();

  return { escrow, oracleManager, admin, financialManager, oracle, producer, funder, stranger, newAdmin };
}

// Agreement 0 in AUTO mode, funded with `funding` by `funder`.
async function autoAgreement(ctx, funding = ethers.parseEther("5")) {
  await ctx.escrow.createAgreement(ctx.producer.address, PERIOD_AMOUNT, THRESHOLD, Mode.AUTO);
  await ctx.escrow.connect(ctx.funder).deposit(0, { value: funding });
  return 0;
}

async function hybridAgreement(ctx, funding = ethers.parseEther("5")) {
  await ctx.escrow.createAgreement(ctx.producer.address, PERIOD_AMOUNT, THRESHOLD, Mode.HYBRID);
  await ctx.escrow.connect(ctx.funder).deposit(0, { value: funding });
  return 0;
}

async function submit(ctx, id, period, label, score = 90, version = 1) {
  return ctx.escrow.connect(ctx.oracle).submitBatch(id, period, hash(label), score, version);
}

describe("PESEscrowV3", function () {
  describe("Deployment", function () {
    it("sets the admin, financial manager and oracle manager from the constructor, not from msg.sender", async function () {
      const { escrow, oracleManager, admin, financialManager } = await loadFixture(deployFixture);
      expect(await escrow.admin()).to.equal(admin.address);
      expect(await escrow.financialManager()).to.equal(financialManager.address);
      expect(await escrow.oracleManager()).to.equal(await oracleManager.getAddress());
      expect(await escrow.approvalWindow()).to.equal(APPROVAL_WINDOW);
    });

    it("rejects zero addresses and a zero approval window", async function () {
      const { oracleManager, admin, financialManager } = await loadFixture(deployFixture);
      const Escrow = await ethers.getContractFactory("PESEscrowV3");
      const om = await oracleManager.getAddress();
      await expect(Escrow.deploy(ethers.ZeroAddress, admin.address, financialManager.address, 1)).to.be.revertedWithCustomError(Escrow, "ZeroAddress");
      await expect(Escrow.deploy(om, ethers.ZeroAddress, financialManager.address, 1)).to.be.revertedWithCustomError(Escrow, "ZeroAddress");
      await expect(Escrow.deploy(om, admin.address, ethers.ZeroAddress, 1)).to.be.revertedWithCustomError(Escrow, "ZeroAddress");
      await expect(Escrow.deploy(om, admin.address, financialManager.address, 0)).to.be.revertedWithCustomError(Escrow, "InvalidParams");
    });

    it("refuses HBAR sent directly, so no balance exists without an agreement", async function () {
      const { escrow, stranger } = await loadFixture(deployFixture);
      await expect(stranger.sendTransaction({ to: await escrow.getAddress(), value: 1n })).to.be.revertedWithCustomError(escrow, "DirectDepositNotAllowed");
    });
  });

  describe("Agreements", function () {
    it("lets only the admin create agreements, and the first on-chain ID is 0", async function () {
      const ctx = await loadFixture(deployFixture);
      await expect(ctx.escrow.connect(ctx.stranger).createAgreement(ctx.producer.address, PERIOD_AMOUNT, THRESHOLD, Mode.AUTO)).to.be.revertedWithCustomError(ctx.escrow, "NotAdmin");
      await expect(ctx.escrow.createAgreement(ctx.producer.address, PERIOD_AMOUNT, THRESHOLD, Mode.AUTO))
        .to.emit(ctx.escrow, "AgreementCreated").withArgs(0, ctx.producer.address, PERIOD_AMOUNT, THRESHOLD, Mode.AUTO);
      await ctx.escrow.createAgreement(ctx.producer.address, PERIOD_AMOUNT, THRESHOLD, Mode.HYBRID);
      expect(await ctx.escrow.agreementCount()).to.equal(2);
    });

    it("rejects invalid parameters", async function () {
      const { escrow, producer } = await loadFixture(deployFixture);
      await expect(escrow.createAgreement(ethers.ZeroAddress, PERIOD_AMOUNT, THRESHOLD, Mode.AUTO)).to.be.revertedWithCustomError(escrow, "ZeroAddress");
      await expect(escrow.createAgreement(producer.address, 0, THRESHOLD, Mode.AUTO)).to.be.revertedWithCustomError(escrow, "InvalidParams");
      await expect(escrow.createAgreement(producer.address, PERIOD_AMOUNT, 0, Mode.AUTO)).to.be.revertedWithCustomError(escrow, "InvalidParams");
      await expect(escrow.createAgreement(producer.address, PERIOD_AMOUNT, 101, Mode.AUTO)).to.be.revertedWithCustomError(escrow, "InvalidParams");
    });

    it("reverts on unknown agreement IDs", async function () {
      const { escrow, funder } = await loadFixture(deployFixture);
      await expect(escrow.connect(funder).deposit(0, { value: 1 })).to.be.revertedWithCustomError(escrow, "AgreementNotFound");
      await expect(escrow.getAgreement(7)).to.be.revertedWithCustomError(escrow, "AgreementNotFound");
    });
  });

  describe("Deposits (one funder per agreement)", function () {
    it("makes the first depositor the funder and credits the agreement balance", async function () {
      const ctx = await loadFixture(deployFixture);
      await ctx.escrow.createAgreement(ctx.producer.address, PERIOD_AMOUNT, THRESHOLD, Mode.AUTO);
      await expect(ctx.escrow.connect(ctx.funder).deposit(0, { value: 3n })).to.emit(ctx.escrow, "Deposited").withArgs(0, ctx.funder.address, 3n);
      await ctx.escrow.connect(ctx.funder).deposit(0, { value: 4n });
      const a = await ctx.escrow.getAgreement(0);
      expect(a.funder).to.equal(ctx.funder.address);
      expect(a.deposited).to.equal(7n);
      expect(await ctx.escrow.totalLiabilities()).to.equal(7n);
      expect(await ethers.provider.getBalance(await ctx.escrow.getAddress())).to.equal(7n);
    });

    it("rejects a second depositor and zero-value deposits", async function () {
      const ctx = await loadFixture(deployFixture);
      await autoAgreement(ctx);
      await expect(ctx.escrow.connect(ctx.stranger).deposit(0, { value: 1 })).to.be.revertedWithCustomError(ctx.escrow, "NotFunder");
      await expect(ctx.escrow.connect(ctx.funder).deposit(0, { value: 0 })).to.be.revertedWithCustomError(ctx.escrow, "ZeroValue");
    });

    it("rejects deposits into a deactivated agreement", async function () {
      const ctx = await loadFixture(deployFixture);
      await autoAgreement(ctx);
      await ctx.escrow.deactivateAgreement(0);
      await expect(ctx.escrow.connect(ctx.funder).deposit(0, { value: 1 })).to.be.revertedWithCustomError(ctx.escrow, "AgreementInactive");
    });
  });

  describe("submitBatch in AUTO mode", function () {
    it("accepts batches only from authorized oracles", async function () {
      const ctx = await loadFixture(deployFixture);
      await autoAgreement(ctx);
      await expect(ctx.escrow.connect(ctx.stranger).submitBatch(0, 1, hash("a"), 90, 1)).to.be.revertedWithCustomError(ctx.escrow, "NotOracle");
    });

    it("approves and reserves the period amount when the score reaches the threshold (agreement ID 0)", async function () {
      const ctx = await loadFixture(deployFixture);
      await autoAgreement(ctx);
      await expect(submit(ctx, 0, 1, "a", THRESHOLD, 3))
        .to.emit(ctx.escrow, "BatchSubmitted").withArgs(0, 1, hash("a"), THRESHOLD, 3, State.Approved);
      const p = await ctx.escrow.getPeriod(0, 1);
      expect(p.state).to.equal(State.Approved);
      expect(p.scoreVersion).to.equal(3);
      expect((await ctx.escrow.getAgreement(0)).committed).to.equal(PERIOD_AMOUNT);
      expect(await ctx.escrow.freeBalance(0)).to.equal(ethers.parseEther("4"));
    });

    it("rejects the period when the score is below the threshold, without reserving funds", async function () {
      const ctx = await loadFixture(deployFixture);
      await autoAgreement(ctx);
      await submit(ctx, 0, 1, "a", THRESHOLD - 1);
      expect((await ctx.escrow.getPeriod(0, 1)).state).to.equal(State.Rejected);
      expect((await ctx.escrow.getAgreement(0)).committed).to.equal(0);
    });

    it("rejects scores above 100", async function () {
      const ctx = await loadFixture(deployFixture);
      await autoAgreement(ctx);
      await expect(submit(ctx, 0, 1, "a", 101)).to.be.revertedWithCustomError(ctx.escrow, "ScoreOutOfRange");
    });

    it("rejects replays of an audit hash, even for another period or agreement", async function () {
      const ctx = await loadFixture(deployFixture);
      await autoAgreement(ctx);
      await ctx.escrow.createAgreement(ctx.producer.address, PERIOD_AMOUNT, THRESHOLD, Mode.AUTO);
      await submit(ctx, 0, 1, "same");
      await expect(submit(ctx, 0, 1, "same")).to.be.revertedWithCustomError(ctx.escrow, "AuditHashUsed");
      await expect(submit(ctx, 0, 2, "same")).to.be.revertedWithCustomError(ctx.escrow, "AuditHashUsed");
      await expect(submit(ctx, 1, 1, "same")).to.be.revertedWithCustomError(ctx.escrow, "AuditHashUsed");
    });

    it("does not allow a second batch for a period that is already approved or released", async function () {
      const ctx = await loadFixture(deployFixture);
      await autoAgreement(ctx);
      await submit(ctx, 0, 1, "a");
      await expect(submit(ctx, 0, 1, "b")).to.be.revertedWithCustomError(ctx.escrow, "InvalidState");
      await ctx.escrow.release(0, 1);
      await expect(submit(ctx, 0, 1, "c")).to.be.revertedWithCustomError(ctx.escrow, "InvalidState");
    });

    it("reverts when the free balance cannot cover the approved amount", async function () {
      const ctx = await loadFixture(deployFixture);
      await autoAgreement(ctx, PERIOD_AMOUNT); // funds exactly one period
      await submit(ctx, 0, 1, "a");
      await expect(submit(ctx, 0, 2, "b")).to.be.revertedWithCustomError(ctx.escrow, "InsufficientFreeBalance");
    });

    it("allows a rejected period to be resubmitted with a NEW audit hash", async function () {
      const ctx = await loadFixture(deployFixture);
      await autoAgreement(ctx);
      await submit(ctx, 0, 1, "low", 10);
      await submit(ctx, 0, 1, "better", 95);
      expect((await ctx.escrow.getPeriod(0, 1)).state).to.equal(State.Approved);
    });
  });

  describe("HYBRID mode (two-step approval)", function () {
    it("holds an eligible period as PendingApproval without reserving funds", async function () {
      const ctx = await loadFixture(deployFixture);
      await hybridAgreement(ctx);
      await submit(ctx, 0, 1, "a");
      const p = await ctx.escrow.getPeriod(0, 1);
      expect(p.state).to.equal(State.PendingApproval);
      expect(p.approvalDeadline).to.be.greaterThan(0);
      expect((await ctx.escrow.getAgreement(0)).committed).to.equal(0);
      await expect(ctx.escrow.release(0, 1)).to.be.revertedWithCustomError(ctx.escrow, "InvalidState");
    });

    it("lets only the financial manager approve, and reserves the amount on approval", async function () {
      const ctx = await loadFixture(deployFixture);
      await hybridAgreement(ctx);
      await submit(ctx, 0, 1, "a");
      await expect(ctx.escrow.connect(ctx.stranger).approve(0, 1)).to.be.revertedWithCustomError(ctx.escrow, "NotFinancialManager");
      await expect(ctx.escrow.connect(ctx.oracle).approve(0, 1)).to.be.revertedWithCustomError(ctx.escrow, "NotFinancialManager");
      await expect(ctx.escrow.connect(ctx.financialManager).approve(0, 1)).to.emit(ctx.escrow, "PeriodApproved").withArgs(0, 1, ctx.financialManager.address);
      expect((await ctx.escrow.getAgreement(0)).committed).to.equal(PERIOD_AMOUNT);
    });

    it("never lets the account that submitted the batch also approve it", async function () {
      const ctx = await loadFixture(deployFixture);
      await hybridAgreement(ctx);
      await ctx.oracleManager.authorizeOracle(ctx.financialManager.address);
      await ctx.escrow.connect(ctx.financialManager).submitBatch(0, 1, hash("a"), 90, 1);
      await expect(ctx.escrow.connect(ctx.financialManager).approve(0, 1)).to.be.revertedWithCustomError(ctx.escrow, "SameAccount");
    });

    it("refuses approval after the deadline, and anyone can then expire it into review", async function () {
      const ctx = await loadFixture(deployFixture);
      await hybridAgreement(ctx);
      await submit(ctx, 0, 1, "a");
      await expect(ctx.escrow.expire(0, 1)).to.be.revertedWithCustomError(ctx.escrow, "DeadlineNotReached");
      await time.increase(APPROVAL_WINDOW + 1);
      await expect(ctx.escrow.connect(ctx.financialManager).approve(0, 1)).to.be.revertedWithCustomError(ctx.escrow, "DeadlinePassed");
      await expect(ctx.escrow.connect(ctx.stranger).expire(0, 1)).to.emit(ctx.escrow, "PeriodExpired").withArgs(0, 1);
      expect((await ctx.escrow.getPeriod(0, 1)).state).to.equal(State.InReview);
    });

    it("lets the financial manager reject, and the period can be resubmitted with a new audit hash", async function () {
      const ctx = await loadFixture(deployFixture);
      await hybridAgreement(ctx);
      await submit(ctx, 0, 1, "a");
      await expect(ctx.escrow.connect(ctx.stranger).reject(0, 1)).to.be.revertedWithCustomError(ctx.escrow, "NotFinancialManager");
      await ctx.escrow.connect(ctx.financialManager).reject(0, 1);
      expect((await ctx.escrow.getPeriod(0, 1)).state).to.equal(State.Rejected);
      await submit(ctx, 0, 1, "a-again");
      expect((await ctx.escrow.getPeriod(0, 1)).state).to.equal(State.PendingApproval);
    });
  });

  describe("release", function () {
    it("pays the producer exactly the period amount from the escrow and updates the accounting", async function () {
      const ctx = await loadFixture(deployFixture);
      await autoAgreement(ctx);
      await submit(ctx, 0, 1, "a");
      const before = await ethers.provider.getBalance(ctx.producer.address);
      await expect(ctx.escrow.connect(ctx.stranger).release(0, 1))
        .to.emit(ctx.escrow, "PeriodReleased").withArgs(0, 1, ctx.producer.address, PERIOD_AMOUNT);
      expect((await ethers.provider.getBalance(ctx.producer.address)) - before).to.equal(PERIOD_AMOUNT);
      const a = await ctx.escrow.getAgreement(0);
      expect(a.released).to.equal(PERIOD_AMOUNT);
      expect(a.committed).to.equal(0);
      expect(await ctx.escrow.totalLiabilities()).to.equal(ethers.parseEther("4"));
      expect(await ethers.provider.getBalance(await ctx.escrow.getAddress())).to.equal(ethers.parseEther("4"));
      expect((await ctx.escrow.getPeriod(0, 1)).state).to.equal(State.Released);
    });

    it("cannot release twice or release a period that is not approved", async function () {
      const ctx = await loadFixture(deployFixture);
      await autoAgreement(ctx);
      await expect(ctx.escrow.release(0, 1)).to.be.revertedWithCustomError(ctx.escrow, "InvalidState");
      await submit(ctx, 0, 1, "a");
      await ctx.escrow.release(0, 1);
      await expect(ctx.escrow.release(0, 1)).to.be.revertedWithCustomError(ctx.escrow, "InvalidState");
    });

    it("never pays more than what the agreement deposited, across many periods", async function () {
      const ctx = await loadFixture(deployFixture);
      await autoAgreement(ctx, PERIOD_AMOUNT * 2n);
      await submit(ctx, 0, 1, "a");
      await submit(ctx, 0, 2, "b");
      await expect(submit(ctx, 0, 3, "c")).to.be.revertedWithCustomError(ctx.escrow, "InsufficientFreeBalance");
      await ctx.escrow.release(0, 1);
      await ctx.escrow.release(0, 2);
      const a = await ctx.escrow.getAgreement(0);
      expect(a.released).to.equal(a.deposited);
    });

    it("keeps one agreement's funds out of reach of another agreement", async function () {
      const ctx = await loadFixture(deployFixture);
      await autoAgreement(ctx, PERIOD_AMOUNT); // agreement 0 holds one period
      await ctx.escrow.createAgreement(ctx.stranger.address, PERIOD_AMOUNT, THRESHOLD, Mode.AUTO); // agreement 1, unfunded
      await expect(submit(ctx, 1, 1, "x")).to.be.revertedWithCustomError(ctx.escrow, "InsufficientFreeBalance");
    });
  });

  describe("payout failures and reentrancy", function () {
    async function mockProducerAgreement(ctx, cfg) {
      const Mock = await ethers.getContractFactory("MockProducer");
      const mock = await Mock.deploy();
      await ctx.escrow.createAgreement(await mock.getAddress(), PERIOD_AMOUNT, THRESHOLD, Mode.AUTO);
      await ctx.escrow.connect(ctx.funder).deposit(0, { value: ethers.parseEther("3") });
      await mock.configure(cfg.accept, cfg.reenterRelease || false, cfg.reenterWithdraw || false, await ctx.escrow.getAddress(), 0, 1);
      await submit(ctx, 0, 1, "a");
      return mock;
    }

    it("defers the payout instead of reverting when the producer refuses funds, and the producer can pull it later", async function () {
      const ctx = await loadFixture(deployFixture);
      const mock = await mockProducerAgreement(ctx, { accept: false });
      const liabilitiesBefore = await ctx.escrow.totalLiabilities();
      await expect(ctx.escrow.release(0, 1)).to.emit(ctx.escrow, "PayoutDeferred").withArgs(await mock.getAddress(), PERIOD_AMOUNT);
      expect((await ctx.escrow.getPeriod(0, 1)).state).to.equal(State.Released);
      expect(await ctx.escrow.pendingWithdrawals(await mock.getAddress())).to.equal(PERIOD_AMOUNT);
      // the money is still a liability of the escrow: deferred, not lost
      expect(await ctx.escrow.totalLiabilities()).to.equal(liabilitiesBefore);

      await expect(mock.pullPending(await ctx.escrow.getAddress())).to.be.reverted; // still refusing
      await mock.configure(true, false, false, await ctx.escrow.getAddress(), 0, 1);
      await mock.pullPending(await ctx.escrow.getAddress());
      expect(await ethers.provider.getBalance(await mock.getAddress())).to.equal(PERIOD_AMOUNT);
      expect(await ctx.escrow.pendingWithdrawals(await mock.getAddress())).to.equal(0);
      expect(await ctx.escrow.totalLiabilities()).to.equal(liabilitiesBefore - PERIOD_AMOUNT);
    });

    it("blocks re-entering release while the producer is being paid, and pays exactly once", async function () {
      const ctx = await loadFixture(deployFixture);
      const mock = await mockProducerAgreement(ctx, { accept: true, reenterRelease: true });
      await ctx.escrow.release(0, 1);
      expect(await mock.reentryAttempted()).to.equal(true);
      expect(await mock.reentrySucceeded()).to.equal(false);
      expect(await ethers.provider.getBalance(await mock.getAddress())).to.equal(PERIOD_AMOUNT);
      expect((await ctx.escrow.getAgreement(0)).released).to.equal(PERIOD_AMOUNT);
    });

    it("blocks re-entering withdrawPending, and the pending balance is paid once", async function () {
      const ctx = await loadFixture(deployFixture);
      const mock = await mockProducerAgreement(ctx, { accept: false });
      await ctx.escrow.release(0, 1);
      await mock.configure(true, false, true, await ctx.escrow.getAddress(), 0, 1);
      await mock.pullPending(await ctx.escrow.getAddress());
      expect(await mock.reentrySucceeded()).to.equal(false);
      expect(await ethers.provider.getBalance(await mock.getAddress())).to.equal(PERIOD_AMOUNT);
    });

    it("reverts withdrawPending when nothing is pending", async function () {
      const { escrow, stranger } = await loadFixture(deployFixture);
      await expect(escrow.connect(stranger).withdrawPending()).to.be.revertedWithCustomError(escrow, "NothingPending");
    });
  });

  describe("admin powers are bounded", function () {
    it("lets the admin withdraw only the excess above the liabilities", async function () {
      const ctx = await loadFixture(deployFixture);
      await autoAgreement(ctx);
      const escrowAddress = await ctx.escrow.getAddress();
      await expect(ctx.escrow.withdrawExcess(1)).to.be.revertedWithCustomError(ctx.escrow, "ExceedsExcess");
      // simulate a forced transfer that adds a surplus the accounting does not know about
      const balance = await ethers.provider.getBalance(escrowAddress);
      await network.provider.send("hardhat_setBalance", [escrowAddress, "0x" + (balance + 10n).toString(16)]);
      await expect(ctx.escrow.connect(ctx.stranger).withdrawExcess(10)).to.be.revertedWithCustomError(ctx.escrow, "NotAdmin");
      await expect(ctx.escrow.withdrawExcess(11)).to.be.revertedWithCustomError(ctx.escrow, "ExceedsExcess");
      await expect(ctx.escrow.withdrawExcess(10)).to.emit(ctx.escrow, "ExcessWithdrawn").withArgs(ctx.admin.address, 10);
      expect(await ethers.provider.getBalance(escrowAddress)).to.equal(await ctx.escrow.totalLiabilities());
    });

    it("refunds only free balance to the funder, never funds committed to an approved period", async function () {
      const ctx = await loadFixture(deployFixture);
      await autoAgreement(ctx, PERIOD_AMOUNT * 3n);
      await submit(ctx, 0, 1, "a"); // commits one period
      await expect(ctx.escrow.connect(ctx.stranger).refund(0, 1)).to.be.revertedWithCustomError(ctx.escrow, "NotAdmin");
      await expect(ctx.escrow.refund(0, PERIOD_AMOUNT * 2n + 1n)).to.be.revertedWithCustomError(ctx.escrow, "ExceedsFree");
      const before = await ethers.provider.getBalance(ctx.funder.address);
      await expect(ctx.escrow.refund(0, PERIOD_AMOUNT * 2n)).to.emit(ctx.escrow, "Refunded").withArgs(0, ctx.funder.address, PERIOD_AMOUNT * 2n);
      expect((await ethers.provider.getBalance(ctx.funder.address)) - before).to.equal(PERIOD_AMOUNT * 2n);
      await ctx.escrow.release(0, 1); // the committed period is still payable
      expect((await ctx.escrow.getAgreement(0)).released).to.equal(PERIOD_AMOUNT);
    });

    it("rejects a refund when the agreement has no funder yet", async function () {
      const ctx = await loadFixture(deployFixture);
      await ctx.escrow.createAgreement(ctx.producer.address, PERIOD_AMOUNT, THRESHOLD, Mode.AUTO);
      await expect(ctx.escrow.refund(0, 1)).to.be.revertedWithCustomError(ctx.escrow, "NoFunder");
    });

    it("closes a rejected or in-review period without payment, but never an approved one", async function () {
      const ctx = await loadFixture(deployFixture);
      await autoAgreement(ctx);
      await submit(ctx, 0, 1, "low", 10); // Rejected
      await submit(ctx, 0, 2, "ok"); // Approved
      await expect(ctx.escrow.connect(ctx.stranger).closeNoPay(0, 1)).to.be.revertedWithCustomError(ctx.escrow, "NotAdmin");
      await expect(ctx.escrow.closeNoPay(0, 2)).to.be.revertedWithCustomError(ctx.escrow, "InvalidState");
      await expect(ctx.escrow.closeNoPay(0, 1)).to.emit(ctx.escrow, "ClosedNoPay").withArgs(0, 1);
      expect((await ctx.escrow.getPeriod(0, 1)).state).to.equal(State.ClosedNoPay);
      await expect(submit(ctx, 0, 1, "again")).to.be.revertedWithCustomError(ctx.escrow, "InvalidState"); // terminal
    });
  });

  describe("pause", function () {
    it("lets only the admin pause, and blocks deposits, batches, approvals and releases while paused", async function () {
      const ctx = await loadFixture(deployFixture);
      await hybridAgreement(ctx);
      await submit(ctx, 0, 1, "a");
      await expect(ctx.escrow.connect(ctx.stranger).pause()).to.be.revertedWithCustomError(ctx.escrow, "NotAdmin");
      await ctx.escrow.pause();
      await expect(ctx.escrow.connect(ctx.funder).deposit(0, { value: 1 })).to.be.revertedWithCustomError(ctx.escrow, "ContractPaused");
      await expect(submit(ctx, 0, 2, "b")).to.be.revertedWithCustomError(ctx.escrow, "ContractPaused");
      await expect(ctx.escrow.connect(ctx.financialManager).approve(0, 1)).to.be.revertedWithCustomError(ctx.escrow, "ContractPaused");
      await expect(ctx.escrow.release(0, 1)).to.be.revertedWithCustomError(ctx.escrow, "ContractPaused");
      await ctx.escrow.unpause();
      await ctx.escrow.connect(ctx.financialManager).approve(0, 1);
    });
  });

  describe("admin hand-over (two steps)", function () {
    it("requires the proposed account to accept, and the old admin loses its rights", async function () {
      const ctx = await loadFixture(deployFixture);
      await expect(ctx.escrow.connect(ctx.stranger).proposeAdmin(ctx.newAdmin.address)).to.be.revertedWithCustomError(ctx.escrow, "NotAdmin");
      await expect(ctx.escrow.proposeAdmin(ethers.ZeroAddress)).to.be.revertedWithCustomError(ctx.escrow, "ZeroAddress");
      await ctx.escrow.proposeAdmin(ctx.newAdmin.address);
      await expect(ctx.escrow.connect(ctx.stranger).acceptAdmin()).to.be.revertedWithCustomError(ctx.escrow, "NotPendingAdmin");
      expect(await ctx.escrow.admin()).to.equal(ctx.admin.address); // nothing changed yet
      await expect(ctx.escrow.connect(ctx.newAdmin).acceptAdmin()).to.emit(ctx.escrow, "AdminChanged").withArgs(ctx.admin.address, ctx.newAdmin.address);
      await expect(ctx.escrow.createAgreement(ctx.producer.address, PERIOD_AMOUNT, THRESHOLD, Mode.AUTO)).to.be.revertedWithCustomError(ctx.escrow, "NotAdmin");
      await ctx.escrow.connect(ctx.newAdmin).createAgreement(ctx.producer.address, PERIOD_AMOUNT, THRESHOLD, Mode.AUTO);
    });

    it("lets only the admin change the financial manager and the approval window", async function () {
      const ctx = await loadFixture(deployFixture);
      await expect(ctx.escrow.connect(ctx.stranger).setFinancialManager(ctx.stranger.address)).to.be.revertedWithCustomError(ctx.escrow, "NotAdmin");
      await expect(ctx.escrow.setFinancialManager(ethers.ZeroAddress)).to.be.revertedWithCustomError(ctx.escrow, "ZeroAddress");
      await ctx.escrow.setFinancialManager(ctx.stranger.address);
      expect(await ctx.escrow.financialManager()).to.equal(ctx.stranger.address);
      await expect(ctx.escrow.connect(ctx.stranger).setApprovalWindow(10)).to.be.revertedWithCustomError(ctx.escrow, "NotAdmin");
      await expect(ctx.escrow.setApprovalWindow(0)).to.be.revertedWithCustomError(ctx.escrow, "InvalidParams");
      await ctx.escrow.setApprovalWindow(10);
      expect(await ctx.escrow.approvalWindow()).to.equal(10);
    });
  });

  describe("accounting invariants", function () {
    it("keeps balance >= liabilities and per-agreement bookkeeping consistent over a mixed sequence", async function () {
      const ctx = await loadFixture(deployFixture);
      const escrowAddress = await ctx.escrow.getAddress();
      const Mock = await ethers.getContractFactory("MockProducer");
      const refusing = await Mock.deploy(); // refuses funds: forces deferred payouts into the sequence

      await ctx.escrow.createAgreement(ctx.producer.address, PERIOD_AMOUNT, THRESHOLD, Mode.AUTO); // 0
      await ctx.escrow.createAgreement(await refusing.getAddress(), PERIOD_AMOUNT, THRESHOLD, Mode.HYBRID); // 1
      await ctx.escrow.connect(ctx.funder).deposit(0, { value: PERIOD_AMOUNT * 4n });
      await ctx.escrow.connect(ctx.stranger).deposit(1, { value: PERIOD_AMOUNT * 3n });

      async function check() {
        const liabilities = await ctx.escrow.totalLiabilities();
        expect(await ethers.provider.getBalance(escrowAddress)).to.be.gte(liabilities);
        let sum = 0n;
        for (const id of [0, 1]) {
          const a = await ctx.escrow.getAgreement(id);
          expect(a.released + a.refunded).to.be.lte(a.deposited);
          expect(a.committed).to.be.lte(a.deposited - a.released - a.refunded);
          sum += a.deposited - a.released - a.refunded;
        }
        sum += await ctx.escrow.pendingWithdrawals(await refusing.getAddress());
        sum += await ctx.escrow.pendingWithdrawals(ctx.producer.address);
        expect(sum).to.equal(liabilities);
      }

      await check();
      await submit(ctx, 0, 1, "p0-1"); await check();
      await submit(ctx, 0, 2, "p0-2", 20); await check(); // rejected
      await submit(ctx, 1, 1, "p1-1"); await check(); // pending approval
      await ctx.escrow.connect(ctx.financialManager).approve(1, 1); await check();
      await ctx.escrow.release(0, 1); await check();
      await ctx.escrow.release(1, 1); await check(); // deferred payout
      await submit(ctx, 0, 3, "p0-3"); await check();
      await ctx.escrow.refund(0, PERIOD_AMOUNT); await check();
      await ctx.escrow.release(0, 3); await check();
      await ctx.escrow.refund(1, PERIOD_AMOUNT); await check();
    });
  });
});
