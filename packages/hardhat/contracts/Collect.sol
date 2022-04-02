pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract Collect {
    event SetIOs(address sender, uint256[] IDs, SioData[] data);
    event CreationOfIndex(address sender, uint256[] IDs, uint256[] shares);

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

    constructor() payable {
        // what should we do on deploy?
    }

    function setSIOs(uint256[] memory IDs, SioData[] memory data) public {
        require(
            IDs.length == data.length,
            "SIO IDs and SIO datas have to be the same length"
        );
        for (uint256 i = 0; i < IDs.length; i++) {
            require(
                SIOData[IDs[i]].ownerAddress == address(0) ||
                    SIOData[IDs[i]].ownerAddress == msg.sender,
                "Not the owner or unavailable ID"
            );
            require(
                data[i].ownerAddress != address(0),
                "Can't set SIO address to 0"
            );
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
        require(
            IDs.length == shares.length,
            "SIO IDs and share not the same length"
        );
        for (uint256 i = 0; i < IDs.length; i++) {
            require(
                SIOData[IDs[i]].ownerAddress != address(0),
                "Invalid SIO ID"
            );
            shareSum += shares[i];
        }
        require(
            shareSum == 10000,
            "The repartition of the shares is different than 100%"
        );
        Index memory newIndex;
        newIndex.shares = shares;
        newIndex.sios = IDs;

        Indexes[msg.sender].push(newIndex);
        emit CreationOfIndex(msg.sender, IDs, shares);
    }

    function getUserIndexes(address addr) public view returns (Index[] memory) {
        return Indexes[addr];
    }

    // to support receiving ETH by default
    receive() external payable {}

    fallback() external payable {}
}
