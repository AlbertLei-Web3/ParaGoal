// web3Client.js - 简化的Polkadot API连接
// Chinese: 负责创建与缓存 ApiPromise 实例，并在连接后检测链是否支持 pallet-contracts。
// English: Creates and caches ApiPromise instance and validates runtime supports pallet-contracts.
import { ApiPromise, WsProvider } from '@polkadot/api';

let apiInstance = null;

export async function getApi() {
  // 如果API实例已存在，直接返回
  // English: If API instance already exists, return it directly
  if (apiInstance) {
    return apiInstance;
  }

  try {
    // 获取RPC URL，从环境变量中读取，如果未设置则使用钱包截图中的RPC端点
    // English: Get RPC URL from environment, default to RPC endpoint from wallet screenshot
    const rpc = import.meta.env.VITE_PUBLIC_RPC_URL || 'wss://asset-hub-paseo-rpc.dwellir.com';
    
    // 创建WebSocket提供者
    // English: Create WebSocket provider
    const provider = new WsProvider(rpc);
    
    // 创建并缓存ApiPromise实例，允许与链交互
    // English: Create and cache ApiPromise instance for chain interactions
    apiInstance = await ApiPromise.create({ provider });

    // 运行时能力检测：是否支持 pallet-contracts
    // Runtime capability check: pallet-contracts is required for ink! contract calls
    const hasContractsPallet = !!(apiInstance.tx && apiInstance.tx.contracts && apiInstance.query && apiInstance.query.contracts);
    if (!hasContractsPallet) {
      const msg = [
        '当前 RPC 节点不支持 pallet-contracts，因此无法调用 Ink! 合约。',
        '请将 .env 中的 VITE_PUBLIC_RPC_URL 指向部署合约所在的“Contracts”平行链 RPC。',
        '例如：Paseo Contracts Parachain 的 RPC（请使用你实际部署网络的RPC）。',
        'This RPC does not expose pallet-contracts. Ink! contract calls are unavailable.',
        'Please set VITE_PUBLIC_RPC_URL in .env to the RPC of the Contracts parachain where your contract is deployed.'
      ].join('\n');
      console.error(msg);
      throw new Error(msg);
    }

    return apiInstance;
  } catch (error) {
    console.error('API连接错误 / API connection error:', error);
    throw error;
  }
}


