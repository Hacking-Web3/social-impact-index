pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract Collect {
  event AddProfile(address sender, uint256 IDs, ProfileData data);
  event CreationOfIndex(address sender, uint256[] IDs, uint256[] shares, uint256 insertPosition);
  event Donate(uint256 ID, uint256 amount);

  struct ProfileData {
    string ceramicStream;
    address ownerAddress;
    bool acceptAnonymous;
  }

  struct Index {
    uint256[] profiles;
    uint256[] shares;
  }

  mapping(uint256 => ProfileData) Profiles;
  mapping(address => Index[]) Indexes;

  uint256 totalDonation = 0;

  constructor() payable {
    // what should we do on deploy?
  }

  function addProfiles(uint256[] memory IDs, ProfileData[] memory data) public {
    require(IDs.length == data.length, "Profile IDs and Profile datas have to be the same length");
    for (uint256 i = 0; i < IDs.length; i++) {
      require(Profiles[IDs[i]].ownerAddress == address(0) || Profiles[IDs[i]].ownerAddress == msg.sender, "Not the owner or unavailable ID");
      require(data[i].ownerAddress != address(0), "Can't set Profile address to 0");
      ProfileData memory newProfile;
      newProfile.ceramicStream = data[i].ceramicStream;
      newProfile.ownerAddress = data[i].ownerAddress;
      newProfile.acceptAnonymous = data[i].acceptAnonymous;
      Profiles[IDs[i]] = newProfile;
      emit AddProfile(msg.sender, IDs[i], data[i]);
    }
  }

  function getProfile(uint256 Id) public view returns (ProfileData memory) {
    return Profiles[Id];
  }

  function createIndex(uint256[] memory IDs, uint256[] memory shares) public {
    uint256 shareSum = 0;
    require(IDs.length == shares.length, "Profile IDs and share not the same length");
    for (uint256 i = 0; i < IDs.length; i++) {
      require(Profiles[IDs[i]].ownerAddress != address(0), "Invalid Profile ID");
      shareSum += shares[i];
    }
    require(shareSum == 10000, "The repartition of the shares is different than 100%");
    Index memory newIndex;
    newIndex.shares = shares;
    newIndex.profiles = IDs;

    Indexes[msg.sender].push(newIndex);
    emit CreationOfIndex(msg.sender, IDs, shares, Indexes[msg.sender].length - 1);
  }

  function getUserIndexes(address addr) public view returns (Index[] memory) {
    return Indexes[addr];
  }

  function donateToProfile(uint256 posProfile) external payable {
    require(Profiles[posProfile].ownerAddress != address(0), "Invalid address position");
    (bool sent, ) = Profiles[posProfile].ownerAddress.call{ value: msg.value }("");
    require(sent, "Failed to send Ether");
    emit Donate(posProfile, msg.value);
    totalDonation += msg.value;
  }

  function donateToIndex(address creator, uint256 indexPos) external payable {
    uint256 total = msg.value;
    Index memory index;
    uint256 amountToSend;

    require(Indexes[creator].length != 0 && indexPos < Indexes[creator].length, "Index doesn't exist");
    index = Indexes[creator][indexPos];

    for (uint256 i = 0; i < index.profiles.length; i++) {
      require(Profiles[index.profiles[i]].ownerAddress != address(0), "Invalid address position");
      amountToSend = (index.shares[i] * total) / 10000;
      (bool sent, ) = Profiles[index.profiles[i]].ownerAddress.call{ value: amountToSend }("");
      require(sent, "Failed to send Ether");
      emit Donate(index.profiles[i], amountToSend);
    }
    totalDonation += msg.value;
  }

  // Function to receive Ether. msg.data must be empty
  receive() external payable {}

  fallback() external payable {
    revert();
  }
}
