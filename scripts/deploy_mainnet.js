require('dotenv').config({path: '.env'});
const fs = require('fs');
const provider = ethers.getDefaultProvider('homestead');
const mnemonic = fs.readFileSync('.private').toString().trim();
const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
const reserveAddress = '0xe2f2a5C287993345a840Db3B0845fbC70f5935a5';
const nexusAddress = '0xAFcE80b19A8cE13DEc0739a1aaB7A028d6845Eb3';
const endTime = 1600646400; // Monday September 21 2020 00:00:00 GMT

let overrides = {
  // The maximum units of gas for the transaction to use
  gasLimit: 9000000,
  // Update the gas price to the latest
  gasPrice: ethers.utils.parseUnits('80.0', 'gwei'),
};

async function main() {
  const Vault = await ethers.getContractFactory('Vault');
  this.vault = await Vault.deploy(reserveAddress, nexusAddress, overrides);
  await this.vault.deployed();

  const Contribute = await ethers.getContractFactory('Contribute');
  this.contribute = await Contribute.deploy(this.vault.address, endTime, overrides);
  await this.contribute.deployed();
  console.log('Contribute deployed to:', this.contribute.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
