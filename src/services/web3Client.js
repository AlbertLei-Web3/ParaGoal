// web3Client.js - 简化的Polkadot API连接
// English: Simplified Polkadot API connection for Paseo testnet
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
    return apiInstance;
  } catch (error) {
    console.error('API连接错误 / API connection error:', error);
    throw error;
  }
}


