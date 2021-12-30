# TribDefi

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
