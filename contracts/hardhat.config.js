// ParaGoal智能合约部署配置 - Polkadot Paseo测试网
// English: ParaGoal smart contract deployment configuration - Polkadot Paseo testnet

require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Paseo Asset Hub测试网配置
    // English: Paseo Asset Hub testnet configuration
    paseo: {
      url: process.env.RPC_URL || "https://testnet-passet-hub-eth-rpc.polkadot.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1111,
      gas: "auto",
      gasPrice: "auto"
    },
    // 本地开发网络
    // English: Local development network
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    }
  },
  etherscan: {
    apiKey: {
      paseo: "your-api-key-here" // 如果需要验证合约 / If contract verification is needed
    },
    customChains: [
      {
        network: "paseo",
        chainId: 1111,
        urls: {
          apiURL: "https://assethub-paseo.subscan.io/api",
          browserURL: "https://assethub-paseo.subscan.io"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
