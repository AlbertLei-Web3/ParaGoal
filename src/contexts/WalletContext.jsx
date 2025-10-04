// Wallet context for global state management
// English: Provides wallet connection state and account info across the app
import React, { createContext, useContext, useState, useEffect } from 'react'
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { ApiPromise, WsProvider } from '@polkadot/api';

// Paseo Asset Hub 测试网配置（已验证）
// English: Paseo Asset Hub testnet configuration (verified)
const paseoAssetHub = {
  id: 1111, // Paseo Asset Hub 链ID
  name: 'Paseo Asset Hub',
  network: 'paseo-asset-hub',
  nativeCurrency: {
    decimals: 18,
    name: 'PAS',
    symbol: 'PAS',
  },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_PUBLIC_RPC_URL || 'https://testnet-passet-hub-eth-rpc.polkadot.io'] },
    public: { http: [import.meta.env.VITE_PUBLIC_RPC_URL || 'https://testnet-passet-hub-eth-rpc.polkadot.io'] },
  },
  blockExplorers: {
    default: { name: 'Paseo Asset Hub Explorer', url: 'https://paseo-asset-hub.subscan.io' },
  },
  testnet: true,
}

// Wallet context
const WalletContext = createContext()

export function WalletProvider({ children }) {
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [api, setApi] = useState(null)

  const connect = async () => {
    try {
      // 启用扩展并获取Talisman账户
      // English: Enable extensions and get Talisman accounts
      const extensions = await web3Enable('ParaGoal');
      if (extensions.length === 0) {
        alert('未找到Polkadot扩展。请安装Talisman。 / No Polkadot extensions found. Please install Talisman.');
        return;
      }

      // 获取所有账户
      // English: Get all accounts
      const allAccounts = await web3Accounts();
      
      // 过滤Talisman账户
      // English: Filter Talisman accounts
      const talismanAccounts = allAccounts.filter(acc => acc.meta.source === 'talisman');
      
      setAccounts(talismanAccounts);
      if (talismanAccounts.length > 0) {
        setSelectedAccount(talismanAccounts[0]);
        setIsConnected(true);
      } else {
        alert('未找到Talisman账户。请确保已导入账户。 / No Talisman accounts found. Please ensure accounts are imported.');
      }
    } catch (err) {
      console.error('连接钱包错误 / Connect wallet error:', err);
      alert('连接钱包失败。请重试。 / Failed to connect wallet. Please try again.');
    }
  };

  const disconnect = () => {
    setSelectedAccount(null);
    setIsConnected(false);
    setAccounts([]);
  };

  const value = {
    address: selectedAccount?.address,
    isConnected,
    isCorrectNetwork: true, // Assume correct for Substrate
    connect,
    accounts,
    selectedAccount,
    api,
    disconnect,
  }

  // 直接渲染子组件，不阻塞应用启动
  // English: Render children directly without blocking app startup
  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

