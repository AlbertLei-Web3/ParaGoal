// Wallet context for global state management
// English: Provides wallet connection state and account info across the app
import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { web3Enable, web3Accounts, web3AccountsSubscribe } from '@polkadot/extension-dapp';

// 注：Substrate/Polkadot 扩展没有“全局选中账号”的统一规范，
// 我们在应用侧维护“当前选中账号”，并在账户变动时进行合理的回退/保留。
// English: There is no standard "globally selected account" across Substrate extensions.
// We keep an app-side selected account and reconcile it on account list updates.

// Wallet context
const WalletContext = createContext()

export function WalletProvider({ children }) {
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [api, setApi] = useState(null)

  // 保存当前选中账号引用，避免订阅回调闭包读到旧值
  // English: Keep a ref of currently selected account to avoid stale closure in subscription callbacks
  const selectedRef = useRef(null)
  useEffect(() => {
    selectedRef.current = selectedAccount
  }, [selectedAccount])

  // 本地持久化键名
  // English: Local persistence key name
  const STORAGE_KEY = 'paragoal:selectedAddress'

  // 应用初始化：启用扩展、拉取账户、恢复持久化、监听账户变化
  // English: App init — enable extensions, fetch accounts, restore persisted selection, subscribe to changes
  useEffect(() => {
    let unsubscribe;
    (async () => {
      try {
        await web3Enable('ParaGoal')
        const initialAccounts = await web3Accounts()
        setAccounts(initialAccounts)

        const persisted = localStorage.getItem(STORAGE_KEY)
        const hasPersisted = persisted && initialAccounts.some(acc => acc.address === persisted)
        if (hasPersisted) {
          const acc = initialAccounts.find(acc => acc.address === persisted)
          setSelectedAccount(acc)
        } else if (initialAccounts.length > 0) {
          setSelectedAccount(initialAccounts[0])
        } else {
          setSelectedAccount(null)
        }
        setIsConnected(initialAccounts.length > 0)

        // 订阅账户变化：新增/删除/重命名/排序变化等
        // English: Subscribe to account list changes
        unsubscribe = await web3AccountsSubscribe((injectedAccounts) => {
          setAccounts(injectedAccounts)

          if (injectedAccounts.length === 0) {
            setSelectedAccount(null)
            setIsConnected(false)
            return
          }

          const persistedAddr = localStorage.getItem(STORAGE_KEY)
          const preferred = persistedAddr && injectedAccounts.find(acc => acc.address === persistedAddr)
          const prev = selectedRef.current
          const prevStillExists = prev && injectedAccounts.some(acc => acc.address === prev.address)

          if (preferred) {
            setSelectedAccount(preferred)
          } else if (prevStillExists) {
            // 保留之前的选择
            // English: keep previous selection
            setSelectedAccount(prev)
          } else {
            // 回退到第一个可用账户
            // English: fallback to the first available account
            setSelectedAccount(injectedAccounts[0])
          }
          setIsConnected(true)
        })
      } catch (error) {
        console.error('初始化钱包失败 / Failed to initialize wallet:', error)
        setAccounts([])
        setSelectedAccount(null)
        setIsConnected(false)
      }
    })()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const connect = async () => {
    try {
      // 启用扩展并获取账户（兼容 Talisman / SubWallet / Polkadot{.js} 等）
      // English: Enable extensions and fetch accounts (works with Talisman / SubWallet / Polkadot{.js} ...)
      const extensions = await web3Enable('ParaGoal');
      if (extensions.length === 0) {
        alert('未检测到 Polkadot 浏览器钱包扩展。请安装 Talisman/SubWallet/Polkadot{.js} 后重试。\nNo Polkadot extension detected. Please install Talisman/SubWallet/Polkadot{.js}.');
        return;
      }

      // 获取所有账户
      // English: Get all accounts
      const allAccounts = await web3Accounts();

      setAccounts(allAccounts);
      if (allAccounts.length > 0) {
        // 优先恢复持久化选择
        // English: Prefer restoring persisted selection
        const persisted = localStorage.getItem(STORAGE_KEY)
        const preferred = persisted && allAccounts.find(acc => acc.address === persisted)
        setSelectedAccount(preferred || allAccounts[0]);
        setIsConnected(true);
      } else {
        alert('未找到任何账户。请在钱包扩展中创建或导入账户。\nNo accounts found. Please create/import an account in your extension.');
      }
    } catch (err) {
      console.error('连接钱包错误 / Connect wallet error:', err);
      alert('连接钱包失败。请重试。 / Failed to connect wallet. Please try again.');
    }
  };

  const disconnect = () => {
    // 仅清除应用侧的选择与持久化；浏览器扩展不会真正“断开连接”
    // English: Clear app-side selection and persistence; browser extensions do not truly "disconnect"
    setSelectedAccount(null);
    setIsConnected(false);
    setAccounts([]);
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
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
      if (account) {
        setSelectedAccount(account);
        try { localStorage.setItem(STORAGE_KEY, account.address) } catch {}
        if (!isConnected) setIsConnected(true)
      }
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

