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

### Ropsten

Contribute requires [mUSD](https://docs.mstable.org/protocol/deployed-addresses) from the Ropsten testnet in order to be deployed.

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

Load the first three accounts with Ropsten Eth from the [faucet](https://faucet.ropsten.be/) and ask for at least 30 Ropsten mUSD at the [mStable Discord](https://discord.gg/pgCVG7e).

After you have distributed 10 mUSD to the first three deploy on Ropsten with

```bash
npm run deploy:test
```

### Mainnet

Deploy to the Ethereum mainnet with

```bash
npm run deploy:main
```

## License

MIT
