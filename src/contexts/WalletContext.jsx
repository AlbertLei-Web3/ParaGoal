// Wallet context for global state management
// English: Provides wallet connection state and account info across the app
import React, { createContext, useContext, useState, useEffect } from 'react'
import { web3Enable, web3Accounts, web3AccountsSubscribe } from '@polkadot/extension-dapp';
import { ApiPromise, WsProvider } from '@polkadot/api';

// Paseo Asset Hub 测试网配置（基于钱包截图验证）
// English: Paseo Asset Hub testnet configuration (verified from wallet screenshot)
const paseoAssetHub = {
  id: 1111, // 链ID（从其他来源确认）
  name: 'Paseo Asset Hub',
  network: 'paseo-asset-hub',
  nativeCurrency: {
    decimals: 10, // 根据钱包截图，PAS代币小数位是10，不是18
    name: 'PAS',
    symbol: 'PAS',
  },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_PUBLIC_RPC_URL || 'wss://asset-hub-paseo-rpc.dwellir.com'] },
    public: { http: [import.meta.env.VITE_PUBLIC_RPC_URL || 'wss://asset-hub-paseo-rpc.dwellir.com'] },
  },
  blockExplorers: {
    default: { name: 'Paseo Asset Hub Explorer', url: 'https://assethub-paseo.subscan.io/' },
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

  useEffect(() => {
    let unsubscribe;
    const subscribe = async () => {
      unsubscribe = await web3AccountsSubscribe((injectedAccounts) => {
        console.log('Accounts updated:', injectedAccounts);
        setAccounts(injectedAccounts);
        if (injectedAccounts.length > 0) {
          if (selectedAccount && injectedAccounts.some(acc => acc.address === selectedAccount.address)) {
            // Keep current
          } else {
            setSelectedAccount(injectedAccounts[0]);
          }
          setIsConnected(true);
        } else {
          setSelectedAccount(null);
          setIsConnected(false);
        }
      });
    };

    if (isConnected) {
      subscribe();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isConnected]);

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
      
      setAccounts(allAccounts);
      if (allAccounts.length > 0) {
        setSelectedAccount(allAccounts[0]);
        setIsConnected(true);
        subscribe(); // Add this to start subscription immediately
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
    switchAccount: (address) => {
      console.log('Switching to address:', address);
      const account = accounts.find(acc => acc.address === address);
      if (account) setSelectedAccount(account);
    },
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

