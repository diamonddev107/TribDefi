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

## License

MIT
