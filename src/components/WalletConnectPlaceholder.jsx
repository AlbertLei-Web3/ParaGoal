// 钱包连接占位按钮（中英文注释）
// Chinese: 仅作 UI 展示，不发起真实连接。
// English: UI-only placeholder, does not initiate real wallet connection.
import React from 'react'
import { FaWallet } from 'react-icons/fa'

export function WalletConnectPlaceholder() {
  return (
    <button
      className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-2"
      title="占位：后续接入EVM钱包"
    >
      <FaWallet />
      连接钱包（占位）
    </button>
  )
}


