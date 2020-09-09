pragma solidity ^0.6.0;

import '../interfaces/IVault.sol';
import '../Contribute.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@nomiclabs/buidler/console.sol';

contract ContributeMock is Contribute, Ownable {
  constructor(address _vault, uint256 _endTime) public Contribute(_vault, _endTime) {}

  function withdraw() external onlyOwner() {
    IVault(vault).redeem(IVault(vault).getBalance());
  }

  function finishMintEvent() external {
    GME = false;
  }

  function getTime() external view returns (uint256) {
    return now;
  }

  function tokenBalance(address user) external view returns (uint256) {
    return token.balanceOf(user);
  }

  function floor() external view returns (uint256) {
    return getBurnedTokensAmount().div(DIVIDER);
  }
}
