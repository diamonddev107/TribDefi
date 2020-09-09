require('dotenv').config({path: '.env'});
const fs = require('fs');
const provider = ethers.getDefaultProvider('kovan');
const mnemonic = fs.readFileSync('.private').toString().trim();
const endTime = 1600646400; // Monday September 21 2020 00:00:00 GMT
let Alice = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);

let overrides = {
  // The maximum units of gas for the transaction to use
  gasLimit: 8000000,
  gasPrice: ethers.utils.parseUnits('100.0', 'gwei'),
};

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

async function main() {
  await setup();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
