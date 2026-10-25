const { expect } = require("chai");
const { assertAllowedDeployer, COMPROMISED_DEPLOYER } = require("../scripts/lib/deployGuard");

describe("Deploy guard", function () {
  it("refuses the compromised deployer account in any letter case", function () {
    expect(() => assertAllowedDeployer(COMPROMISED_DEPLOYER)).to.throw(/compromised/i);
    expect(() => assertAllowedDeployer(COMPROMISED_DEPLOYER.toUpperCase().replace("0X", "0x"))).to.throw(/compromised/i);
    expect(() => assertAllowedDeployer(COMPROMISED_DEPLOYER.toLowerCase())).to.throw(/compromised/i);
  });

  it("accepts any other account", function () {
    expect(() => assertAllowedDeployer("0x000000000000000000000000000000000000dEaD")).to.not.throw();
  });

  it("refuses an empty or malformed deployer instead of letting it through", function () {
    expect(() => assertAllowedDeployer(undefined)).to.throw(/deployer/i);
    expect(() => assertAllowedDeployer("not-an-address")).to.throw(/deployer/i);
  });
});
