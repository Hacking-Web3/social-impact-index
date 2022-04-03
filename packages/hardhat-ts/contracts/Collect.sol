pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract Collect {
  event SetIOs(address sender, uint256[] IDs, SioData[] data);
  event CreationOfIndex(address sender, uint256[] IDs, uint256[] shares, uint256 insertPosition);
  event Donate(uint256 ID, uint256 amount);

  struct SioData {
    string ceramicStream;
    address ownerAddress;
    bool acceptAnonymous;
  }

  struct Index {
    uint256[] sios;
    uint256[] shares;
  }

  mapping(uint256 => SioData) SIOData;
  mapping(address => Index[]) Indexes;

  uint256 totalDonation = 0;

  constructor() payable {
    // what should we do on deploy?
  }

  function setSIOs(uint256[] memory IDs, SioData[] memory data) public {
    require(IDs.length == data.length, "SIO IDs and SIO datas have to be the same length");
    for (uint256 i = 0; i < IDs.length; i++) {
      require(SIOData[IDs[i]].ownerAddress == address(0) || SIOData[IDs[i]].ownerAddress == msg.sender, "Not the owner or unavailable ID");
      require(data[i].ownerAddress != address(0), "Can't set SIO address to 0");
      SioData memory newSio;
      newSio.ceramicStream = data[i].ceramicStream;
      newSio.ownerAddress = data[i].ownerAddress;
      newSio.acceptAnonymous = data[i].acceptAnonymous;
      SIOData[IDs[i]] = newSio;
    }
    emit SetIOs(msg.sender, IDs, data);
  }

  function getSIO(uint256 Id) public view returns (SioData memory) {
    return SIOData[Id];
  }

  function createIndex(uint256[] memory IDs, uint256[] memory shares) public {
    uint256 shareSum = 0;
    require(IDs.length == shares.length, "SIO IDs and share not the same length");
    for (uint256 i = 0; i < IDs.length; i++) {
      require(SIOData[IDs[i]].ownerAddress != address(0), "Invalid SIO ID");
      shareSum += shares[i];
    }
    require(shareSum == 10000, "The repartition of the shares is different than 100%");
    Index memory newIndex;
    newIndex.shares = shares;
    newIndex.sios = IDs;

    Indexes[msg.sender].push(newIndex);
    emit CreationOfIndex(msg.sender, IDs, shares, Indexes[msg.sender].length - 1);
  }

  function getUserIndexes(address addr) public view returns (Index[] memory) {
    return Indexes[addr];
  }

  function donateToSIO(uint256 posSIO) external payable {
    require(SIOData[posSIO].ownerAddress != address(0), "Invalid address position");
    (bool sent, ) = SIOData[posSIO].ownerAddress.call{ value: msg.value }("");
    require(sent, "Failed to send Ether");
    emit Donate(posSIO, msg.value);
    totalDonation += msg.value;
  }

  function donateToIndex(address creator, uint256 indexPos) external payable {
    uint256 total = msg.value;
    Index memory index;
    uint256 amountToSend;

    require(Indexes[creator].length != 0, "Index doesn't exist");
    index = Indexes[creator][indexPos];

    for (uint256 i = 0; i < index.sios.length; i++) {
      require(SIOData[index.sios[i]].ownerAddress != address(0), "Invalid address position");
      amountToSend = (index.shares[i] * total) / 10000;
      (bool sent, ) = SIOData[index.sios[i]].ownerAddress.call{ value: amountToSend }("");
      require(sent, "Failed to send Ether");
      emit Donate(indexPos, amountToSend);
    }
    totalDonation += msg.value;
  }

  // Function to receive Ether. msg.data must be empty
  receive() external payable {}

  fallback() external payable {
    revert();
  }
}
