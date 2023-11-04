require('@nomicfoundation/hardhat-toolbox');

require('dotenv').config();

module.exports = {
  solidity: {
    version: '0.8.18',
    settings: {
      optimizer: { enabled: true, runs: 5000 },
    },
  },
  networks: {
    polygonzk: {
      url: `https://rpc.public.zkevm-test.net`,
      accounts: [process.env.POLYGONZK_DEPLOYER_PRIVATE_KEY],
    },
    /*     mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.MUMBAI_ALCHEMY_KEY}`,
      accounts: [process.env.MUMBAI_DEPLOYER_PRIVATE_KEY],
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPOLIA_ALCHEMY_KEY}`,
      accounts: [process.env.SEPOLIA_DEPLOYER_PRIVATE_KEY],
    }, */
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    hardhat: {
      mining: {
        auto: true,
        interval: 1000,
      },
    },
  },
  paths: {
    sources: './circuits/contract/noirstarter',
  },
};
