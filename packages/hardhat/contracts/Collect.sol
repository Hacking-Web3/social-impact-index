pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract Collect {
    //event SetPurpose(address sender, string purpose);

    struct SioData {
        string ceramicStream;
        address ownerAddress;
        bool acceptAnonymous;
    }

    mapping(uint256 => SioData) SIOData;

    constructor() payable {
        // what should we do on deploy?
    }

    function setSIOs(uint256[] memory IDs, SioData[] memory data) public {
        for (uint256 i = 0; i < IDs.length && i < data.length; i++) {
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
    }

    function getSIO(uint256 Id) public view returns (SioData memory) {
        return SIOData[Id];
    }

    /*     function setPurpose(string memory newPurpose) public {
        purpose = newPurpose;
        console.log(msg.sender, "set purpose to", purpose);
        emit SetPurpose(msg.sender, purpose);
    } */

    // to support receiving ETH by default
    receive() external payable {}

    fallback() external payable {}
}
