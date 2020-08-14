const { expect } = require("chai");
const timeMachine = require("ganache-time-traveler");
const curve = require("./utils.js");

const duration = 259200;

let Alice;
let Bob;
let Charlie;
let savings, mUSD, vault, contribute, genesis, nexus;

const deployment = async () => {
  const accounts = await ethers.getSigners();
  Alice = accounts[0];
  Bob = accounts[1];
  Charlie = accounts[2];

  const reserveSupply = ethers.utils.parseEther("10000000000");
  const deployer = await Alice.getAddress();
  const MUSD = await ethers.getContractFactory("MUSDMock");
  mUSD = await MUSD.deploy(deployer, reserveSupply);
  await mUSD.deployed();

  const Nexus = await ethers.getContractFactory("NexusMock");
  nexus = await Nexus.deploy(mUSD.address);
  await nexus.deployed();

  const Vault = await ethers.getContractFactory("MStableLendMock");
  vault = await Vault.deploy(mUSD.address, nexus.address);
  await vault.deployed();

  const Contribute = await ethers.getContractFactory("ContributeMock");
  contribute = await Contribute.deploy(vault.address);
  await contribute.deployed();

  const savingsAddress = await vault.savingsContract();
  savings = await ethers.getContractAt("SavingsContractMock", savingsAddress);

  const tribAddress = await contribute.token();
  trib = await ethers.getContractAt("Trib", tribAddress);

  const genesisAddress = await contribute.genesis();
  genesis = await ethers.getContractAt("Genesis", genesisAddress);

  const nexusAddress = await vault.nexusGovernace();
  nexus = await ethers.getContractAt("NexusMock", nexusAddress);

  const value = ethers.utils.parseEther("10000000000");
  await mUSD.approve(genesis.address, value);
}

describe("Testing Genesis Mint Event" , async () => {

  const aliceInv = ethers.utils.parseEther("10");
  const bobInv = ethers.utils.parseEther("10");
  const charlieInv = ethers.utils.parseEther("10")
  const totalInvested = aliceInv.add(bobInv).add(charlieInv);

  before(async () => {
    await deployment();
  })

  it("Should have minted mUSD tokens", async () => {
    const value = ethers.utils.parseEther("10000000000");
    expect(await mUSD.balanceOf(Alice.getAddress())).to.equal(value);
  })

  it("Should not allow less than minimum investment", async () => {
    const value = ethers.utils.bigNumberify("1");
    await expect(genesis.deposit(value)).to.be.revertedWith("Minimum contribution is 0.01");
  })

  it("Should accept Alice investment", async () => {
    const value = aliceInv;
    const address = await Alice.getAddress();
    await expect(genesis.deposit(value)).to.emit(genesis, 'Deposit').withArgs(address, value);
    expect(await genesis.getBalance(address)).to.equal(value);
  })

  it("Should accept Bob investment", async () => {
    const value = bobInv;
    const address = await Bob.getAddress();
    await mUSD.transfer(address, value);
    await mUSD.connect(Bob).approve(genesis.address, value);
    await genesis.connect(Bob).deposit(value);
    expect(await genesis.getBalance(address)).to.equal(value);
  })

  it("Should accept Charlie investment", async () => {
    const value = charlieInv;
    const address = await Charlie.getAddress();
    await mUSD.transfer(address, value);
    await mUSD.connect(Charlie).approve(genesis.address, value);
    await genesis.connect(Charlie).deposit(value);
    expect(await genesis.getBalance(address)).to.equal(value);
  })

  it("Should have the correct reserve in Contribute", async () => {
    expect(await contribute.genesisReserve()).to.equal(totalInvested);
    expect(await contribute.totalReserve()).to.equal(totalInvested);
  })

  it("Should have the correct balance in the savings account", async () => {
    const savings = await vault.getBalance();
    // Division by 100 to account for rounding errors.
    expect(await savings.div(100)).to.equal(totalInvested.div(100));
  })

  it("Should have minted the correct amount of TRIB", async () => {
    const zero = ethers.utils.bigNumberify("0");
    const tribSupply = curve.calculateReserveToTokens(totalInvested,zero,zero);
    expect(await contribute.getTotalSupply()).to.equal(tribSupply);
  })

  it("Should not allow claim before event is over", async () => {
    await expect(genesis.claim()).to.be.revertedWith("GME not over");
  })

  it("Should not allow concludeGME to be called before GME is over", async () => {
    await expect(genesis.concludeGME()).to.be.revertedWith("GME not over");
  })

  it("Should calculate the correct share of TRIB", async () => {
    const totalGenesisSupply = await genesis.totalTokensReceived();
    const shareAlice = aliceInv.mul(totalGenesisSupply);
    const tribAlice = shareAlice.div(totalInvested);
    const genesisAliceShare = await genesis.getShare(Alice.getAddress());
    // Division by 100 to account for rounding errors.
    expect(tribAlice.div(100)).to.equal(genesisAliceShare.div(100));
  })


  it("Total shares should equal total genesis balance", async () => {
    const alice = await Alice.getAddress();
    const bob = await Bob.getAddress();
    const charlie = await Charlie.getAddress();
    const aliceShare = await genesis.getShare(alice);
    const bobShare = await genesis.getShare(bob);
    const charlieShare = await genesis.getShare(charlie);
    const totalTribSupply = await genesis.totalTokenBalance();
    // Division by 100 to account for rounding errors.
    expect(totalTribSupply.div('100')).to.equal(aliceShare.add(bobShare).add(charlieShare).div('100'));
  })

  it('Should stop accepting deposits after GME is over', async () => {
    const value = ethers.utils.parseEther("1000");
    await timeMachine.advanceTimeAndBlock(duration+1);
    await expect(genesis.deposit(value)).to.be.revertedWith("GME is over");
  });

  it('Should have set the correct average price', async () => {
    let totalSupply = await genesis.totalTokenBalance();
    let averagePrice = totalInvested.mul(ethers.utils.parseEther("1")).div(totalSupply);
    expect(await contribute.genesisAveragePrice()).to.equal(averagePrice);
  })

  it('Should allow claims after GME is over', async () => {
    const alice = await Alice.getAddress()
    const share = await genesis.getShare(alice);
    await genesis.claim();
    expect(await share).to.equal(await contribute.tokenBalance(alice));
  })

  it('Should calculate shares correctly after first claim', async () => {
    const totalGenesisSupply = await genesis.totalTokensReceived();
    const bobShare = bobInv.mul(totalGenesisSupply);
    const bobTrib = bobShare.div(totalInvested);
    const bob = await Bob.getAddress();
    const share = await genesis.getShare(bob);
    await genesis.connect(Bob).claim();
    expect(await share).to.equal(await contribute.tokenBalance(bob));
  })

  it('Should revert claim if user has no tokens', async () => {
    await expect(genesis.claim()).to.be.revertedWith("No tokens to claim");
  })

  it('Should allow anyone to conclude GME', async () => {
    await genesis.concludeGME();
    expect(await contribute.GME()).to.equal(false);
  })

  it('Should not allow to conclude GME twice', async () => {
    await expect(genesis.concludeGME()).to.be.revertedWith("Genesis Mint Event is over");
  })

  it('Genesis should have 0 Trib after all claims', async () => {
    await genesis.connect(Charlie).claim();
    expect(await genesis.totalTokenBalance()).to.equal(0);
  })

  it('Total Received in genesis should equal total distributed', async () => {
    const tribA = await trib.balanceOf(Alice.getAddress());
    const tribB = await trib.balanceOf(Bob.getAddress());
    const tribC = await trib.balanceOf(Charlie.getAddress());
    const tribSum = tribA.add(tribB).add(tribC);
    expect(await genesis.totalTokensReceived()).to.equal(tribSum);
  })
});

describe("Testing Contribute functionality before Genesis", async () => {

  const aliceInv = ethers.utils.parseEther("10");
  const bobInv = ethers.utils.parseEther("10");
  const charlieInv = ethers.utils.parseEther("10");
  const totalInvested = aliceInv.add(bobInv).add(charlieInv);

  before(async () => {
    await deployment();
  })

  it('Should not allow direct investments before GME is over', async () => {
    await expect(contribute.invest(aliceInv)).to.be.revertedWith("Genesis Mint Event is not over");
  })

  it('Should not allow to claim interest', async () => {
    await expect(contribute.claimInterest()).to.be.reverted;
  })

});

const simulateGenesis = async () => {

  const value = ethers.utils.parseEther("100000");
  const aliceInv = ethers.utils.parseEther("10");
  const bobInv = ethers.utils.parseEther("10");
  const charlieInv = ethers.utils.parseEther("10");

  await mUSD.transfer(Bob.getAddress(), value);
  await mUSD.transfer(Charlie.getAddress(), value);

  await mUSD.approve(genesis.address, value);
  await mUSD.connect(Bob).approve(genesis.address, value);
  await mUSD.connect(Charlie).approve(genesis.address, value);

  await mUSD.approve(contribute.address, value);
  await mUSD.connect(Bob).approve(contribute.address, value);
  await mUSD.connect(Charlie).approve(contribute.address, value);

  await genesis.deposit(aliceInv);
  await genesis.connect(Bob).deposit(bobInv);
  await genesis.connect(Charlie).deposit(charlieInv);

  await timeMachine.advanceTimeAndBlock(duration+1);
  await genesis.concludeGME();

  await genesis.claim();
  await genesis.connect(Bob).claim();
  await genesis.connect(Charlie).claim();

}

describe("Testing Contribute functionality after Genesis", async () => {

  before(async () => {
    await deployment();
    await simulateGenesis();
  })

  it('Should be able to sell all tokens', async () => {
    const address = Alice.getAddress();
    const tribAmount = await trib.balanceOf(address);
    const beforeBalance = await mUSD.balanceOf(address);
    const reserve = await contribute.getTokensToReserveTaxed(tribAmount);
    await contribute.sell(tribAmount);
    const afterBalance = await mUSD.balanceOf(address);
    // Division by 100 to account for rounding errors.
    expect(beforeBalance.add(reserve).div(10)).to.equal(afterBalance.div(10));
  })

  it('Should not be able to sell more tokens than balance', async () => {
    const address = Bob.getAddress();
    const tribAmount = (await trib.balanceOf(address)).add(1);
    const beforeBalance = await mUSD.balanceOf(address);
    const reserve = await contribute.getTokensToReserveTaxed(tribAmount);
    await expect(contribute.connect(Bob).sell(tribAmount)).to.be.reverted;
  })

  it('Should invest some amount', async () => {
    const address = Alice.getAddress();
    const amount = ethers.utils.parseEther('1000');
    const tokens = await contribute.getReserveToTokensTaxed(amount);
    await contribute.invest(amount);
    expect(await trib.balanceOf(address)).to.equal(tokens);
  })

  it('Should add interest', async () => {
    const beforeBalance = await savings.totalSavings();
    const amount = ethers.utils.parseEther("100");
    await mUSD.approve(savings.address, amount);
    await savings.depositInterest(amount);
    expect(await savings.totalSavings()).to.equal(beforeBalance.add(amount));
  })

  it('Should be able to claim interest', async () => {
    const address = Alice.getAddress();
    const interest = await contribute.getInterest();
    const required = await contribute.totalClaimRequired();
    const beforeBalance = await mUSD.balanceOf(address);
    const reserve = await contribute.getTokensToReserveTaxed(required);
    await contribute.claimInterest();
    expect(beforeBalance.add(reserve).add(interest)).to.equal(await mUSD.balanceOf(address));
  })

  it('Should revert if Savings Manager is not changed', async ()=> {
    await expect(vault.migrateSavings()).to.be.revertedWith('Already using latest Savings Contract');
  })

  it('Should change the Savings Manager from Nexus Governance', async ()=> {
    const SM = await nexus.SM();
    const reserveBalance = await vault.getBalance();
    await nexus.createNewSM(mUSD.address);
    await vault.migrateSavings();
    const newBalance = await vault.getBalance();
    expect(reserveBalance).to.equal(newBalance);
  })

  it('Should not allow redeem from vault if user has no deposits', async ()=> {
    const value = ethers.utils.parseEther('1');
    await expect(vault.redeem(value)).to.be.revertedWith('Not enough funds');
  })

});
