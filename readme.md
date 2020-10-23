# Contribute

A capital coordination tool that pushes the boundaries of DeFi.

For a detailed explanation of how the system works refer to the [whitepaper](https://ipfs.io/ipfs/QmPMuKKXTpJ3jQCJ2Eh6cnnUqUGFKXNgUiwAyJ9bcZLtpm).

## Getting Started

These instructions will get a copy of the project up and running on your local machine for development and testing purposes.

### Installation

Make sure to install all project dependencies

```bash
npm install
```

## Running the tests

After installing all the dependencies just run the tests with

```bash
npm run test
```

## Deployment

### Kovan

#### Instructions

Make sure to generate a [BIP-039](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) + [BIP-044](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) wallet utilizing a random mnemonic phrase and save the mnemonic phrase as `.private` in the root of your main working folder.

Start the buidler console in your CLI with
```bash
npx buidler console
```

and generate the wallet using [Ethers.js](https://docs.ethers.io/v4/index.html) with

```javascript
let randomWallet = ethers.Wallet.createRandom();

```

Load the account with Kovan Eth from the [faucet](https://faucet.kovan.network/).


```bash
npm run deploy:kovan
```

### Mainnet

Deploy to the Ethereum mainnet with

```bash
npm run deploy:main
```

## Deployed contracts

### Mainnet

Vault - 0xdA1fD36cfC50ED03ca4dd388858A78C904379fb3

Genesis - 0xf48d1FfBed1D9b87cC0B4410d16230B35BdFC28A

Contribute - 0x0DdfE92234b9DCA2de799736bBBa1D2F25CFC3b8

Trib Token - 0xe09216F1d343Dd39D6Aa732a08036fee48555Af0

## Audit Report

The Contribute smart contract audit was done by [Certik](https://certik.io/).

The full audit report can be found [here](https://github.com/Contribute-Defi/contracts/blob/master/audit/Certik-Contribute-Audit.pdf).

## License

MIT
