// ParaGoal 智能合约配置（Paseo Asset Hub测试网）
// English: ParaGoal smart contract configuration (Paseo Asset Hub testnet)
// 基于用户提供的正确网络参数配置
// English: Based on user-provided correct network parameters

// 合约地址（部署后填写）
// English: Contract address (fill after deployment)
export const CONTRACT_ADDRESS = import.meta.env.VITE_PUBLIC_CONTRACT_ADDRESS || ''

// 合约ABI（部署后填写）
// English: Contract ABI (fill after deployment)
// IMPORTANT: 将部署后的Solidity合约ABI粘贴到这里作为JS数组
// English: IMPORTANT: Paste your deployed Solidity contract ABI here as a JS array
export const CONTRACT_ABI = []

// 网络配置信息
// English: Network configuration info
export const NETWORK_CONFIG = {
  name: 'Paseo Asset Hub',
  chainId: 1111,
  nativeCurrency: {
    name: 'PAS',
    symbol: 'PAS',
    decimals: 18
  },
  rpcUrl: import.meta.env.VITE_PUBLIC_RPC_URL || 'wss://testnet-passet-hub.polkadot.io',
  ethRpcUrl: import.meta.env.VITE_PUBLIC_ETH_RPC_URL || 'https://testnet-passet-hub-eth-rpc.polkadot.io'
}

// 可选的函数名称，用于/test页面测试（无需修改代码）
// English: Optional function names to drive the /test page without editing code
export const WRITE_FUNC = import.meta.env.VITE_PUBLIC_WRITE_FUNC || ''
export const READ_FUNC = import.meta.env.VITE_PUBLIC_READ_FUNC || ''

// 浏览器URL（Paseo Asset Hub Subscan）
// English: Explorer URL (Paseo Asset Hub Subscan)
export const EXPLORER_BASE_URL = import.meta.env.VITE_PUBLIC_EXPLORER_URL || 'https://paseo-asset-hub.subscan.io'


