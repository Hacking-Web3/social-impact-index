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

describe("SIO Registry", function () {
  //let myContract;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  describe("Collect, Add SIO/Index", function () {
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

      const emptySIO = await collectContract.getSIO(2);

      expect(emptySIO.ownerAddress).to.equal(constants.ZERO_ADDRESS);

      const dataOne = ["ceramicStreamOne", addressONE, true];
      const dataTwo = ["ceramicStreamTwo", addressTWO, false];
      const dataThree = ["ceramicStreamThree", addressTHREE, true];

      const indexes = [1, 4, 2]
      const datas = [dataOne, dataTwo, dataThree];

      const tx = await collectContract.setSIOs(indexes, datas);
      await tx.wait();


      const SioONE = await collectContract.getSIO(1);
      const SioTWO = await collectContract.getSIO(4);
      const SioTHREE = await collectContract.getSIO(2);

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


      const emptySIO = await collectContract.getSIO(2);
      expect(emptySIO.ownerAddress).to.equal(constants.ZERO_ADDRESS);

      const dataOne = ["ceramicStreamOne", addressONE, true];
      const dataTwo = ["ceramicStreamTwo", addressTWO, false];
      const dataThree = ["ceramicStreamThree", addressTHREE, true];

      const indexes = [1, 4, 2]
      const datas = [dataOne, dataTwo, dataThree];


      const tx = await collectContract.setSIOs(indexes, datas);
      await tx.wait();

      const SioONE = await collectContract.getSIO(1);
      const SioTWO = await collectContract.getSIO(4);
      const SioTHREE = await collectContract.getSIO(2);

      expect(SioONE.ownerAddress.toLowerCase()).to.equal(addressONE.toLowerCase());
      expect(SioTWO.ownerAddress.toLowerCase()).to.equal(addressTWO);
      expect(SioTHREE.ownerAddress.toLowerCase()).to.equal(addressTHREE);

      const newAddress = "0xff4288218F96e5ff1A1F8766ccFC65921DFf86B8"
      const newData = [["newCeramicStream", newAddress, false]];
      const newIndexes = [1];


      const tx2 = await impCollectContract.setSIOs(newIndexes, newData);
      await tx2.wait();

      const newSioONE = await collectContract.getSIO(1);

      expect(newSioONE.ownerAddress.toLowerCase()).to.equal(newAddress.toLowerCase());
    });

    it("Change infos with wrong address", async function () {
      const CollectContract = await ethers.getContractFactory("Collect");
      const collectContract = await CollectContract.deploy();

      const addressONE = "0xc602dc3fb4a966cd6aed233db2ae4a5e596fcc27";
      const addressTWO = "0x130e7436fa0fb04ebd2568faf2780fcf11774583"
      const addressTHREE = "0xe0af683a87495380a80f91bde8dc4fbed1421357"

      const emptySIO = await collectContract.getSIO(2);
      expect(emptySIO.ownerAddress).to.equal(constants.ZERO_ADDRESS);

      const dataOne = ["ceramicStreamOne", addressONE, true];
      const dataTwo = ["ceramicStreamTwo", addressTWO, false];
      const dataThree = ["ceramicStreamThree", addressTHREE, true];

      const indexes = [1, 4, 2]
      const datas = [dataOne, dataTwo, dataThree];

      const tx = await collectContract.setSIOs(indexes, datas);
      await tx.wait();

      const SioONE = await collectContract.getSIO(1);
      const SioTWO = await collectContract.getSIO(4);
      const SioTHREE = await collectContract.getSIO(2);

      expect(SioONE.ownerAddress.toLowerCase()).to.equal(addressONE.toLowerCase());
      expect(SioTWO.ownerAddress.toLowerCase()).to.equal(addressTWO);
      expect(SioTHREE.ownerAddress.toLowerCase()).to.equal(addressTHREE);

      const newAddress = "0xff4288218F96e5ff1A1F8766ccFC65921DFf86B8"
      const newData = [["newCeramicStream", newAddress, false]];
      const newIndexes = [1];

      await expect(collectContract.setSIOs(newIndexes, newData)).to.be.revertedWith("Not the owner or unavailable ID");
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


      const tx = await collectContract.setSIOs(IDs, datas);
      await tx.wait();

      const indexIDs = [1, 4];
      const shares = [5000, 5000];

      const tx2 = await impCollectContract.createIndex(indexIDs, shares);
      tx2.wait();

      const userIndexes = await impCollectContract.getUserIndexes(signer.address);

      const SioONE = await collectContract.getSIO(1);

      expect(userIndexes[0].sios.length).to.equal(2);
      expect(userIndexes[0].sios[0]).to.equal(1);
      expect(userIndexes[0].sios[1]).to.equal(4);
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


      const tx = await collectContract.setSIOs(IDs, datas);
      await tx.wait();

      const indexIDs = [1, 4];
      const shares = [5000, 3000];

      await expect(impCollectContract.createIndex(indexIDs, shares)).to.be.revertedWith("The repartition of the shares is different than 100%");
    });
  });

  describe("Collect, donate", function () {
    it("Donate to SIO", async function () {
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


      const tx = await collectContract.setSIOs(IDs, datas);
      await tx.wait();

      const amountAddrTwoBefore = await collectContract.provider.getBalance(addressTWO);

      const tx2 = await impCollectContract.donateToSIO(4, { value: Math.pow(10, 18).toString() });
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


      const tx = await impCollectContract.setSIOs(IDs, datas);
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
});
