usePlugin("@nomiclabs/buidler-waffle");
usePlugin("@nomiclabs/buidler-web3");

const fs = require('fs');
const mnemonic = fs.readFileSync(".private").toString().trim();
// This is a sample Buidler task. To learn how to create your own go to
// https://buidler.dev/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.getAddress());
  }
});

// You have to export an object to set up your config
// This object can have the following optional entries:
// defaultNetwork, networks, solc, and paths.
// Go to https://buidler.dev/config/ to learn more
module.exports = {
  mocha: {
     timeout: 50000,
  },
  // This is a sample solc configuration that specifies which version of solc to use
  solc: {
    version: "0.6.6",
  },
  networks: {
    mainnet: {
      url: "https://mainnet.infura.io/v3/13749734f374422692b1699e51b0877f",
      chainId: 1,
      gas: "auto",
      gasPrice: "auto",
      accounts: {
        mnemonic: mnemonic,
        path: "m/44'/60'/0'/0",
      },
    },
    ropsten: {
      url: "https://ropsten.infura.io/v3/13749734f374422692b1699e51b0877f",
      chainId: 3,
      gas: "auto",
      gasPrice: "auto",
      accounts: {
        mnemonic: mnemonic,
        path: "m/44'/60'/0'/0",
      },
    },
  },
};
