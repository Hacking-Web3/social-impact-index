const { ethers, network } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');
const { tryCatch } = require("ramda");

use(solidity);

describe("Profile Registry", function () {
  //let myContract;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  describe("Collect, Add Profile/Index", function () {
    it("Should deploy Collect", async function () {
      const CollectContract = await ethers.getContractFactory("Collect");

      collectContract = await CollectContract.deploy();
    });

    it("Should add new organizations to the contract", async function () {
      const CollectContract = await ethers.getContractFactory("Collect");
      const collectContract = await CollectContract.deploy();

      const addressONE = "0xc602dc3fb4a966cd6aed233db2ae4a5e596fcc27"
      const addressTWO = "0x130e7436fa0fb04ebd2568faf2780fcf11774583"
      const addressTHREE = "0xe0af683a87495380a80f91bde8dc4fbed1421357"

      const emptyProfile = await collectContract.getProfile(2);

      expect(emptyProfile.ownerAddress).to.equal(constants.ZERO_ADDRESS);

      const dataOne = ["ceramicStreamOne", addressONE, true];
      const dataTwo = ["ceramicStreamTwo", addressTWO, false];
      const dataThree = ["ceramicStreamThree", addressTHREE, true];

      const indexes = [1, 4, 2]
      const datas = [dataOne, dataTwo, dataThree];

      const tx = await collectContract.addProfiles(indexes, datas);
      await tx.wait();


      const SioONE = await collectContract.getProfile(1);
      const SioTWO = await collectContract.getProfile(4);
      const SioTHREE = await collectContract.getProfile(2);

      expect(SioONE.ownerAddress.toLowerCase()).to.equal(addressONE);
      expect(SioTWO.ownerAddress.toLowerCase()).to.equal(addressTWO);
      expect(SioTHREE.ownerAddress.toLowerCase()).to.equal(addressTHREE);
    });

    it("Change infos with right address", async function () {
      await network.provider.request({
        method: 'hardhat_reset',
        params: [
          {
            forking: {
              jsonRpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/LjjqK5PekBuJj8FxfyX2ZZLcU1HYZWvI',
              blockNumber: 12964900,
            },
          },
        ],
      });

      const CollectContract = await ethers.getContractFactory("Collect");
      const collectContract = await CollectContract.deploy();

      await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: ['0xf60c2Ea62EDBfE808163751DD0d8693DCb30019c'],
      });

      const signer = await ethers.getSigner('0xf60c2Ea62EDBfE808163751DD0d8693DCb30019c');
      const impCollectContract = collectContract.connect(signer);

      const addressONE = signer.address;
      const addressTWO = "0x130e7436fa0fb04ebd2568faf2780fcf11774583"
      const addressTHREE = "0xe0af683a87495380a80f91bde8dc4fbed1421357"


      const emptyProfile = await collectContract.getProfile(2);
      expect(emptyProfile.ownerAddress).to.equal(constants.ZERO_ADDRESS);

      const dataOne = ["ceramicStreamOne", addressONE, true];
      const dataTwo = ["ceramicStreamTwo", addressTWO, false];
      const dataThree = ["ceramicStreamThree", addressTHREE, true];

      const indexes = [1, 4, 2]
      const datas = [dataOne, dataTwo, dataThree];


      const tx = await collectContract.addProfiles(indexes, datas);
      await tx.wait();

      const SioONE = await collectContract.getProfile(1);
      const SioTWO = await collectContract.getProfile(4);
      const SioTHREE = await collectContract.getProfile(2);

      expect(SioONE.ownerAddress.toLowerCase()).to.equal(addressONE.toLowerCase());
      expect(SioTWO.ownerAddress.toLowerCase()).to.equal(addressTWO);
      expect(SioTHREE.ownerAddress.toLowerCase()).to.equal(addressTHREE);

      const newAddress = "0xff4288218F96e5ff1A1F8766ccFC65921DFf86B8"
      const newData = [["newCeramicStream", newAddress, false]];
      const newIndexes = [1];


      const tx2 = await impCollectContract.addProfiles(newIndexes, newData);
      await tx2.wait();

      const newSioONE = await collectContract.getProfile(1);

      expect(newSioONE.ownerAddress.toLowerCase()).to.equal(newAddress.toLowerCase());
    });

    it("Change infos with wrong address", async function () {
      const CollectContract = await ethers.getContractFactory("Collect");
      const collectContract = await CollectContract.deploy();

      const addressONE = "0xc602dc3fb4a966cd6aed233db2ae4a5e596fcc27";
      const addressTWO = "0x130e7436fa0fb04ebd2568faf2780fcf11774583"
      const addressTHREE = "0xe0af683a87495380a80f91bde8dc4fbed1421357"

      const emptyProfile = await collectContract.getProfile(2);
      expect(emptyProfile.ownerAddress).to.equal(constants.ZERO_ADDRESS);

      const dataOne = ["ceramicStreamOne", addressONE, true];
      const dataTwo = ["ceramicStreamTwo", addressTWO, false];
      const dataThree = ["ceramicStreamThree", addressTHREE, true];

      const indexes = [1, 4, 2]
      const datas = [dataOne, dataTwo, dataThree];

      const tx = await collectContract.addProfiles(indexes, datas);
      await tx.wait();

      const SioONE = await collectContract.getProfile(1);
      const SioTWO = await collectContract.getProfile(4);
      const SioTHREE = await collectContract.getProfile(2);

      expect(SioONE.ownerAddress.toLowerCase()).to.equal(addressONE.toLowerCase());
      expect(SioTWO.ownerAddress.toLowerCase()).to.equal(addressTWO);
      expect(SioTHREE.ownerAddress.toLowerCase()).to.equal(addressTHREE);

      const newAddress = "0xff4288218F96e5ff1A1F8766ccFC65921DFf86B8"
      const newData = [["newCeramicStream", newAddress, false]];
      const newIndexes = [1];

      await expect(collectContract.addProfiles(newIndexes, newData)).to.be.revertedWith("Not the owner or unavailable ID");
    });

    it("Creation of a new index", async function () {
      await network.provider.request({
        method: 'hardhat_reset',
        params: [
          {
            forking: {
              jsonRpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/LjjqK5PekBuJj8FxfyX2ZZLcU1HYZWvI',
              blockNumber: 12964900,
            },
          },
        ],
      });

      const CollectContract = await ethers.getContractFactory("Collect");
      const collectContract = await CollectContract.deploy();

      await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: ['0xf60c2Ea62EDBfE808163751DD0d8693DCb30019c'],
      });

      const signer = await ethers.getSigner('0xf60c2Ea62EDBfE808163751DD0d8693DCb30019c');
      const impCollectContract = collectContract.connect(signer);

      const addressONE = signer.address;
      const addressTWO = "0x130e7436fa0fb04ebd2568faf2780fcf11774583"
      const addressTHREE = "0xe0af683a87495380a80f91bde8dc4fbed1421357"

      const dataOne = ["ceramicStreamOne", addressONE, true];
      const dataTwo = ["ceramicStreamTwo", addressTWO, false];
      const dataThree = ["ceramicStreamThree", addressTHREE, true];

      const IDs = [1, 4, 2]
      const datas = [dataOne, dataTwo, dataThree];


      const tx = await collectContract.addProfiles(IDs, datas);
      await tx.wait();

      const indexIDs = [1, 4];
      const shares = [5000, 5000];

      const tx2 = await impCollectContract.createIndex(indexIDs, shares);
      tx2.wait();

      const userIndexes = await impCollectContract.getUserIndexes(signer.address);

      const SioONE = await collectContract.getProfile(1);

      expect(userIndexes[0].profiles.length).to.equal(2);
      expect(userIndexes[0].profiles[0]).to.equal(1);
      expect(userIndexes[0].profiles[1]).to.equal(4);
      expect(userIndexes[0].shares[0]).to.equal(5000);
    });

    it("Creation of a new index with wrong shares", async function () {
      await network.provider.request({
        method: 'hardhat_reset',
        params: [
          {
            forking: {
              jsonRpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/LjjqK5PekBuJj8FxfyX2ZZLcU1HYZWvI',
              blockNumber: 12964900,
            },
          },
        ],
      });

      const CollectContract = await ethers.getContractFactory("Collect");
      const collectContract = await CollectContract.deploy();

      await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: ['0xf60c2Ea62EDBfE808163751DD0d8693DCb30019c'],
      });

      const signer = await ethers.getSigner('0xf60c2Ea62EDBfE808163751DD0d8693DCb30019c');
      const impCollectContract = collectContract.connect(signer);

      const addressONE = signer.address;
      const addressTWO = "0x130e7436fa0fb04ebd2568faf2780fcf11774583"
      const addressTHREE = "0xe0af683a87495380a80f91bde8dc4fbed1421357"

      const dataOne = ["ceramicStreamOne", addressONE, true];
      const dataTwo = ["ceramicStreamTwo", addressTWO, false];
      const dataThree = ["ceramicStreamThree", addressTHREE, true];

      const IDs = [1, 4, 2]
      const datas = [dataOne, dataTwo, dataThree];


      const tx = await collectContract.addProfiles(IDs, datas);
      await tx.wait();

      const indexIDs = [1, 4];
      const shares = [5000, 3000];

      await expect(impCollectContract.createIndex(indexIDs, shares)).to.be.revertedWith("The repartition of the shares is different than 100%");
    });
  });

  describe("Collect, donate", function () {
    it("Donate to Profile", async function () {
      await network.provider.request({
        method: 'hardhat_reset',
        params: [
          {
            forking: {
              jsonRpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/LjjqK5PekBuJj8FxfyX2ZZLcU1HYZWvI',
              blockNumber: 12964900,
            },
          },
        ],
      });

      const CollectContract = await ethers.getContractFactory("Collect");
      const collectContract = await CollectContract.deploy();

      await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: ['0xf60c2Ea62EDBfE808163751DD0d8693DCb30019c'],
      });

      const signer = await ethers.getSigner('0xf60c2Ea62EDBfE808163751DD0d8693DCb30019c');
      const impCollectContract = collectContract.connect(signer);

      const addressONE = signer.address;
      const addressTWO = "0x130e7436fa0fb04ebd2568faf2780fcf11774583"
      const addressTHREE = "0xe0af683a87495380a80f91bde8dc4fbed1421357"

      const dataOne = ["ceramicStreamOne", addressONE, true];
      const dataTwo = ["ceramicStreamTwo", addressTWO, false];
      const dataThree = ["ceramicStreamThree", addressTHREE, true];

      const IDs = [1, 4, 2]
      const datas = [dataOne, dataTwo, dataThree];


      const tx = await collectContract.addProfiles(IDs, datas);
      await tx.wait();

      const amountAddrTwoBefore = await collectContract.provider.getBalance(addressTWO);

      const tx2 = await impCollectContract.donateToProfile(4, { value: Math.pow(10, 18).toString() });
      tx2.wait();

      const amountAddrTwoAfter = await collectContract.provider.getBalance(addressTWO);
      expect(amountAddrTwoAfter).to.above(amountAddrTwoBefore);
    });

    it("Donate to Index", async function () {
      await network.provider.request({
        method: 'hardhat_reset',
        params: [
          {
            forking: {
              jsonRpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/LjjqK5PekBuJj8FxfyX2ZZLcU1HYZWvI',
              blockNumber: 12964900,
            },
          },
        ],
      });

      const CollectContract = await ethers.getContractFactory("Collect");
      const collectContract = await CollectContract.deploy();

      await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: ['0xf60c2Ea62EDBfE808163751DD0d8693DCb30019c'],
      });

      const signer = await ethers.getSigner('0xf60c2Ea62EDBfE808163751DD0d8693DCb30019c');
      const impCollectContract = collectContract.connect(signer);

      const addressONE = signer.address;
      const addressTWO = "0x130e7436fa0fb04ebd2568faf2780fcf11774583"
      const addressTHREE = "0xe0af683a87495380a80f91bde8dc4fbed1421357"
      const addressFOUR = "0x3746376FAB142D2259ADC228Fc406F678B29fBC3"

      const dataOne = ["ceramicStreamOne", addressONE, true];
      const dataTwo = ["ceramicStreamTwo", addressTWO, false];
      const dataThree = ["ceramicStreamThree", addressTHREE, true];
      const dataFOUR = ["ceramicStreamThree", addressFOUR, true];

      const IDs = [1, 4, 2, 15]
      const datas = [dataOne, dataTwo, dataThree, dataFOUR];


      const tx = await impCollectContract.addProfiles(IDs, datas);
      await tx.wait();

      const indexIDs = [2, 15];
      const shares = [5000, 5000];

      const amountAddrTwoBefore = await impCollectContract.provider.getBalance(addressTHREE);
      const amountAddrFOURBefore = await impCollectContract.provider.getBalance(addressFOUR)

      const tx2 = await impCollectContract.createIndex(indexIDs, shares);
      tx2.wait();

      const tx3 = await impCollectContract.donateToIndex(addressONE, 0, { value: (5 * Math.pow(10, 18)).toString() });
      tx3.wait();

      const amountAddrTwoAfter = await impCollectContract.provider.getBalance(addressTHREE);
      const amountAddrFOURAfter = await impCollectContract.provider.getBalance(addressFOUR)

      expect(amountAddrTwoAfter).to.above(amountAddrTwoBefore);
      expect(amountAddrFOURAfter).to.above(amountAddrFOURBefore);
    });
  });

  describe("Update", function () {
    it("Update a profile OK", async function () {
      await network.provider.request({
        method: 'hardhat_reset',
        params: [
          {
            forking: {
              jsonRpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/LjjqK5PekBuJj8FxfyX2ZZLcU1HYZWvI',
              blockNumber: 12964900,
            },
          },
        ],
      });

      const CollectContract = await ethers.getContractFactory("Collect");
      const collectContract = await CollectContract.deploy();

      await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: ['0xc602dc3fb4a966cd6aed233db2ae4a5e596fcc27'],
      });

      const signer = await ethers.getSigner('0xc602dc3fb4a966cd6aed233db2ae4a5e596fcc27');
      const impCollectContract = collectContract.connect(signer);

      const firstAddress = "0xc602dc3fb4a966cd6aed233db2ae4a5e596fcc27"
      const firstData = ["firstCeramicStream", firstAddress, true];

      const newAddress = "0x130e7436fa0fb04ebd2568faf2780fcf11774583"
      const newData = ["NewCeramicStream", newAddress, false];

      const indexes = [1]
      const datas = [firstData];
      
      const tx = await impCollectContract.addProfiles(indexes, datas);
      await tx.wait();
      
      const firstProfile = await impCollectContract.getProfile(1);

      expect(firstProfile.ownerAddress.toLowerCase()).to.equal(firstAddress);

      const txChangeProfile = await impCollectContract.updateProfile(1, newData);
      await txChangeProfile.wait();

      const updatedProfile = await impCollectContract.getProfile(1)

      expect(updatedProfile.ownerAddress.toLowerCase()).to.equal(newAddress);
      expect(updatedProfile.ceramicStream).to.equal("NewCeramicStream");
      expect(updatedProfile.acceptAnonymous).to.equal(false);
    });

    it("Update a profile KO profile doesn't exist", async function () {
      const CollectContract = await ethers.getContractFactory("Collect");
      const collectContract = await CollectContract.deploy();

      const newAddress = "0x130e7436fa0fb04ebd2568faf2780fcf11774583"
      const newData = ["NewCeramicStream", newAddress, false];

      await expect(collectContract.updateProfile(1, newData)).to.be.revertedWith("Asked profile doesn't exist");
    });

    it("Update a profile KO not owner: not alowed to modify", async function () {
      const CollectContract = await ethers.getContractFactory("Collect");
      const collectContract = await CollectContract.deploy();

      const firstAddress = "0xc602dc3fb4a966cd6aed233db2ae4a5e596fcc27"
      const firstData = ["firstCeramicStream", firstAddress, true];

      const newAddress = "0x130e7436fa0fb04ebd2568faf2780fcf11774583"
      const newData = ["NewCeramicStream", newAddress, false];

      const indexes = [1]
      const datas = [firstData];
      
      const tx = await collectContract.addProfiles(indexes, datas);
      await tx.wait();

      await expect(collectContract.updateProfile(1, newData)).to.be.revertedWith("You are not allowed to modify this profile");
    });

    it("Update an index OK", async function () {
      await network.provider.request({
        method: 'hardhat_reset',
        params: [
          {
            forking: {
              jsonRpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/LjjqK5PekBuJj8FxfyX2ZZLcU1HYZWvI',
              blockNumber: 12964900,
            },
          },
        ],
      });

      const CollectContract = await ethers.getContractFactory("Collect");
      const collectContract = await CollectContract.deploy();

      await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: ['0xf60c2Ea62EDBfE808163751DD0d8693DCb30019c'],
      });

      const signer = await ethers.getSigner('0xf60c2Ea62EDBfE808163751DD0d8693DCb30019c');
      const impCollectContract = collectContract.connect(signer);

      const addressA = signer.address;
      const addressB = "0x130e7436fa0fb04ebd2568faf2780fcf11774583"

      const addressC = "0xe0af683a87495380a80f91bde8dc4fbed1421357"
      const addressD = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

      const dataA = ["ceramicStreamA", addressA, true];
      const dataB = ["ceramicStreamB", addressB, false];

      const dataC = ["ceramicStreamC", addressC, true];
      const dataD = ["ceramicStreamD", addressD, false];

      const IDs = [1, 2, 69, 420];
      const datas= [dataA, dataB, dataC, dataD];

      const txAddProfiles = await collectContract.addProfiles(IDs, datas);
      await txAddProfiles.wait();

      const profileIDs = [1, 2];
      const shares = [5000, 5000];

      const newProfileIDs = [69, 420];
      const newShares = [2500, 7500];

      const txCreateIndex = await impCollectContract.createIndex(profileIDs, shares);
      txCreateIndex.wait();

      const userIndexes = await impCollectContract.getUserIndexes(signer.address);

      expect(userIndexes[0].profiles.length).to.equal(2);
      expect(userIndexes[0].profiles[0]).to.equal(1);
      expect(userIndexes[0].profiles[1]).to.equal(2);
      expect(userIndexes[0].shares[0]).to.equal(5000);
      
      const txUpdateIndex = await impCollectContract.updateIndex(0, newProfileIDs, newShares);
      txUpdateIndex.wait();

      const userIndexesAfterTx = await impCollectContract.getUserIndexes(signer.address);

      expect(userIndexesAfterTx[0].profiles.length).to.equal(2);
      expect(userIndexesAfterTx[0].profiles[0]).to.equal(69);
      expect(userIndexesAfterTx[0].profiles[1]).to.equal(420);
      expect(userIndexesAfterTx[0].shares[0]).to.equal(2500);
      expect(userIndexesAfterTx[0].shares[1]).to.equal(7500);
    });
  });
});
