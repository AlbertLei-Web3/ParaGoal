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
    connectors, 
    isPending, 
    disconnect 
  } = useWallet()

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-2"
      >
        <FaWallet />
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    )
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending}
      className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2"
    >
      <FaWallet />
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}


