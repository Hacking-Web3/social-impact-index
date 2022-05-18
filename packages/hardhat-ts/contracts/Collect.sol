pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract Collect {
  event AddProfile(address sender, uint256 IDs, ProfileData data);
  event CreationOfIndex(address sender, uint256[] IDs, uint256[] shares, uint256 insertPosition);
  event Donate(uint256 ID, uint256 amount);
  event UpdateProfile(address sender, uint256 profileId, ProfileData data);
  event UpdateIndex(address sender, uint256 indexId, uint256[] profiles, uint256[] shares);

  struct ProfileData {
    string ceramicStream;
    address ownerAddress;
    bool acceptAnonymous;
    bool exist;
  }

  struct Index {
    uint256[] profiles;
    uint256[] shares;
    bool exist;
  }

  mapping(uint256 => ProfileData) Profiles;
  mapping(address => Index[]) Indexes;

  uint256 totalDonation = 0;

  constructor() payable {
    // what should we do on deploy?
  }

  function updateProfile(
    uint256 indexProfile,
    ProfileData memory newData
  ) public {
    require(Profiles[indexProfile].ownerAddress != address(0), "Asked profile doesn't exist");
    require(Profiles[indexProfile].ownerAddress == msg.sender, "You are not allowed to modify this profile");
    Profiles[indexProfile].ceramicStream = newData.ceramicStream;
    Profiles[indexProfile].ownerAddress = newData.ownerAddress;
    Profiles[indexProfile].acceptAnonymous = newData.acceptAnonymous;

    emit UpdateProfile(msg.sender, indexProfile, Profiles[indexProfile]);
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
      newProfile.exist = true;
      Profiles[IDs[i]] = newProfile;
      emit AddProfile(msg.sender, IDs[i], data[i]);
    }
  }

  function getProfile(uint256 Id) public view returns (ProfileData memory) {
    return Profiles[Id];
  }

  function updateIndex(
    uint256 indexID,
    uint256[] memory profilesIds,
    uint256[] memory shares
  ) public {
    require(indexID >= 0 && indexID < Indexes[msg.sender].length, "Invalid index ID");
    require(profilesIds.length == shares.length, "Profile IDs and share not the same length");
    require(shares.length > 0, "Profile IDs and shares repartition can't be empty");

    Indexes[msg.sender][indexID].profiles = profilesIds;
    Indexes[msg.sender][indexID].shares = shares;

    emit UpdateIndex(msg.sender, indexID, profilesIds, shares);
  }

  function createIndex(uint256[] memory IDs, uint256[] memory shares) public {
    uint256 shareSum = 0;
    require(IDs.length == shares.length, "Profile IDs and share not the same length");
    require(shares.length > 0, "Profile IDs and shares repartition can't be empty");

    for (uint256 i = 0; i < IDs.length; i++) {
      require(Profiles[IDs[i]].ownerAddress != address(0), "Invalid Profile ID");
      shareSum += shares[i];
    }
    require(shareSum == 10000, "The repartition of the shares is different than 100%");
    Index memory newIndex;
    newIndex.shares = shares;
    newIndex.profiles = IDs;
    newIndex.exist = true;

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
