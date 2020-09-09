require('dotenv').config({path: '.env'});
const fs = require('fs');
const moment = require('moment');
const provider = ethers.getDefaultProvider('kovan');
const mnemonic = fs.readFileSync('.private').toString().trim();
const endTime = 1600646400; // Monday September 21 2020 00:00:00 GMT
let Alice = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
let Bob = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/1").connect(provider);
let Charlie = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/2").connect(provider);

let overrides = {
  // The maximum units of gas for the transaction to use
  gasLimit: 8000000,
  gasPrice: ethers.utils.parseUnits('10.0', 'gwei'),
};

async function approveAll(contract, reserve) {
  let approval = ethers.utils.parseEther('1000000000');
  await reserve.approve(contract.address, approval);
  await reserve.connect(Bob).approve(contract.address, approval);
  let tx = await reserve.connect(Charlie).approve(contract.address, approval);
  await tx.wait(1);
}

async function setup() {

  const reserveSupply = ethers.utils.parseEther("10000000000");
  const deployer = await Alice.getAddress();
  const MUSD = await ethers.getContractFactory("MUSDMock");
  this.reserve = await MUSD.deploy(deployer, reserveSupply);
  await this.reserve.deployed();

  const Nexus = await ethers.getContractFactory("NexusMock");
  this.nexus = await Nexus.deploy(this.reserve.address);
  await this.nexus.deployed();

  const Vault = await ethers.getContractFactory("MStableLendMock");
  this.vault = await Vault.deploy(this.reserve.address, this.nexus.address, overrides);
  await this.vault.deployed();

  const Contribute = await ethers.getContractFactory('ContributeMock');
  this.contribute = await Contribute.deploy(this.vault.address, endTime, overrides);
  await this.contribute.deployed();
  console.log('Contribute deployed to:', this.contribute.address);
}

async function simulateGenesis() {
  let value = ethers.utils.parseEther('10000');
  await this.reserve.transfer(Bob.getAddress(), value);
  await this.reserve.transfer(Charlie.getAddress(), value);

  let tx = await this.contribute.generateGenesisMock(endTime, overrides);
  await tx.wait(1);

  const genesisAddress = await contribute.genesis();
  this.genesis = await ethers.getContractAt("GenesisMock", genesisAddress);

  await approveAll(this.genesis, this.reserve);

  await this.genesis.connect(Alice).deposit(value.div(10), overrides);
  await this.genesis.connect(Bob).deposit(value.div(10), overrides);
  tx = await this.genesis.connect(Charlie).deposit(value.div(10), overrides);
  await tx.wait(1);

  tx = await this.contribute.finishMintEvent(overrides);
  await tx.wait(1);

  await approveAll(this.contribute, this.reserve);

  tx = await this.genesis.setEndTime(moment().unix(), overrides);
  await tx.wait(1);

  await this.genesis.connect(Alice).claim(overrides);
  await this.genesis.connect(Bob).claim(overrides);
  tx = await this.genesis.connect(Charlie).claim(overrides);
  await tx.wait(1);
}

async function invest() {
  let value = ethers.utils.parseEther('1000');

  await this.contribute.connect(Alice).invest(value, overrides);
  await this.contribute.connect(Bob).invest(value, overrides);
  let tx = await this.contribute.connect(Charlie).invest(value, overrides);
  await tx.wait(1);
}

async function main() {
  await setup();
  await simulateGenesis();
  await invest();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
