require('dotenv').config({path: '.env'});
const fs = require('fs');
const provider = ethers.getDefaultProvider('ropsten');
const mnemonic = fs.readFileSync('.private').toString().trim();
let Alice = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
let Bob = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/1").connect(provider);
let Charlie = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/2").connect(provider);

const reserveAddress = '0x4E1000616990D83e56f4b5fC6CC8602DcfD20459';
const nexusAddress = '0xeD04Cd19f50F893792357eA53A549E23Baf3F6cB';

let overrides = {
  // The maximum units of gas for the transaction to use
  gasLimit: 9000000,
  gasPrice: ethers.utils.parseUnits('9.0', 'gwei'),
};

async function approveAll(contribute, reserve) {
  let approval = ethers.utils.parseEther('1000000000');
  await reserve.approve(contribute.address, approval);
  await reserve.connect(Bob).approve(contribute.address, approval);
  let tx = await reserve.connect(Charlie).approve(contribute.address, approval);
  await tx.wait(1);
}

async function setup() {

  const IERC20ABI = [
    'function approve(address, uint) external returns (bool)',
    'function transfer(address, uint) external returns (bool)',
  ];

  this.reserve = new ethers.Contract(reserveAddress, IERC20ABI, provider);

  const Reserve = await ethers.getContractFactory('IERC20');
  this.reserve = await Reserve.attach(reserveAddress);

  const Vault = await ethers.getContractFactory('Vault');
  this.vault = await Vault.deploy(reserveAddress, nexusAddress, overrides);
  await this.vault.deployed();

  const Contribute = await ethers.getContractFactory('ContributeMock');
  this.contribute = await Contribute.deploy(this.vault.address, overrides);
  await this.contribute.deployed();
  console.log('Contribute deployed to:', this.contribute.address);

  await approveAll(this.contribute, this.reserve);
}

async function invest(contribute) {
  this.value = ethers.utils.parseEther('10');
  await contribute.connect(Alice).invest(this.value, overrides);
  await contribute.connect(Bob).invest(this.value, overrides);
  let tx = await contribute.connect(Charlie).invest(this.value, overrides);
  await tx.wait(1);
}

async function main() {
  await setup();
  let tx = await this.contribute.finishMintEvent();
  await tx.wait(1);
  await invest(this.contribute);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
