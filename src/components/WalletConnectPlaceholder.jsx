// Real wallet connection component
// English: Connects to EVM wallets using wagmi
import React from 'react'
import { FaWallet, FaCheck, FaExclamationTriangle } from 'react-icons/fa'
import { useWallet } from '../contexts/WalletContext'

export function WalletConnectPlaceholder() {
  const { 
    address, 
    isConnected, 
    isCorrectNetwork, 
    connect, 
    accounts, // Changed from connectors
    disconnect,
    switchAccount
  } = useWallet()

  // 如果网络不正确，显示警告组件
  // English: If network is incorrect, show warning component
  if (!isCorrectNetwork) {
    return (
      <div className="flex items-center px-4 py-2 bg-yellow-600 rounded-full text-white">
        <FaExclamationTriangle className="mr-2" />
        Switch to Paseo Testnet
      </div>
    )
  }

  // 如果已连接，显示断开按钮
  // English: If connected, show disconnect button
  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        {accounts.length > 1 && (
          <select
            value={address}
            onChange={(e) => switchAccount(e.target.value)}
            className="px-2 py-1 bg-slate-800 text-white rounded"
          >
            {accounts.map(acc => (
              <option key={acc.address} value={acc.address}>
                {acc.meta.name || 'Unnamed'} ({acc.address.slice(0,6)}...{acc.address.slice(-4)})
              </option>
            ))}
          </select>
        )}
        <button
          onClick={() => disconnect()}
          className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full text-white"
        >
          <FaWallet className="mr-2" />
          Disconnect {address ? `(${address.slice(0,6)}...${address.slice(-4)})` : ''}
        </button>
      </div>
    )
  }

  // 如果未连接，显示连接按钮（通用文案）
  // English: If not connected, show a generic "Connect Wallet" button
  return (
    <button
      onClick={() => connect()}
      className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white"
    >
      <FaWallet className="mr-2" />
      Connect Wallet
    </button>
  )
}

// 网络检查逻辑已移至组件函数内部
// English: Network check logic moved inside component function


